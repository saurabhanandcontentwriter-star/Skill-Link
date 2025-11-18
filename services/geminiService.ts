

import { GoogleGenAI, Chat } from "@google/genai";
import type { GroundedResponse, GroundingSource } from '../types';

let ai: GoogleGenAI | null = null;

// Initialize the AI client only if an API key is provided.
// This prevents the app from crashing or making authenticated requests with an invalid key.
if (process.env.API_KEY && process.env.API_KEY !== " ") {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
  // Log an error to the console for developers.
  console.error("API_KEY environment variable not set. AI features will be disabled.");
}

export const getGroundedAnswer = async (prompt: string): Promise<GroundedResponse> => {
  // If the AI client wasn't initialized, throw a user-friendly error.
  if (!ai) {
    throw new Error("The AI service is not configured. Please ensure an API key is provided in the environment.");
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{googleSearch: {}}],
      },
    });

    const text = response.text;
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    const sources: GroundingSource[] = [];
    if (groundingChunks) {
      for (const chunk of groundingChunks) {
        if (chunk.web) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title,
          });
        }
      }
    }
    
    return { text, sources };

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        // Provide a more specific error message for invalid API keys.
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        throw new Error(`Failed to get answer from the AI service: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the AI service.");
  }
};

export const startChatSession = (systemInstruction?: string): Chat => {
  if (!ai) {
    throw new Error("The AI service is not configured. Please ensure an API key is provided in the environment.");
  }
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: systemInstruction || 'You are SkillLink AI, a friendly and knowledgeable assistant for a mentorship platform. Help users find mentors, suggest courses, and answer questions about AI and Web3 topics. Keep your answers concise and helpful.',
    },
  });
  return chat;
};