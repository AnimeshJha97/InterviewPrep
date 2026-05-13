export const prepKitJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["candidateProfile", "sections"],
  properties: {
    candidateProfile: {
      type: "object",
      additionalProperties: false,
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
      properties: {
        candidateLevel: { type: "string", enum: ["junior", "mid", "senior"] },
        resumeCurrentRole: { type: "string" },
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
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "description", "estimatedHours", "priorityScore", "questions"],
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          estimatedHours: { type: "number" },
          priorityScore: { type: "number" },
          questions: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
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
            },
          },
        },
      },
    },
  },
} as const;

export function getOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing.");
  }

  return apiKey;
}

export async function generateOpenAiJson({
  prompt,
  model = process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini",
  temperature = 0.2,
  maxTokens = 9000,
}: {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getOpenAiApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You generate valid JSON matching the requested schema. No markdown. No commentary.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "prep_kit",
          strict: true,
          schema: prepKitJsonSchema,
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenAI request failed: ${response.status} ${errorText.slice(0, 500)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
        refusal?: string;
      };
    }>;
  };

  const message = payload.choices?.[0]?.message;

  if (message?.refusal) {
    throw new Error(`OpenAI refused the request: ${message.refusal}`);
  }

  return message?.content ?? "";
}
