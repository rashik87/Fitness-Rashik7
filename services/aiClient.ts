// services/aiClient.ts
import { GoogleGenAI } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

export const getAi = (): GoogleGenAI => {
    if (!aiInstance) {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

        console.log("GEMINI_API_KEY =", process.env.GEMINI_API_KEY ? "Loaded ✅" : "Missing ❌");
        console.log("API_KEY =", process.env.API_KEY ? "Loaded ✅" : "Missing ❌");

        if (!apiKey) {
            throw new Error(
                "Gemini API Key not found! ⚠️\n" +
                "تأكد من إضافة GEMINI_API_KEY أو API_KEY في متغيرات البيئة (.env.local أو Vercel Environment Variables)."
            );
        }

        aiInstance = new GoogleGenAI({ apiKey });
    }

    return aiInstance;
};

