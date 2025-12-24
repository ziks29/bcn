import { GoogleGenAI } from "@google/genai";

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateRedneckWisdom = async (): Promise<string> => {
  if (!process.env.API_KEY) {
    // Fallback if no API key is present for the mock environment
    return "Духи молчат (API Key missing). Но помни: Никогда не доверяй человеку с двумя именами.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Напиши короткий, смешной, сатирический 'гороскоп' или 'мудрость реднека' из 2 предложений для жителя округа Блейн (вселенная GTA V). Говори про грузовики, пришельцев, правительственные заговоры или выпивку. На русском языке.",
    });

    return response.text || "Пришельцы заглушили сигнал. Попробуй позже.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ветер дует не в ту сторону. Знаки не читаются.";
  }
};