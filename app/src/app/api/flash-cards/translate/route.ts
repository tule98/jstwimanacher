import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  let word = "unknown";

  try {
    const body = await request.json();
    word = body.word;

    if (!word || typeof word !== "string") {
      return NextResponse.json({ error: "Word is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      // Fallback to mock translation if API key not configured
      console.log("GEMINI_API_KEY not found, using mock translation");
      return NextResponse.json(generateMockTranslation(word));
    }

    const prompt = `Translate the English word "${word}" to Vietnamese. Provide:
1. phonetic: IPA pronunciation in English (format: /pronunciation/)
2. meaning: Vietnamese translation
3. example: A simple example sentence using this word in English

Return ONLY a valid JSON object with this exact structure:
{"phonetic": "/pronunciation/", "meaning": "translation", "example": "Example sentence."}`;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text || "";
    console.log("🚀 ~ POST ~ text:", text);

    // Remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Translation error:", error);
    // Fallback to mock on error (word variable captured from outer scope)
    return NextResponse.json(generateMockTranslation(word));
  }
}

// Mock translation function - fallback when API key not configured
function generateMockTranslation(word: string): {
  phonetic: string;
  meaning: string;
  example: string;
} {
  const examples: Record<
    string,
    { phonetic: string; meaning: string; example: string }
  > = {
    hello: {
      phonetic: "/həˈloʊ/",
      meaning: "xin chào",
      example: "Hello, how are you today?",
    },
    world: {
      phonetic: "/wɜːrld/",
      meaning: "thế giới",
      example: "The world is a beautiful place.",
    },
    computer: {
      phonetic: "/kəmˈpjuːtər/",
      meaning: "máy tính",
      example: "I use my computer every day for work.",
    },
    book: {
      phonetic: "/bʊk/",
      meaning: "sách",
      example: "She is reading an interesting book.",
    },
  };

  return (
    examples[word.toLowerCase()] || {
      phonetic: `/${word}/`,
      meaning: `[Translation of ${word}]`,
      example: `This is an example sentence with the word ${word}.`,
    }
  );
}
