
import { GoogleGenAI, Type } from "@google/genai";
import { ProfileData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractStructuredProfile = async (base64Image: string): Promise<ProfileData> => {
  const model = 'gemini-3-pro-preview';
  
  const systemInstruction = `You are a deterministic document-processing system. 
Your sole task is to transform a long vertical screenshot of a LinkedIn profile into a strictly structured JSON format.

CRITICAL RULES:
1. Never invent content or fields.
2. Never summarize or paraphrase.
3. Never guess missing information.
4. Preserve original wording exactly.
5. Experience entries must remain in their original chronological order as appearing in the document.
6. If a value cannot be confidently extracted, leave it empty.
7. If an entire section is missing, return an empty string or empty array.`;

  const prompt = `TASK: Normalize the cleaned content from the image into structured sections for rendering.

RULES:
- Extract the Name and Headline for the header.
- Extract the 'About' section text exactly.
- Extract all 'Experience' entries, preserving Title, Company, Dates, and Description.
- Do not split content unnecessarily.
- Clean obvious UI noise (buttons, icons) during extraction.

OUTPUT FORMAT:
JSON matching the requested schema.`;

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image.split(',')[1],
          },
        },
        { text: prompt }
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          header: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              headline: { type: Type.STRING }
            },
            required: ["name", "headline"]
          },
          about: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                company: { type: Type.STRING },
                dates: { type: Type.STRING },
                description: { type: Type.STRING }
              },
              required: ["title", "company"]
            }
          }
        },
        required: ["header", "about", "experience"]
      }
    }
  });

  const text = response.text || '{}';
  try {
    const result = JSON.parse(text);
    return result as ProfileData;
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    throw new Error("Invalid response format from extraction engine.");
  }
};
