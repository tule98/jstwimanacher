/**
 * Wordmaster Enrich Words API
 * POST /api/supabase/enrich-words
 *
 * Enriches extracted words with definitions, phonetics, and examples via Gemini API
 */

import { NextResponse } from "next/server";
import type { ExtractedWord, PartOfSpeech } from "@/services/wordmaster";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";
import { geminiService } from "@/services/gemini/GeminiService";

interface EnrichRequest {
  words: Array<{ word_text: string }>;
}

interface GeminiResponse {
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  partOfSpeech: string;
  topic: string;
  meaning_vi: string;
}

/**
 * Call Gemini API to enrich words
 */
async function enrichWordsWithGemini(
  wordTexts: string[]
): Promise<GeminiResponse[]> {
  // Create prompt for batch enrichment
  const prompt = `You are a vocabulary enrichment assistant. For each word, provide:
1. Phonetic transcription (IPA)
2. Clear, simple definition
3. Part of speech
4. Example sentence using the word
5. Topic/category (free-form text describing subject area, e.g., 'technology', 'food', 'emotions', 'business')
6. Short Vietnamese glossary-style meaning (3-8 words, concise, no transliteration)

Return response as JSON array with objects containing: word, phonetic, definition, partOfSpeech, example, topic, meaning_vi

Words to enrich: ${wordTexts.map((w) => `"${w}"`).join(", ")}

Respond with ONLY valid JSON, no markdown or other text.`;

  const enrichedWords = await geminiService.generateJSON<GeminiResponse[]>(
    prompt
  );

  if (!Array.isArray(enrichedWords)) {
    throw new Error("Expected array response from Gemini");
  }

  return enrichedWords;
}

/**
 * Fallback enrichment for when Gemini is unavailable
 */
function createFallbackEnrichment(word: string): GeminiResponse {
  return {
    word,
    phonetic: `/${word.toLowerCase().substring(0, 3)}.../`,
    definition: `Word: ${word}. Definition not available.`,
    example: `Example: "${word}" is used in vocabulary learning.`,
    partOfSpeech: "noun",
    topic: "general",
    meaning_vi: "Meaning unavailable (vi)",
  };
}

async function handleEnrichWords(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  // Parse request body
  const body: EnrichRequest = await request.json();
  const { words } = body;

  if (!words || !Array.isArray(words) || words.length === 0) {
    return new NextResponse(
      JSON.stringify({ message: "Invalid words array" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const wordTexts = words.map((w) => w.word_text);

  // Try to enrich with Gemini, fallback to basic enrichment if unavailable
  let enrichedWords: GeminiResponse[];

  try {
    enrichedWords = await enrichWordsWithGemini(wordTexts);
  } catch (error) {
    console.warn("Gemini enrichment failed, using fallback:", error);
    enrichedWords = wordTexts.map((word) => createFallbackEnrichment(word));
  }

  // Map to ExtractedWord format
  const result: ExtractedWord[] = enrichedWords.map((enriched) => {
    const partOfSpeech = enriched.partOfSpeech.toLowerCase();
    const pos: PartOfSpeech =
      partOfSpeech === "noun"
        ? "noun"
        : partOfSpeech === "verb"
        ? "verb"
        : partOfSpeech === "adjective"
        ? "adjective"
        : partOfSpeech === "adverb"
        ? "adverb"
        : partOfSpeech === "phrase"
        ? "phrase"
        : "other";

    return {
      word_text: enriched.word,
      phonetic: enriched.phonetic,
      definition: enriched.definition,
      example_sentence: enriched.example,
      part_of_speech: pos,
      meaning_vi: enriched.meaning_vi,
      topic: enriched.topic,
      word_length: enriched.word.length,
      difficulty_level:
        enriched.word.length <= 4
          ? "easy"
          : enriched.word.length <= 7
          ? "medium"
          : enriched.word.length <= 10
          ? "hard"
          : "very_hard",
    };
  });

  return new NextResponse(JSON.stringify(result), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const POST = withAuth(handleEnrichWords);
