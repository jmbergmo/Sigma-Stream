import { GoogleGenAI } from "@google/genai";
import { InputVariable, SimulationConfig, SimulationResult } from "../types";

const getGeminiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) throw new Error("API Key not found");
    return new GoogleGenAI({ apiKey });
};

export const analyzeSimulationResults = async (
    variables: InputVariable[],
    config: SimulationConfig,
    result: SimulationResult
): Promise<string> => {
    try {
        const ai = getGeminiClient();
        
        const prompt = `
        Act as a Master Black Belt in Six Sigma. I have run a Monte Carlo Simulation for a DFSS project.
        Please analyze the results and provide specific recommendations to improve the Sigma Level.

        Context:
        - Transfer Function: Y = ${config.formula}
        - Specifications: LSL=${config.lsl}, USL=${config.usl}

        Inputs (X variables):
        ${variables.map(v => `- ${v.name}: Mean=${v.mean}, StdDev=${v.stdDev}`).join('\n')}

        Simulation Results (Y output):
        - Mean Y: ${result.mean.toFixed(4)}
        - StdDev Y: ${result.stdDev.toFixed(4)}
        - Cpk: ${result.cpk.toFixed(3)}
        - Calculated Sigma Level: ${result.sigmaLevel.toFixed(2)}
        - DPMO: ${result.dpmo.toFixed(0)}

        Please provide:
        1. An executive summary of the process capability.
        2. Which input variable (X) likely contributes most to the variation (Sensitivity Analysis intuition).
        3. Concrete steps to improve the design (e.g., shift the mean or reduce variance of specific Xs).
        
        Keep the response concise, professional, and formatted with Markdown.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction: "You are an expert Six Sigma statistician. Be precise, concise, and actionable."
            }
        });

        return response.text || "No analysis generated.";
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return "Unable to generate AI analysis at this time. Please ensure your API key is valid.";
    }
};