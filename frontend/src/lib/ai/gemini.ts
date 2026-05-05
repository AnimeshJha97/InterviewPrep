import { GoogleGenAI } from "@google/genai";

let cachedClient: GoogleGenAI | null = null;

export function getGeminiApiKey() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing.");
  }

  return apiKey;
}

export function getGeminiClient() {
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({
      apiKey: getGeminiApiKey(),
    });
  }

  return cachedClient;
}
