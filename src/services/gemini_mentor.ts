import { GoogleGenAI } from "@google/genai";

/**
 * AI Mentor Integration Template
 * Detects weakness patterns based on the last 7 days of daily logs.
 */
export async function detectWeaknessPatterns(logs: any[]) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are Alfred, the AI Mentor for AbhinavOS. 
    Your goal is to perform a high-level strategic analysis of the user's performance data.
    Identify correlations between habits (sleep, workout, wake-up time) and productivity (study hours, discipline score).
    Be direct, tactical, and encouraging in a "Batcave" command center style.
  `;

  const prompt = `
    Analyze the following 7-day performance data and detect weakness patterns:
    ${JSON.stringify(logs, null, 2)}
    
    Format your response as a tactical summary with:
    1. CRITICAL WEAKNESS DETECTED
    2. CORRELATION ANALYSIS
    3. STRATEGIC ADJUSTMENT
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    return response.text;
  } catch (error) {
    console.error("AI Mentor Analysis Failed:", error);
    return "Neural Net Analysis Offline. Check system logs.";
  }
}
