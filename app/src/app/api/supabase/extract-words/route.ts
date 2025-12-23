/**
 * Wordmaster Extract Words API
 * POST /api/supabase/extract-words
 *
 * Uses AI to extract valuable words from user content (lyrics, paragraphs, topics)
 * Returns preview with difficulty breakdown and ready for enrichment
 */

import { NextResponse } from "next/server";
import {
  validateContentInput,
  getExtractionStats,
  deduplicateAgainstExisting,
  type ExtractWordsRequest,
} from "@/services/wordmaster";
import { geminiService } from "@/services/gemini/GeminiService";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";

interface AIExtractedWord {
  word: string;
  reason: string;
  difficulty: "easy" | "medium" | "hard" | "very_hard";
}

/**
 * Use AI to extract valuable words from content
 */
async function extractWordsWithAI(content: string): Promise<AIExtractedWord[]> {
  const prompt = `You are a vocabulary learning assistant. Analyze the following text and extract 8-15 valuable words that would be most beneficial for an English learner to learn.

For each word, consider:
- Educational value: Is it commonly used? Does it have multiple meanings? Is it part of important vocabulary?
- Context relevance: How central is it to understanding this text?
- Learning difficulty: Consider length, complexity, and familiarity

Return ONLY a JSON array of objects with this exact structure:
[{"word": "word_here", "reason": "brief reason why this word is valuable", "difficulty": "easy|medium|hard|very_hard"}]

Text to analyze:
"${content}"

Respond with ONLY valid JSON, no markdown or other text.`;

  try {
    const extractedWords = await geminiService.generateJSON<AIExtractedWord[]>(
      prompt
    );

    if (!Array.isArray(extractedWords)) {
      throw new Error("Expected array response from AI");
    }

    return extractedWords;
  } catch (error) {
    console.error("AI extraction failed:", error);
    // Fallback to basic extraction if AI fails
    const words = content.toLowerCase().match(/\b[a-z]{3,15}\b/g) || [];
    const uniqueWords = [...new Set(words)].slice(0, 10);

    return uniqueWords.map((word) => ({
      word,
      reason: "Fallback extraction - AI unavailable",
      difficulty:
        word.length <= 4 ? "easy" : word.length <= 7 ? "medium" : "hard",
    }));
  }
}

async function handleExtractWords(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  // Parse request body
  const body: ExtractWordsRequest = await request.json();
  const {
    content,
    // minWordLength = 3, // Not used with AI extraction
    // maxWordLength = 15, // Not used with AI extraction
    // includePhrases = true, // Not used with AI extraction
  } = body;

  // Validate content
  const validation = validateContentInput(content, 5000);
  if (!validation.valid) {
    return new NextResponse(
      JSON.stringify({ message: validation.error || "Invalid content" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Extract words using AI
  const aiExtractedWords = await extractWordsWithAI(content);

  // Convert to expected format
  const allExtracted = aiExtractedWords.map((item) => ({
    word_text: item.word,
    difficulty_level: item.difficulty,
    reason: item.reason,
  }));

  // Get existing user words for deduplication
  const existingWords: string[] = [];
  try {
    // This is a simplified version - in production, fetch from database
    // const userWords = await wordmasterDb.getUserWords(userId);
    // existingWords = userWords.map(w => w.word_text_lower);
  } catch (error) {
    console.warn("Could not fetch existing words for deduplication:", error);
  }

  // Deduplicate against existing vocabulary
  const { newWords, duplicates } = deduplicateAgainstExisting(
    allExtracted.map((w) => w.word_text),
    existingWords
  );

  // Filter to only new words and get their AI data
  const newWordsWithData = allExtracted.filter((item) =>
    newWords.includes(item.word_text)
  );

  // Get statistics using AI difficulty levels
  const stats = getExtractionStats(
    newWordsWithData.map((item) => ({
      word_text: item.word_text,
      word_length: item.word_text.length,
      definition: "",
      difficulty_level: item.difficulty_level,
      part_of_speech: "noun" as const,
    }))
  );

  return new NextResponse(
    JSON.stringify({
      preview: {
        words: newWordsWithData.map((item) => ({
          word_text: item.word_text,
          word_length: item.word_text.length,
          definition: "",
          difficulty_level: item.difficulty_level,
          part_of_speech: "noun" as const,
          ai_reason: item.reason,
        })),
        totalCount: newWordsWithData.length,
        duplicates: duplicates.length,
        difficultyBreakdown: stats.difficultyBreakdown,
      },
      words: newWordsWithData.map((item) => ({
        word_text: item.word_text,
        word_length: item.word_text.length,
        definition: "",
        difficulty_level: item.difficulty_level,
        part_of_speech: "noun" as const,
        ai_reason: item.reason,
      })),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export const POST = withAuth(handleExtractWords);
