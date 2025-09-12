// services/aiClient.ts
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getAi = (): GoogleGenAI => {
  if (!aiInstance) {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error(
        "❌ Gemini API Key not found! تأكد أن VITE_GEMINI_API_KEY موجود في .env.local أو في Vercel."
      );
    }

    aiInstance = new GoogleGenAI({ apiKey });
  }

  return aiInstance;
};
