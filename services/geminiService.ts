
import { GoogleGenAI, Modality } from "@google/genai";
import { Persona } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this project, we assume the key is provided.
  console.warn(
    "API_KEY environment variable not set. Using a placeholder. App will not function correctly."
  );
  // This allows the app to load, but API calls will fail.
  process.env.API_KEY = "YOUR_API_KEY_HERE"; 
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const executeAgent = async (
  persona: Persona,
  modelName: string,
  prompt: string,
  attachment: { data: string; mimeType: string } | null
): Promise<string> => {
  try {
    // FIX: Explicitly type `parts` to allow for both text and inlineData objects.
    // This fixes a TypeScript error where the array type was too narrowly inferred.
    // The order of parts has also been corrected to send image data before text.
    const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] = [];
    if (attachment) {
      parts.push({ inlineData: attachment });
    }
    parts.push({ text: prompt });
    const contents = { parts };

    const config: any = {
      systemInstruction: persona.system_prompt,
    };

    // Special handling for the image generation model
    if (modelName === 'gemini-2.5-flash-image-preview') {
      config.responseModalities = [Modality.IMAGE, Modality.TEXT];
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: contents,
      config: config
    });
    
    // Check for image data in response for the specific model
    if (modelName === 'gemini-2.5-flash-image-preview') {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const mimeType = part.inlineData.mimeType;
                const base64Data = part.inlineData.data;
                // Return a data URL for direct use in <img> tags
                return `data:${mimeType};base64,${base64Data}`;
            }
        }
    }
    
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Provide a more user-friendly error message
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    const visionHint = attachment ? ' Note: Not all models support file inputs.' : '';
    // By throwing an error, we allow the workflow runner's catch block to handle the failure state correctly.
    throw new Error(`Agent "${persona.name}" failed to execute. Reason: ${errorMessage}.${visionHint}`);
  }
};
