import { GoogleGenAI, Type, Part } from "@google/genai";
import { Flashcard, QuizQuestion, StudyEvent, FAQItem, SimplifiedConcept, CourseMaterial } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Converts CourseMaterial array into Gemini-compatible Parts.
 * Implements streamlined RAG by truncating extremely large files to high-yield sections.
 */
const MAX_FILE_CONTEXT = 20000; // ~5000 tokens per file limit for efficiency

const materialsToParts = (materials: CourseMaterial[]): Part[] => {
  return materials.map(m => {
    if (m.content.startsWith('data:')) {
      const [header, data] = m.content.split(',');
      const mimeType = header.split(':')[1].split(';')[0];
      return {
        inlineData: {
          mimeType: mimeType,
          data: data
        }
      };
    }
    
    // Streamlined RAG: Truncate to the most relevant academic sections (usually start/end or first 20k chars)
    const content = m.content.length > MAX_FILE_CONTEXT 
      ? m.content.substring(0, MAX_FILE_CONTEXT) + "\n\n[... Remaining content truncated for processing efficiency ...]"
      : m.content;

    return { text: `File: ${m.name}\nContent:\n${content}` };
  });
};

const SYSTEM_INSTRUCTION = `You are an expert SJSU academic tutor and document analyst. 

STRICT RULES FOR DATA PROCESSING:
1. NO EXTERNAL KNOWLEDGE: Use ONLY the provided material. If information is missing, say so.
2. NOISE FILTERING: Automatically identify and ignore repetitive headers, footers, page numbers, EBSCOhost copyright notices, and university timestamps. Focus ONLY on the core academic content.
3. HANDWRITING TRANSCRIPTION: If images or PDFs contain handwritten notes, whiteboard diagrams, or markups on tables, transcribe them with high fidelity and integrate them into the context.
4. MAIN CONTENT ONLY: Ignore navigation menus, ads, and UI boilerplate.
5. ERROR HANDLING: If the provided context is empty or states 'Failed to parse', do not attempt to generate content. Instead, return a JSON error object: { "error": "No academic data available" }.

Your goal is to provide high-fidelity academic support based strictly on the user's uploaded materials.`;

export const fetchLinkContent = async (url: string): Promise<{ text: string; sources: any[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the content of the article at this URL: ${url}. 

STRICT RULE: Extract ONLY the main academic or informational content present on the page. Ignore all navigation menus, footers, sidebars, advertisements, cookie banners, and other non-essential UI elements. Provide a comprehensive, high-fidelity academic extraction of all core concepts, definitions, historical facts, and key arguments found ONLY in the main body of the text on this page. The output will be used to generate flashcards and exam questions, so be extremely detailed and structured.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text || "Could not extract content from the link.",
    sources: sources
  };
};

export const generateFlashcards = async (materials: CourseMaterial[], count: number = 15): Promise<Flashcard[]> => {
  const parts = materialsToParts(materials);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: `Generate a deck of ${count} high-yield flashcards based on the provided materials. Focus on critical terminology, core theories, and complex relationships. Ensure questions use 'Active Recall' principles. If no academic data is found, return the error object as specified in system instructions.` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                category: { type: Type.STRING }
              },
              required: ["id", "question", "answer"]
            }
          },
          error: { type: Type.STRING }
        }
      }
    }
  });
  const data = JSON.parse(response.text);
  if (data.error) throw new Error(data.error);
  return data.flashcards || [];
};

export const generateQuiz = async (materials: CourseMaterial[], count: number = 10): Promise<QuizQuestion[]> => {
  const parts = materialsToParts(materials);
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        ...parts,
        { text: `Create a rigorous ${count}-question multiple choice practice exam based strictly on the provided material. Cover core concepts, technical details, and potential 'trick' areas. If no academic data is found, return the error object as specified in system instructions.` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                question: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.INTEGER, description: "Index (0-3) of the correct answer" },
                explanation: { type: Type.STRING, description: "Detailed academic explanation of why this answer is correct" }
              },
              required: ["id", "question", "options", "correctAnswer", "explanation"]
            }
          },
          error: { type: Type.STRING }
        }
      }
    }
  });
  const data = JSON.parse(response.text);
  if (data.error) throw new Error(data.error);
  return data.questions || [];
};

export const extractStudyPlan = async (materials: CourseMaterial[]): Promise<StudyEvent[]> => {
  const parts = materialsToParts(materials);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: "Review these materials and extract all key exams and assignments. Identify which course/subject each belongs to. STRICT RULE: Extract ONLY the task description (title) and the course/subject name. DO NOT extract, parse, or guess any due dates, times, or semester timelines from the document text (e.g., ignore syllabus date tables). Leave the 'date' field as an empty string for all items." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            date: { type: Type.STRING, description: "Must be an empty string. Do not provide a date." },
            type: { type: Type.STRING, enum: ["exam", "assignment", "review"] },
            importance: { type: Type.STRING, enum: ["high", "medium", "low"] },
            course: { type: Type.STRING, description: "Name of the course" }
          },
          required: ["id", "title", "date", "type", "importance"]
        }
      }
    }
  });
  const data = JSON.parse(response.text);
  return data.map((item: any) => ({
    ...item,
    id: crypto.randomUUID(),
    updatedAt: Date.now()
  }));
};

export const generateFAQMatrix = async (materials: CourseMaterial[]): Promise<FAQItem[]> => {
  const parts = materialsToParts(materials);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: "Extract a list of 'Frequently Asked Questions' that represent the core knowledge required for an exam. Organize them into an FAQ Matrix." }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            category: { type: Type.STRING, description: "Topic or chapter name" },
            question: { type: Type.STRING },
            answer: { type: Type.STRING }
          },
          required: ["id", "category", "question", "answer"]
        }
      }
    }
  });
  return JSON.parse(response.text);
};

export const simplifyConcept = async (concept: string, level: string = "simple"): Promise<SimplifiedConcept> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Simplify the following academic concept. 

STRICT RULE: Use ONLY the information provided in the concept text below. Do not add external facts or expand the definition using outside knowledge. Your goal is to simplify the provided text, not to teach the concept from general knowledge.

Tone/Level: ${level}. 

Concept: ${concept}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          original: { type: Type.STRING },
          simpleExplanation: { type: Type.STRING },
          analogy: { type: Type.STRING },
          keyTakeaways: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["original", "simpleExplanation", "analogy", "keyTakeaways"]
      }
    }
  });
  return JSON.parse(response.text);
};

export const chatWithContext = async (query: string, materials: CourseMaterial[]) => {
  const parts = materialsToParts(materials);
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: `Question: ${query}` }
      ]
    },
    config: {
      systemInstruction: SYSTEM_INSTRUCTION
    }
  });
  return response.text;
};
