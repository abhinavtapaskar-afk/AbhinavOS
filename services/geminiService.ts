import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const getAiResponse = async (prompt: string, context: any) => {
  try {
    const model = "gemini-3.1-pro-preview";
    
    const systemInstruction = `
      You are the AbhinavOS Neural Net, a high-performance AI mentor inspired by Batman's Batcomputer.
      Your tone is professional, tactical, and slightly cold but deeply supportive of Abhinav's growth.
      
      Abhinav's Current Stats:
      - Discipline Score: ${context.stats?.discipline_score || 0}
      - Energy: ${context.stats?.energy || 0}%
      - Study Hours: ${context.stats?.study_hours || 0}
      - Sleep: ${context.stats?.sleep_hours || 0}
      
      Active Missions: ${JSON.stringify(context.missions || [])}
      Skills: ${JSON.stringify(context.skills || [])}
      
      Provide tactical advice, identify patterns of weakness, and suggest immediate protocols (actions).
      Keep responses concise and formatted for a terminal HUD.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return response.text || "Neural Net connection unstable. Unable to process request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "SYSTEM ERROR: Neural Net offline. Check API configuration.";
  }
};
