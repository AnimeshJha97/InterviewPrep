export function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing.");
  }

  return apiKey;
}

export async function generateGroqJson({
  prompt,
  model = process.env.AI_MODEL?.trim() || "llama-3.3-70b-versatile",
  temperature = 0.25,
  maxTokens = 12000,
}: {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getGroqApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "system",
          content: "You return only valid JSON. No markdown. No commentary.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature,
      max_tokens: maxTokens,
      response_format: {
        type: "json_object",
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Groq request failed: ${response.status} ${errorText.slice(0, 300)}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  return payload.choices?.[0]?.message?.content ?? "";
}
