
import { GoogleGenAI, Chat, Type } from "@google/genai";
import type { GroundedResponse, GroundingSource, RecommendedCourse, Task, InterviewFeedback } from '../types';

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

export const getCourseRecommendations = async (interests: string[], completedTasks: Task[]): Promise<RecommendedCourse[]> => {
  if (!ai) {
    throw new Error("The AI service is not configured. Please ensure an API key is provided in the environment.");
  }

  const completedTaskTitles = completedTasks.map(task => task.text).join(', ');
  const userInterests = interests.join(', ');

  const prompt = `You are an expert career advisor for SkillLink, a learning platform for AI and Web3. A user has the following technical interests: "${userInterests}". They have recently completed these learning tasks: "${completedTaskTitles}".

Based on this, recommend exactly 3 specific online courses to help them advance their skills. For each course, provide the course title, the platform (e.g., Coursera, edX, Udemy), a brief description, and a short, personalized reason why this course is a good fit for them based on their interests and completed tasks.

Respond with a JSON array of objects.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              platform: { type: Type.STRING },
              description: { type: Type.STRING },
              reason: { type: Type.STRING },
            },
            required: ["title", "platform", "description", "reason"],
          },
        },
      },
    });

    const responseText = response.text.trim();
    if (!responseText.startsWith('[') || !responseText.endsWith(']')) {
        throw new Error("Received malformed JSON response from AI service.");
    }
    const recommendations = JSON.parse(responseText);
    
    return recommendations as RecommendedCourse[];

  } catch (error) {
    console.error("Error calling Gemini API for course recommendations:", error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        throw new Error(`Failed to get course recommendations from the AI service: ${error.message}`);
    }
    throw new Error("An unknown error occurred while getting course recommendations.");
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


// --- Interview Features ---

export const getInterviewerIntro = async (name: string, gender: string, topic: string): Promise<string> => {
  if (!ai) throw new Error("AI service not configured.");

  const prompt = `Act as an Indian technical interviewer named ${name} (${gender}). 
  You are conducting an interview for the topic: "${topic}".
  
  Generate a short, professional, and warm opening greeting in Indian English (e.g., use "Namaste" or "Hello", be polite). 
  Introduce yourself briefly and ask the candidate to introduce themselves. 
  Keep it under 3 sentences.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
}

export const getInterviewQuestion = async (topic: string, difficulty: string, previousContext?: string): Promise<string> => {
  if (!ai) throw new Error("AI service not configured.");

  const context = previousContext ? `Context: ${previousContext}` : "This is the first question.";
  
  const prompt = `Act as an Indian technical interviewer. The topic is: "${topic}" at a "${difficulty}" level.
  ${context}
  
  Generate ONE single, clear interview question relevant to this topic and difficulty. 
  If the context implies the user just introduced themselves, acknowledge it briefly and politely (e.g., "Thanks for sharing...") before asking the technical question.
  Do not add long filler text. Just the acknowledgement (if needed) and the question.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text.trim();
};

export const evaluateInterviewResponse = async (question: string, answer: string): Promise<InterviewFeedback> => {
  if (!ai) throw new Error("AI service not configured.");

  const prompt = `You are an expert interviewer evaluating a candidate's response.
  Question: "${question}"
  Candidate Answer: "${answer}"

  Analyze the answer for technical correctness, clarity, and voice tone (inferred from text).
  Provide:
  1. A rating from 1-10.
  2. Brief feedback/remarks on the content.
  3. Tone analysis (e.g., confident, hesitant, vague, precise).
  4. A suggested improvement or better way to answer.

  Respond in valid JSON format.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          rating: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          toneAnalysis: { type: Type.STRING },
          suggestedImprovement: { type: Type.STRING }
        },
        required: ["rating", "feedback", "toneAnalysis", "suggestedImprovement"]
      }
    }
  });

  return JSON.parse(response.text) as InterviewFeedback;
};
