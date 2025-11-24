import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Note, NoteType } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for individual note analysis
const noteAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise 1-sentence summary of the event." },
    suggestion: { type: Type.STRING, description: "A practical, empathetic immediate action or advice for the parent. Max 20 words." },
    patternDetected: { type: Type.STRING, description: "Optional: If this seems like a pattern based on common triggers (e.g., loud noise), mention it.", nullable: true },
    tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggested tags based on the text." }
  },
  required: ["summary", "suggestion", "tags"]
};

export const analyzeNote = async (text: string, type: NoteType, intensity?: number) => {
  if (!apiKey) {
    console.warn("No API Key provided");
    return null;
  }

  try {
    const prompt = `
      You are an expert assistant for parents of neurodivergent children.
      Analyze this note provided by a parent.
      Context: Type=${type}, Intensity=${intensity || 'N/A'}/5.
      Note Text: "${text}"
      
      Provide a helpful, empathetic, and clinical-lite response structured as JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: noteAnalysisSchema,
        temperature: 0.4,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error analyzing note:", error);
    return null;
  }
};

// Schema for report generation
const reportSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: "A paragraph summarizing the child's progress, challenges, and wins over the period." },
    topTriggers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of top 3 identified triggers." },
    recommendations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of 3 specific recommendations for the therapist." },
    trendAnalysis: { type: Type.STRING, description: "Analysis of intensity trends (improving, worsening, stable)." }
  },
  required: ["executiveSummary", "topTriggers", "recommendations", "trendAnalysis"]
};

export const generateReport = async (notes: Note[]) => {
  if (!apiKey || notes.length === 0) return null;

  try {
    const notesText = notes.map(n => 
      `[${new Date(n.timestamp).toLocaleDateString()}] (${n.type}, Intensity: ${n.intensity || 'N/A'}): ${n.text}`
    ).join("\n");

    const prompt = `
      Analyze these notes from a parent's journal about their child. 
      Generate a clinical summary report for a therapist.
      
      Notes Data:
      ${notesText}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportSchema,
        temperature: 0.3,
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating report:", error);
    return null;
  }
};
