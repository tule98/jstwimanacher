/**
 * Wordmaster Text Processing & Content Extraction
 * Handles tokenization, stop word filtering, phrase extraction, and difficulty calculation
 */

import { calculateDifficultyLevel } from "./memory-logic";
import type { ExtractedWord, DifficultyLevel, PartOfSpeech } from "./types";

// Common English stop words to filter out
const ENGLISH_STOP_WORDS = new Set([
  "the",
  "a",
  "an",
  "and",
  "or",
  "but",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "have",
  "has",
  "had",
  "do",
  "does",
  "did",
  "will",
  "would",
  "could",
  "should",
  "may",
  "might",
  "can",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "up",
  "down",
  "out",
  "off",
  "over",
  "under",
  "above",
  "below",
  "between",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "i",
  "you",
  "he",
  "she",
  "it",
  "we",
  "they",
  "me",
  "him",
  "her",
  "us",
  "them",
  "my",
  "your",
  "his",
  "her",
  "its",
  "our",
  "their",
  "this",
  "that",
  "these",
  "those",
  "what",
  "which",
  "who",
  "whom",
  "why",
  "how",
  "when",
  "where",
  "there",
  "here",
  "no",
  "not",
  "nor",
  "only",
  "same",
  "so",
  "too",
  "very",
  "just",
  "as",
  "such",
]);

interface TextProcessingOptions {
  minWordLength?: number;
  maxWordLength?: number;
  includePhrases?: boolean;
}

/**
 * Tokenize text into words and sentences
 */
export function tokenizeText(text: string): {
  words: string[];
  sentences: string[];
} {
  // Normalize whitespace
  const normalized = text
    .trim()
    .replace(/\s+/g, " ")
    .replace(/([.!?;:])\s+/g, "$1\n");

  // Split into sentences
  const sentences = normalized.split("\n").filter((s) => s.trim().length > 0);

  // Split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, "") // Remove punctuation except apostrophes and hyphens
    .split(/\s+/)
    .filter((w) => w.length > 0);

  return { words, sentences };
}

/**
 * Remove stop words from list
 */
export function filterStopWords(words: string[]): string[] {
  return words.filter((word) => !ENGLISH_STOP_WORDS.has(word.toLowerCase()));
}

/**
 * Extract n-grams (phrases) from text
 */
export function extractPhrases(
  text: string,
  minGramSize: number = 2,
  maxGramSize: number = 4
): string[] {
  const { words } = tokenizeText(text);
  const filteredWords = filterStopWords(words);
  const phrases: string[] = [];

  for (let gramSize = minGramSize; gramSize <= maxGramSize; gramSize++) {
    for (let i = 0; i <= filteredWords.length - gramSize; i++) {
      const phrase = filteredWords.slice(i, i + gramSize).join(" ");
      phrases.push(phrase);
    }
  }

  return phrases;
}

/**
 * Check if a word is likely a noun based on simple heuristics
 */
function estimatePartOfSpeech(word: string): PartOfSpeech {
  word = word.toLowerCase();

  // Very basic heuristics - in production, use a proper NLP library
  if (word.endsWith("ing")) return "verb";
  if (word.endsWith("ed")) return "verb";
  if (word.endsWith("ly")) return "adverb";
  if (word.endsWith("tion") || word.endsWith("sion")) return "noun";
  if (word.endsWith("ness") || word.endsWith("ment")) return "noun";
  if (word.endsWith("able") || word.endsWith("ible")) return "adjective";
  if (word.endsWith("ful") || word.endsWith("less")) return "adjective";

  // Default to noun for unknown words
  return "noun";
}

/**
 * Extract unique words from text with deduplication
 */
export function extractUniqueWords(
  text: string,
  options: TextProcessingOptions = {}
): string[] {
  const { minWordLength = 3, maxWordLength = 15 } = options;

  const { words } = tokenizeText(text);

  // Filter stop words
  let filtered = filterStopWords(words);

  // Filter by length
  filtered = filtered.filter(
    (w) => w.length >= minWordLength && w.length <= maxWordLength
  );

  // Remove duplicates
  return Array.from(new Set(filtered));
}

/**
 * Extract both words and phrases from content
 */
export function extractWordsAndPhrases(
  text: string,
  options: TextProcessingOptions = {}
): {
  words: string[];
  phrases: string[];
} {
  const {
    minWordLength = 3,
    maxWordLength = 15,
    includePhrases = true,
  } = options;

  const words = extractUniqueWords(text, { minWordLength, maxWordLength });
  const phrases = includePhrases
    ? extractPhrases(text, 2, 4)
        .filter((p) => !words.includes(p)) // Remove if already in words
        .slice(0, Math.max(10, Math.floor(words.length * 0.3))) // Limit phrases
    : [];

  return { words, phrases };
}

/**
 * Prepare extracted words for API submission
 * Requires Gemini enrichment for definitions, examples, etc.
 */
export function prepareExtractedWords(
  wordTexts: string[]
): Array<Omit<ExtractedWord, "definition" | "example_sentence">> {
  return wordTexts.map((word) => ({
    word_text: word,
    word_length: word.length,
    difficulty_level: calculateDifficultyLevel(word.length),
    part_of_speech: estimatePartOfSpeech(word),
  }));
}

/**
 * Detect language of text (simple heuristic - for production use proper library)
 */
export function detectLanguage(text: string): string {
  // Simple check for English words
  const englishWords = text.toLowerCase().match(/\b[a-z]+\b/g) || [];

  const englishStopWordsCount = englishWords.filter((w) =>
    ENGLISH_STOP_WORDS.has(w)
  ).length;

  // If >30% are stop words, likely English
  return englishStopWordsCount / englishWords.length > 0.3 ? "en" : "unknown";
}

/**
 * Validate text input for content extraction
 */
export function validateContentInput(
  content: string,
  maxLength: number = 5000
): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: "Content cannot be empty" };
  }

  if (content.length > maxLength) {
    return {
      valid: false,
      error: `Content exceeds maximum length of ${maxLength} characters`,
    };
  }

  // Check if content has meaningful words
  const { words } = tokenizeText(content);
  if (words.length < 5) {
    return { valid: false, error: "Content must contain at least 5 words" };
  }

  return { valid: true };
}

/**
 * Remove duplicates from extracted words that user already knows
 */
export function deduplicateAgainstExisting(
  extractedWords: string[],
  existingUserWords: string[]
): {
  newWords: string[];
  duplicates: string[];
} {
  const existing = new Set(existingUserWords.map((w) => w.toLowerCase()));

  const newWords: string[] = [];
  const duplicates: string[] = [];

  extractedWords.forEach((word) => {
    if (existing.has(word.toLowerCase())) {
      duplicates.push(word);
    } else {
      newWords.push(word);
    }
  });

  return { newWords, duplicates };
}

/**
 * Calculate statistics on extracted content
 */
export function getExtractionStats(extractedWords: ExtractedWord[]): {
  totalCount: number;
  uniqueCount: number;
  difficultyBreakdown: Record<DifficultyLevel, number>;
  averageWordLength: number;
  partOfSpeechBreakdown: Record<PartOfSpeech, number>;
} {
  const difficultyBreakdown: Record<DifficultyLevel, number> = {
    easy: 0,
    medium: 0,
    hard: 0,
    very_hard: 0,
  };

  const partOfSpeechBreakdown: Record<PartOfSpeech, number> = {
    noun: 0,
    verb: 0,
    adjective: 0,
    adverb: 0,
    phrase: 0,
    other: 0,
  };

  let totalLength = 0;

  extractedWords.forEach((word) => {
    difficultyBreakdown[word.difficulty_level]++;
    if (word.part_of_speech) {
      partOfSpeechBreakdown[word.part_of_speech]++;
    }
    totalLength += word.word_length;
  });

  return {
    totalCount: extractedWords.length,
    uniqueCount: new Set(extractedWords.map((w) => w.word_text.toLowerCase()))
      .size,
    difficultyBreakdown,
    averageWordLength:
      extractedWords.length > 0 ? totalLength / extractedWords.length : 0,
    partOfSpeechBreakdown,
  };
}
