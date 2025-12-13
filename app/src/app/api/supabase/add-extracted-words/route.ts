/**
 * Wordmaster Add Extracted Words API
 * POST /api/supabase/add-extracted-words
 *
 * Adds enriched extracted words to user's vocabulary
 * Creates words in database if they don't exist, links to user
 */

import { NextResponse } from "next/server";
import { wordmasterDb } from "@/services/wordmaster";
import type { ExtractedWord } from "@/services/wordmaster";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";

interface AddWordsRequest {
  userId: string;
  words: ExtractedWord[];
}

async function handleAddExtractedWords(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  // Parse request body
  const body: AddWordsRequest = await request.json();
  const { userId, words } = body;

  // Verify user is adding to their own vocabulary
  if (userId !== request.user.id) {
    return new NextResponse(
      JSON.stringify({ message: "Forbidden: Cannot add words to other users" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (!words || !Array.isArray(words) || words.length === 0) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid words array" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Process each word
  const results = {
    added: 0,
    failed: 0,
    duplicates: 0,
    errors: [] as string[],
  };

  for (const extractedWord of words) {
    try {
      // Get or create the word in the master vocabulary
      const word = await wordmasterDb.getOrCreateWord({
        word_text: extractedWord.word_text,
        phonetic: extractedWord.phonetic,
        definition: extractedWord.definition,
        part_of_speech: extractedWord.part_of_speech,
        example_sentence: extractedWord.example_sentence,
        word_length: extractedWord.word_length,
        difficulty_level: extractedWord.difficulty_level,
      });

      if (!word) {
        results.failed++;
        results.errors.push(
          `Failed to process word: ${extractedWord.word_text}`
        );
        continue;
      }

      // Check if user already has this word
      const existingUserWord = await wordmasterDb.getUserWord(userId, word.id);

      if (existingUserWord) {
        results.duplicates++;
        continue;
      }

      // Add word to user's vocabulary
      const userWord = await wordmasterDb.createUserWord(userId, {
        word_id: word.id,
        memory_level: 0,
      });

      if (userWord) {
        results.added++;
      } else {
        results.failed++;
        results.errors.push(
          `Failed to add word to user: ${extractedWord.word_text}`
        );
      }
    } catch (error) {
      results.failed++;
      results.errors.push(
        `Error processing ${extractedWord.word_text}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return new NextResponse(
    JSON.stringify({
      success: true,
      summary: {
        totalProcessed: words.length,
        added: results.added,
        duplicates: results.duplicates,
        failed: results.failed,
      },
      ...(results.errors.length > 0 && { errors: results.errors }),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export const POST = withAuth(handleAddExtractedWords);
