import { z } from "zod";

import { getGeminiClient } from "@/lib/ai/gemini";
import { getGenerationLimits } from "@/lib/interview-kit/generation-limits";
import { getSectionStyle, slugifySectionTitle } from "@/lib/interview-kit/section-style";
import type { CandidateProfile, GeneratedPrepKitPayload, GeneratedSection, OnboardingProfile, UserPlan } from "@/types/prep-kit";

const candidateProfileSchema = z.object({
  candidateLevel: z.enum(["junior", "mid", "senior"]),
  targetRole: z.string().min(2),
  strongAreas: z.array(z.string()).min(1).max(8),
  weakAreas: z.array(z.string()).max(8),
  likelyInterviewRounds: z.array(z.string()).min(2).max(8),
  priorityTopics: z.array(z.string()).min(3).max(12),
  extractedSkills: z.array(z.string()).min(3).max(25),
  extractedProjects: z.array(z.string()).min(1).max(12),
  experienceSummary: z.string().min(20).max(1500),
  yearsOfExperience: z.number().min(0).max(40),
});

const generatedQuestionSchema = z.object({
  question: z.string().min(10),
  difficulty: z.enum(["easy", "medium", "hard"]),
  type: z.enum(["common", "tricky"]).default("common"),
  tags: z.array(z.string()).min(1).max(8),
  estimatedMinutes: z.number().int().min(5).max(30),
  whyAsked: z.string().min(20).max(800),
  idealAnswer: z.string().min(80),
  beginnerAnswer: z.string().min(40),
  seniorAnswer: z.string().min(60),
  followUpQuestions: z.array(z.string()).min(2).max(5),
  resumeConnection: z.string().min(20).max(800),
  commonMistakes: z.array(z.string()).min(2).max(5),
});

const generatedSectionSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(20).max(800),
  estimatedHours: z.number().min(1).max(20),
  priorityScore: z.number().int().min(1).max(100),
  questions: z.array(generatedQuestionSchema).min(3).max(10),
});

const generatedKitSchema = z.object({
  candidateProfile: candidateProfileSchema,
  sections: z.array(generatedSectionSchema).min(5).max(12),
});

function buildGeneratedKitJsonSchema() {
  return {
    type: "object",
    properties: {
      candidateProfile: {
        type: "object",
        properties: {
          candidateLevel: { type: "string", enum: ["junior", "mid", "senior"] },
          targetRole: { type: "string" },
          strongAreas: { type: "array", items: { type: "string" } },
          weakAreas: { type: "array", items: { type: "string" } },
          likelyInterviewRounds: { type: "array", items: { type: "string" } },
          priorityTopics: { type: "array", items: { type: "string" } },
          extractedSkills: { type: "array", items: { type: "string" } },
          extractedProjects: { type: "array", items: { type: "string" } },
          experienceSummary: { type: "string" },
          yearsOfExperience: { type: "number" },
        },
        required: [
          "candidateLevel",
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
        items: {
          type: "object",
          properties: {
            title: { type: "string" },
            description: { type: "string" },
            estimatedHours: { type: "number" },
            priorityScore: { type: "number" },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                  type: { type: "string", enum: ["common", "tricky"] },
                  tags: { type: "array", items: { type: "string" } },
                  estimatedMinutes: { type: "number" },
                  whyAsked: { type: "string" },
                  idealAnswer: { type: "string" },
                  beginnerAnswer: { type: "string" },
                  seniorAnswer: { type: "string" },
                  followUpQuestions: { type: "array", items: { type: "string" } },
                  resumeConnection: { type: "string" },
                  commonMistakes: { type: "array", items: { type: "string" } },
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

  return {
    candidateProfile: generatedKit.candidateProfile,
    sections: normalizedSections,
    generationMeta: {
      provider: "gemini",
      model: "gemini-2.5-flash",
      generatedFromResume: true,
      plan,
      sectionCount: normalizedSections.length,
      totalQuestions: normalizedSections.reduce((sum, section) => sum + section.questions.length, 0),
    },
  };
}
