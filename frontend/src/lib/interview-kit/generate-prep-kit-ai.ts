import { z } from "zod";

import { getGeminiClient } from "@/lib/ai/gemini";
import { generatePrepKitFromResumeFallback } from "@/lib/interview-kit/generate-prep-kit";
import { getSectionStyle, slugifySectionTitle } from "@/lib/interview-kit/section-style";
import type { CandidateProfile, GeneratedPrepKitPayload, GeneratedSection, OnboardingProfile } from "@/types/prep-kit";

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
  priorityScore: z.number().int().min(1).max(10),
  questions: z.array(generatedQuestionSchema).min(3).max(10),
});

const generatedKitSchema = z.object({
  sections: z.array(generatedSectionSchema).min(5).max(12),
});

function buildCandidateProfileJsonSchema() {
  return {
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
  };
}

function buildGeneratedKitJsonSchema() {
  return {
    type: "object",
    properties: {
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
    required: ["sections"],
  };
}

function trimResumeText(resumeText: string) {
  return resumeText.slice(0, 18000);
}

function getPlanNumbers(onboarding: OnboardingProfile) {
  const sectionCount = onboarding.timelineDays === 30 ? 10 : onboarding.timelineDays === 7 ? 6 : 8;
  const questionsPerSection = onboarding.timelineDays === 30 ? 6 : onboarding.timelineDays === 7 ? 4 : 5;

  return { sectionCount, questionsPerSection };
}

async function generateCandidateProfileWithGemini({
  resumeText,
  onboarding,
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
}) {
  const client = getGeminiClient();
  const prompt = `
You are an expert interview prep strategist.

Analyze this candidate deeply using:
- resume text
- current role
- target role
- years of experience
- target company
- job description
- confidence level
- interview type
- timeline

Return only valid JSON.

ONBOARDING:
${JSON.stringify(onboarding, null, 2)}

RESUME:
${trimResumeText(resumeText)}
`.trim();

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.3,
      responseMimeType: "application/json",
      responseJsonSchema: buildCandidateProfileJsonSchema(),
    },
  });

  return candidateProfileSchema.parse(JSON.parse(response.text ?? "{}"));
}

async function generateSectionsAndQuestionsWithGemini({
  resumeText,
  onboarding,
  candidateProfile,
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
  candidateProfile: CandidateProfile;
}) {
  const client = getGeminiClient();
  const { sectionCount, questionsPerSection } = getPlanNumbers(onboarding);

  const prompt = `
You build personalized interview prep kits.

Goal:
- create exactly ${sectionCount} sections
- create exactly ${questionsPerSection} questions per section
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

Return only valid JSON.

ONBOARDING:
${JSON.stringify(onboarding, null, 2)}

CANDIDATE_PROFILE:
${JSON.stringify(candidateProfile, null, 2)}

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

function normalizeGeneratedSections(sections: z.infer<typeof generatedSectionSchema>[]): GeneratedSection[] {
  return sections.map((section, sectionIndex) => {
    const style = getSectionStyle(section.title);
    const sectionId = style.id || slugifySectionTitle(section.title) || `section-${sectionIndex + 1}`;

    return {
      id: sectionId,
      title: section.title,
      icon: style.icon,
      color: style.color,
      textColor: style.textColor,
      description: section.description,
      estimatedHours: section.estimatedHours,
      priorityScore: section.priorityScore,
      questions: section.questions.map((question, questionIndex) => ({
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
}: {
  resumeText: string;
  onboarding: OnboardingProfile;
}): Promise<GeneratedPrepKitPayload> {
  try {
    const candidateProfile = await generateCandidateProfileWithGemini({
      resumeText,
      onboarding,
    });

    const generatedKit = await generateSectionsAndQuestionsWithGemini({
      resumeText,
      onboarding,
      candidateProfile,
    });

    return {
      candidateProfile,
      sections: normalizeGeneratedSections(generatedKit.sections),
    };
  } catch {
    return generatePrepKitFromResumeFallback({
      resumeText,
      onboarding,
    });
  }
}
