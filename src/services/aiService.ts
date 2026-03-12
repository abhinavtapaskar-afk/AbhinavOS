import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getMentorAdvice(userContext: any, userMessage: string) {
  const model = ai.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: [
      {
        role: "user",
        parts: [{ text: `You are the ultimate AI Mentor for AbhinavOS, a personal life operating system. 
        Your tone is strategic, disciplined, and encouraging, like a mix of Alfred Pennyworth and a high-performance coach.
        
        User Context:
        ${JSON.stringify(userContext, null, 2)}
        
        User Message: ${userMessage}` }]
      }
    ],
    config: {
      systemInstruction: "Provide strategic advice based on the user's data. Be concise, actionable, and maintain the 'Batcave command center' persona."
    }
  });

  const response = await model;
  return response.text;
}
