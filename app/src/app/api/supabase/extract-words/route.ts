/**
 * Wordmaster Extract Words API
 * POST /api/supabase/extract-words
 *
 * Extracts words from user content (lyrics, paragraphs, topics)
 * Returns preview with difficulty breakdown and ready for enrichment
 */

import { NextResponse } from "next/server";
import {
  extractWordsAndPhrases,
  validateContentInput,
  getExtractionStats,
  deduplicateAgainstExisting,
  type ExtractWordsRequest,
} from "@/services/wordmaster";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";

async function handleExtractWords(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  // Parse request body
  const body: ExtractWordsRequest = await request.json();
  const {
    content,
    minWordLength = 3,
    maxWordLength = 15,
    includePhrases = true,
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

  // Extract words and phrases
  const { words: extractedWords, phrases } = extractWordsAndPhrases(content, {
    minWordLength,
    maxWordLength,
    includePhrases,
  });

  // Combine words and phrases
  const allExtracted = [
    ...extractedWords.map((w) => ({ word_text: w })),
    ...phrases.map((p) => ({ word_text: p })),
  ];

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

  // Get statistics
  const stats = getExtractionStats(
    newWords.map((w) => ({
      word_text: w,
      word_length: w.length,
      definition: "",
      difficulty_level: "medium" as const,
      part_of_speech: "noun" as const,
    }))
  );

  return new NextResponse(
    JSON.stringify({
      preview: {
        words: newWords.map((w) => ({
          word_text: w,
          word_length: w.length,
          definition: "",
          difficulty_level:
            w.length <= 4
              ? "easy"
              : w.length <= 7
              ? "medium"
              : w.length <= 10
              ? "hard"
              : "very_hard",
          part_of_speech: "noun" as const,
        })),
        totalCount: newWords.length,
        duplicates: duplicates.length,
        difficultyBreakdown: stats.difficultyBreakdown,
      },
      words: newWords.map((w) => ({
        word_text: w,
        word_length: w.length,
        definition: "",
        difficulty_level:
          w.length <= 4
            ? "easy"
            : w.length <= 7
            ? "medium"
            : w.length <= 10
            ? "hard"
            : "very_hard",
        part_of_speech: "noun" as const,
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
