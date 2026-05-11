import { z } from "zod";

import { BRAND } from "@/data/brand";
import { getGeminiClient } from "@/lib/ai/gemini";
import { getGenerationLimits } from "@/lib/interview-kit/generation-limits";
import { getSectionStyle, slugifySectionTitle } from "@/lib/interview-kit/section-style";
import { logger } from "@/lib/logger";
import type {
  CandidateProfile,
  ConsistencyIssue,
  ConsistencySummary,
  GeneratedPrepKitPayload,
  GeneratedSection,
  OnboardingProfile,
  UserPlan,
} from "@/types/prep-kit";

function limitedStringArray(min: number, max: number) {
  return z.preprocess(
    (value) => (Array.isArray(value) ? value.slice(0, max) : value),
    z.array(z.string()).min(min).max(max),
  );
}

function limitedArray<T extends z.ZodType>(schema: T, min: number, max: number) {
  return z.preprocess(
    (value) => (Array.isArray(value) ? value.slice(0, max) : value),
    z.array(schema).min(min).max(max),
  );
}

const candidateProfileSchema = z.object({
  candidateLevel: z.enum(["junior", "mid", "senior"]).catch("mid"),
  resumeCurrentRole: z.string().catch("Unknown role"),
  targetRole: z.string().catch("Interview candidate"),
  strongAreas: limitedStringArray(0, 16),
  weakAreas: limitedStringArray(0, 16),
  likelyInterviewRounds: limitedStringArray(0, 12),
  priorityTopics: limitedStringArray(0, 16),
  extractedSkills: limitedStringArray(0, 32),
  extractedProjects: limitedStringArray(0, 16),
  experienceSummary: z.string().max(1500).catch("Resume analysis completed."),
  yearsOfExperience: z.coerce.number().min(0).max(40).catch(0),
});

const generatedQuestionSchema = z.object({
  question: z.string().catch("Explain one important project from your resume."),
  difficulty: z.enum(["easy", "medium", "hard"]).catch("medium"),
  type: z.enum(["common", "tricky"]).default("common"),
  tags: limitedStringArray(0, 8),
  estimatedMinutes: z.coerce.number().int().min(5).max(30).catch(15),
  whyAsked: z.string().max(800).catch("Interviewers ask this to verify real experience, clarity, and role fit."),
  idealAnswer: z.string().catch("Use your resume context, explain the problem, your role, the tradeoffs, and the measurable outcome."),
  beginnerAnswer: z.string().catch("Start with the project goal, then explain your contribution in simple terms."),
  seniorAnswer: z.string().catch("Frame the answer around ownership, tradeoffs, system impact, and measurable results."),
  followUpQuestions: limitedStringArray(0, 5),
  resumeConnection: z.string().max(800).catch("Connected to the uploaded resume and target role."),
  commonMistakes: limitedStringArray(0, 5),
});

const generatedSectionSchema = z.object({
  title: z.string().catch("Resume-Based Interview Prep"),
  description: z.string().max(800).catch("Questions generated from the uploaded resume and interview context."),
  estimatedHours: z.coerce.number().min(1).max(20).catch(2),
  priorityScore: z.coerce.number().int().min(1).max(100).catch(50),
  questions: limitedArray(generatedQuestionSchema, 0, 10),
});

const generatedKitSchema = z.object({
  candidateProfile: candidateProfileSchema,
  sections: limitedArray(generatedSectionSchema, 1, 12),
});

function trimResumeText(resumeText: string) {
  return resumeText.slice(0, 18000);
}

function parseGeminiJson(text: string) {
  const trimmed = text.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const objectStart = withoutFence.indexOf("{");
  const objectEnd = withoutFence.lastIndexOf("}");

  if (objectStart === -1 || objectEnd === -1 || objectEnd <= objectStart) {
    throw new Error("Gemini returned an empty or invalid JSON response.");
  }

  return JSON.parse(withoutFence.slice(objectStart, objectEnd + 1));
}

function uniqueTrimmed(items: string[], max: number, fallback: string[] = []) {
  const normalized = items
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index)
    .slice(0, max);

  if (normalized.length > 0) {
    return normalized;
  }

  return fallback.slice(0, max);
}

function normalizeRoleText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const roleStopWords = new Set([
  "senior",
  "junior",
  "lead",
  "principal",
  "staff",
  "associate",
  "intern",
  "ii",
  "iii",
  "iv",
]);

function roleTokens(value: string) {
  return normalizeRoleText(value)
    .split(" ")
    .filter((token) => token.length > 2 && !roleStopWords.has(token));
}

function hasTokenOverlap(left: string, right: string) {
  const leftTokens = roleTokens(left);
  const rightTokens = roleTokens(right);

  if (leftTokens.length === 0 || rightTokens.length === 0) {
    return false;
  }

  return leftTokens.some((token) => rightTokens.includes(token));
}

function inferInterviewTypeAlignment(interviewType: OnboardingProfile["interviewType"], skills: string[]) {
  if (
    !interviewType ||
    [
      "role-specific",
      "design",
      "data-analytics",
      "product-management",
      "sales-marketing",
      "finance-accounting",
      "operations",
      "hr-recruiting",
      "leadership-management",
      "behavioral",
    ].includes(interviewType)
  ) {
    return true;
  }

  const normalizedSkills = skills.map((skill) => normalizeRoleText(skill));

  const skillIncludes = (keywords: string[]) => keywords.some((keyword) => normalizedSkills.some((skill) => skill.includes(keyword)));

  if (interviewType === "frontend") {
    return skillIncludes(["react", "frontend", "ui", "javascript", "typescript", "next"]);
  }

  if (interviewType === "backend") {
    return skillIncludes(["node", "backend", "api", "database", "java", "python", "microservice"]);
  }

  if (interviewType === "system-design") {
    return skillIncludes(["architecture", "scaling", "distributed", "performance", "system"]);
  }

  return true;
}

function buildConsistencySummary(candidateProfile: CandidateProfile, onboarding: OnboardingProfile): ConsistencySummary {
  const issues: ConsistencyIssue[] = [];
  const formCurrentRole = onboarding.currentRole?.trim();
  const formTargetRole = onboarding.targetRole?.trim();
  const formYears = onboarding.yearsOfExperience;
  const inferredYears = candidateProfile.yearsOfExperience;

  if (formCurrentRole && candidateProfile.resumeCurrentRole && !hasTokenOverlap(formCurrentRole, candidateProfile.resumeCurrentRole)) {
    issues.push({
      code: "current_role_mismatch",
      severity: "warning",
      title: "Current role and resume signal do not match",
      detail: `Profile says "${formCurrentRole}" but the resume reads closer to "${candidateProfile.resumeCurrentRole}".`,
      recommendation: "Confirm the current role in your profile or upload the matching resume before using this kit for paid preparation.",
    });
  }

  if (formTargetRole && candidateProfile.resumeCurrentRole && !hasTokenOverlap(formTargetRole, candidateProfile.resumeCurrentRole)) {
    issues.push({
      code: "target_role_low_alignment",
      severity: "info",
      title: "Target role is a stretch from the uploaded resume",
      detail: `Target role is "${formTargetRole}" while the resume currently signals "${candidateProfile.resumeCurrentRole}".`,
      recommendation: `${BRAND.productName} will still optimize for the target role, but expect more gap-filling questions and review whether the uploaded resume is the right version.`,
    });
  }

  if (typeof formYears === "number" && Math.abs(formYears - inferredYears) >= 2) {
    issues.push({
      code: "experience_mismatch",
      severity: "warning",
      title: "Years of experience do not align",
      detail: `Profile says ${formYears} year(s), while resume analysis inferred about ${inferredYears} year(s).`,
      recommendation: "Update the form or resume so difficulty calibration stays accurate.",
    });
  }

  if (onboarding.interviewType && !inferInterviewTypeAlignment(onboarding.interviewType, candidateProfile.extractedSkills)) {
    issues.push({
      code: "interview_type_low_alignment",
      severity: "info",
      title: "Interview type has low evidence in the resume",
      detail: `Selected interview type is "${onboarding.interviewType}", but the uploaded resume has limited supporting skill signals.`,
      recommendation: "Keep the interview type if intentional, otherwise switch it to better match the uploaded resume.",
    });
  }

  if (candidateProfile.extractedSkills.length <= 2 || candidateProfile.extractedProjects.length === 0) {
    issues.push({
      code: "resume_low_signal",
      severity: "warning",
      title: "Resume did not provide strong extraction signals",
      detail: `${BRAND.productName} found limited skills or project detail in the uploaded resume, which can reduce question quality.`,
      recommendation: "Upload a more detailed resume version with project bullets, tools, and responsibilities.",
    });
  }

  return {
    hasConflicts: issues.length > 0,
    issues,
  };
}

async function generateKitWithGemini({
  resumeText,
  onboarding,
  plan,
  requestId,
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
  plan: UserPlan;
  requestId?: string;
}) {
  const client = getGeminiClient();
  const limits = getGenerationLimits(plan);
  const prompt = `
You are an expert interview prep strategist.

Goal:
- analyze the candidate and create one complete personalized prep kit
- create exactly ${limits.sectionCount} sections
- create exactly ${limits.totalQuestions} total questions across all sections
- no section may exceed ${limits.maxQuestionsPerSection} questions
- questions must be specific to this user's resume, projects, seniority, tools, and likely interview loops
- questions must not feel generic
- use project-based cross-questions when useful
- include frontend/backend/system design/behavioral balance only if justified by resume and target role

Rules:
- section titles should be concise and marketable
- candidateProfile.extractedSkills max 32 items
- candidateProfile.strongAreas max 16 items
- candidateProfile.weakAreas max 16 items
- candidateProfile.priorityTopics max 16 items
- candidateProfile.extractedProjects max 16 items
- each question tags max 8 items
- each question followUpQuestions max 5 items
- each question commonMistakes max 5 items
- answer text should be practical, interview-ready, and rooted in real production experience
- if resume shows enterprise or leadership work, reflect that strongly
- use years of experience to set difficulty and depth
- infer resumeCurrentRole from the resume itself, not from the form
- infer yearsOfExperience from the resume itself, not from the form
- if target role differs from resume background, still optimize the prep kit for the target role but keep questions anchored to real resume evidence
- resumeConnection must clearly tie to something from the user's actual background
- tags should be useful, short, and lowercase
- commonMistakes should be concrete
- keep the output small and efficient because this runs on a limited test-tier quota

Return only valid JSON.

PLAN:
${plan}

ONBOARDING:
${JSON.stringify(onboarding, null, 2)}

RESUME:
${trimResumeText(resumeText)}
`.trim();

  logger.required.info("ai.gemini.request_started", {
    requestId,
    plan,
    sectionCount: limits.sectionCount,
    totalQuestions: limits.totalQuestions,
    maxQuestionsPerSection: limits.maxQuestionsPerSection,
    resumeCharacters: resumeText.length,
    promptCharacters: prompt.length,
  });

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: "application/json",
    },
  });

  logger.required.info("ai.gemini.response_received", {
    requestId,
    responseCharacters: response.text?.length ?? 0,
  });

  const parsedJson = parseGeminiJson(response.text ?? "");
  const parsedKit = generatedKitSchema.parse(parsedJson);

  logger.required.info("ai.gemini.response_parsed", {
    requestId,
    rawSectionCount: parsedKit.sections.length,
    rawQuestionCount: parsedKit.sections.reduce((sum, section) => sum + section.questions.length, 0),
    rawExtractedSkillsCount: parsedKit.candidateProfile.extractedSkills.length,
  });

  return parsedKit;
}

function normalizeGeneratedSections(
  sections: z.infer<typeof generatedSectionSchema>[],
  plan: UserPlan,
): GeneratedSection[] {
  const limits = getGenerationLimits(plan);
  let totalQuestionsUsed = 0;

  return sections.slice(0, limits.sectionCount).map((section, sectionIndex) => {
    const style = getSectionStyle(section.title);
    const sectionId = style.id || slugifySectionTitle(section.title) || `section-${sectionIndex + 1}`;
    const roomLeft = Math.max(0, limits.totalQuestions - totalQuestionsUsed);
    const limitedQuestions = section.questions
      .filter((question) => question.question.trim().length > 0)
      .slice(0, Math.min(limits.maxQuestionsPerSection, roomLeft));
    totalQuestionsUsed += limitedQuestions.length;

    return {
      id: sectionId,
      title: section.title,
      icon: style.icon,
      color: style.color,
      textColor: style.textColor,
      description: section.description,
      estimatedHours: section.estimatedHours,
      priorityScore: Math.max(1, Math.min(10, Math.round(section.priorityScore / 10) || 1)),
      questions: limitedQuestions.map((question, questionIndex) => ({
        id: `${sectionId}-q${questionIndex + 1}`,
        question: question.question,
        difficulty: question.difficulty,
        type: question.type,
        tags: uniqueTrimmed(question.tags, 8, [sectionId]),
        estimatedMinutes: question.estimatedMinutes,
        whyAsked: question.whyAsked,
        idealAnswer: question.idealAnswer,
        beginnerAnswer: question.beginnerAnswer,
        seniorAnswer: question.seniorAnswer,
        followUpQuestions: uniqueTrimmed(question.followUpQuestions, 5, [
          "Can you explain the tradeoffs?",
          "What would you improve next?",
        ]),
        resumeConnection: question.resumeConnection,
        commonMistakes: uniqueTrimmed(question.commonMistakes, 5, [
          "Answering too generically.",
          "Not connecting the answer to resume evidence.",
        ]),
        isCompleted: false,
        userNotes: "",
      })),
    };
  });
}

function normalizeCandidateProfile(
  candidateProfile: z.infer<typeof candidateProfileSchema>,
  onboarding: OnboardingProfile,
): CandidateProfile {
  const targetRole =
    candidateProfile.targetRole.trim() ||
    onboarding.targetRole?.trim() ||
    onboarding.currentRole?.trim() ||
    "Interview candidate";

  return {
    candidateLevel: candidateProfile.candidateLevel,
    resumeCurrentRole: candidateProfile.resumeCurrentRole.trim() || onboarding.currentRole?.trim() || "Unknown role",
    targetRole,
    strongAreas: uniqueTrimmed(candidateProfile.strongAreas, 8, ["Core strengths still being mapped"]),
    weakAreas: uniqueTrimmed(candidateProfile.weakAreas, 8),
    likelyInterviewRounds: uniqueTrimmed(candidateProfile.likelyInterviewRounds, 8, ["Technical screening"]),
    priorityTopics: uniqueTrimmed(candidateProfile.priorityTopics, 12, ["Role fundamentals"]),
    extractedSkills: uniqueTrimmed(candidateProfile.extractedSkills, 25, ["resume review"]),
    extractedProjects: uniqueTrimmed(candidateProfile.extractedProjects, 12, ["Primary resume project"]),
    experienceSummary: candidateProfile.experienceSummary.trim(),
    yearsOfExperience: candidateProfile.yearsOfExperience,
  };
}

export async function generatePrepKitFromResume({
  resumeText,
  onboarding,
  plan,
  requestId,
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
  plan: UserPlan;
  requestId?: string;
}): Promise<GeneratedPrepKitPayload> {
  const generatedKit = await generateKitWithGemini({
    resumeText,
    onboarding,
    plan,
    requestId,
  });
  const normalizedSections = normalizeGeneratedSections(generatedKit.sections, plan);
  const normalizedCandidateProfile = normalizeCandidateProfile(generatedKit.candidateProfile, onboarding);
  const consistencySummary = buildConsistencySummary(normalizedCandidateProfile, onboarding);

  logger.required.info("kit.normalize.completed", {
    requestId,
    plan,
    sectionCount: normalizedSections.length,
    totalQuestions: normalizedSections.reduce((sum, section) => sum + section.questions.length, 0),
    extractedSkillsCount: normalizedCandidateProfile.extractedSkills.length,
    hasConsistencyConflicts: consistencySummary.hasConflicts,
  });

  return {
    candidateProfile: normalizedCandidateProfile,
    sections: normalizedSections,
    generationMeta: {
      provider: "gemini",
      model: "gemini-2.5-flash",
      generatedFromResume: true,
      plan,
      sectionCount: normalizedSections.length,
      totalQuestions: normalizedSections.reduce((sum, section) => sum + section.questions.length, 0),
      consistencySummary,
    },
  };
}
