import { z } from "zod";

import { getGeminiClient } from "@/lib/ai/gemini";
import { getGenerationLimits } from "@/lib/interview-kit/generation-limits";
import { getSectionStyle, slugifySectionTitle } from "@/lib/interview-kit/section-style";
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
  candidateLevel: z.enum(["junior", "mid", "senior"]),
  resumeCurrentRole: z.string().min(2),
  targetRole: z.string().min(2),
  strongAreas: limitedStringArray(1, 16),
  weakAreas: limitedStringArray(0, 16),
  likelyInterviewRounds: limitedStringArray(1, 12),
  priorityTopics: limitedStringArray(1, 16),
  extractedSkills: limitedStringArray(1, 32),
  extractedProjects: limitedStringArray(1, 16),
  experienceSummary: z.string().min(20).max(1500),
  yearsOfExperience: z.number().min(0).max(40),
});

const generatedQuestionSchema = z.object({
  question: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["common", "tricky"]).default("common"),
  tags: limitedStringArray(1, 8),
  estimatedMinutes: z.number().int().min(5).max(30),
  whyAsked: z.string().min(20).max(800),
  idealAnswer: z.string().min(80),
  beginnerAnswer: z.string().min(40),
  seniorAnswer: z.string().min(60),
  followUpQuestions: limitedStringArray(2, 5),
  resumeConnection: z.string().min(20).max(800),
  commonMistakes: limitedStringArray(2, 5),
});

const generatedSectionSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(20).max(800),
  estimatedHours: z.number().min(1).max(20),
  priorityScore: z.number().int().min(1).max(100),
  questions: limitedArray(generatedQuestionSchema, 1, 10),
});

const generatedKitSchema = z.object({
  candidateProfile: candidateProfileSchema,
  sections: limitedArray(generatedSectionSchema, 1, 12),
});

function buildGeneratedKitJsonSchema() {
  return {
    type: "object",
    properties: {
      candidateProfile: {
        type: "object",
        properties: {
          candidateLevel: { type: "string", enum: ["junior", "mid", "senior"] },
          resumeCurrentRole: { type: "string" },
          targetRole: { type: "string" },
          strongAreas: { type: "array", items: { type: "string" }, maxItems: 16 },
          weakAreas: { type: "array", items: { type: "string" }, maxItems: 16 },
          likelyInterviewRounds: { type: "array", items: { type: "string" }, maxItems: 12 },
          priorityTopics: { type: "array", items: { type: "string" }, maxItems: 16 },
          extractedSkills: { type: "array", items: { type: "string" }, maxItems: 32 },
          extractedProjects: { type: "array", items: { type: "string" }, maxItems: 16 },
          experienceSummary: { type: "string" },
          yearsOfExperience: { type: "number" },
        },
        required: [
          "candidateLevel",
          "resumeCurrentRole",
          "targetRole",
          "strongAreas",
          "weakAreas",
          "likelyInterviewRounds",
          "priorityTopics",
          "extractedSkills",
          "extractedProjects",
          "experienceSummary",
          "yearsOfExperience",
        ],
      },
      sections: {
        type: "array",
        maxItems: 12,
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimatedHours: { type: "number" },
            priorityScore: { type: "number" },
            questions: {
              type: "array",
              maxItems: 10,
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  type: { type: "string", enum: ["common", "tricky"] },
                  tags: { type: "array", items: { type: "string" }, maxItems: 8 },
                  estimatedMinutes: { type: "number" },
                  whyAsked: { type: "string" },
                  idealAnswer: { type: "string" },
                  beginnerAnswer: { type: "string" },
                  seniorAnswer: { type: "string" },
                  followUpQuestions: { type: "array", items: { type: "string" }, maxItems: 5 },
                  resumeConnection: { type: "string" },
                  commonMistakes: { type: "array", items: { type: "string" }, maxItems: 5 },
                },
                required: [
                  "question",
                  "difficulty",
                  "type",
                  "tags",
                  "estimatedMinutes",
                  "whyAsked",
                  "idealAnswer",
                  "beginnerAnswer",
                  "seniorAnswer",
                  "followUpQuestions",
                  "resumeConnection",
                  "commonMistakes",
                ],
              },
            },
          },
          required: ["title", "description", "estimatedHours", "priorityScore", "questions"],
        },
      },
    },
    required: ["candidateProfile", "sections"],
  };
}

function trimResumeText(resumeText: string) {
  return resumeText.slice(0, 18000);
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
      recommendation: "PrepWise will still optimize for the target role, but expect more gap-filling questions and review whether the uploaded resume is the right version.",
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
      detail: "PrepWise found limited skills or project detail in the uploaded resume, which can reduce question quality.",
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
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
  plan: UserPlan;
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

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.5,
      responseMimeType: "application/json",
      responseJsonSchema: buildGeneratedKitJsonSchema(),
    },
  });

  return generatedKitSchema.parse(JSON.parse(response.text ?? "{}"));
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
    const limitedQuestions = section.questions.slice(0, Math.min(limits.maxQuestionsPerSection, roomLeft));
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
        tags: question.tags,
        estimatedMinutes: question.estimatedMinutes,
        whyAsked: question.whyAsked,
        idealAnswer: question.idealAnswer,
        beginnerAnswer: question.beginnerAnswer,
        seniorAnswer: question.seniorAnswer,
        followUpQuestions: question.followUpQuestions,
        resumeConnection: question.resumeConnection,
        commonMistakes: question.commonMistakes,
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
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
  plan: UserPlan;
}): Promise<GeneratedPrepKitPayload> {
  const generatedKit = await generateKitWithGemini({
    resumeText,
    onboarding,
    plan,
  });
  const normalizedSections = normalizeGeneratedSections(generatedKit.sections, plan);
  const normalizedCandidateProfile = normalizeCandidateProfile(generatedKit.candidateProfile, onboarding);
  const consistencySummary = buildConsistencySummary(normalizedCandidateProfile, onboarding);

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
