/**
 * Wordmaster Feed Algorithm API
 * GET /api/supabase/feed
 *
 * Returns priority-sorted words from user's vocabulary
 * Supports filtering and sorting for infinite scroll pagination
 */

import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedRequest } from "@/lib/route-handlers";
import { wordmasterDb } from "@/services/wordmaster";
import type { FeedWord, MemoryLevelFilter } from "@/services/wordmaster";

interface FeedQuery {
  limit?: number;
  offset?: number;
  memoryLevel?: MemoryLevelFilter;
  difficulty?: "easy" | "medium" | "hard" | "very_hard";
  partOfSpeech?: string;
  sortBy?: "priority" | "memory" | "length" | "date" | "alphabetical";
}

/**
 * Calculate feed priority based on spaced repetition algorithm
 * Higher score = should review soon
 */
function calculateFeedPriority(word: FeedWord): number {
  const now = new Date().getTime();
  const lastReviewTime = word.userWord.last_reviewed_at
    ? new Date(word.userWord.last_reviewed_at).getTime()
    : 0;

  const timeSinceReview = now - lastReviewTime;
  const daysSinceReview = timeSinceReview / (1000 * 60 * 60 * 24);

  // Base priority from memory level (50 is default)
  let priority = 50;

  // Boost priority based on days since review
  if (daysSinceReview > 7) {
    priority += 30; // Very overdue
  } else if (daysSinceReview > 3) {
    priority += 20; // Moderately overdue
  } else if (daysSinceReview > 1) {
    priority += 10; // Slightly overdue
  }

  // Reduce priority for recently reviewed
  if (daysSinceReview < 0.5) {
    priority -= 20;
  }

  // Adjust based on memory level
  const memoryLevel = word.userWord.memory_level;
  if (memoryLevel < 20) {
    priority += 15; // Struggling words
  } else if (memoryLevel > 80) {
    priority -= 15; // Already mastered
  }

  return Math.max(0, Math.min(100, priority)); // Clamp 0-100
}

/**
 * Apply sorting to words
 */
function applySorting(
  words: FeedWord[],
  sortBy: FeedQuery["sortBy"] = "priority"
): FeedWord[] {
  const sorted = [...words];

  switch (sortBy) {
    case "priority":
      sorted.sort(
        (a, b) => calculateFeedPriority(b) - calculateFeedPriority(a)
      );
      break;

    case "memory":
      sorted.sort((a, b) => a.userWord.memory_level - b.userWord.memory_level);
      break;

    case "length":
      sorted.sort((a, b) => a.word.word_length - b.word.word_length);
      break;

    case "date":
      sorted.sort((wordA, wordB) => {
        const dateA = new Date(wordA.userWord.created_at).getTime();
        const dateB = new Date(wordB.userWord.created_at).getTime();
        return dateB - dateA; // Newest first
      });
      break;

    case "alphabetical":
      sorted.sort((a, b) => a.word.word_text.localeCompare(b.word.word_text));
      break;

    default:
      break;
  }

  return sorted;
}

/**
 * Apply filters to words
 */
function applyFilters(
  words: FeedWord[],
  memoryLevel?: MemoryLevelFilter,
  difficulty?: string,
  partOfSpeech?: string
): FeedWord[] {
  return words.filter((word) => {
    // Memory level filter
    if (memoryLevel) {
      if (memoryLevel === "learning" && word.userWord.memory_level >= 40) {
        return false;
      }
      if (
        memoryLevel === "reviewing" &&
        (word.userWord.memory_level < 40 || word.userWord.memory_level >= 70)
      ) {
        return false;
      }
      if (memoryLevel === "well_known" && word.userWord.memory_level < 70) {
        return false;
      }
    }

    // Difficulty filter
    if (difficulty && word.word.difficulty_level !== difficulty) {
      return false;
    }

    // Part of speech filter
    if (partOfSpeech && word.word.part_of_speech !== partOfSpeech) {
      return false;
    }

    return true;
  });
}

async function handleFeedRequest(
  request: AuthenticatedRequest
): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const memoryLevel = (searchParams.get("memoryLevel") || undefined) as
    | MemoryLevelFilter
    | undefined;
  const difficulty = searchParams.get("difficulty") || undefined;
  const partOfSpeech = searchParams.get("partOfSpeech") || undefined;
  const sortBy = (searchParams.get("sortBy") ||
    "priority") as FeedQuery["sortBy"];

  try {
    // Get all user words (we'll filter/sort in memory for flexibility)
    const userId = request.user.id;
    const feedWords = await wordmasterDb.getFeedWords(userId, {
      limit: 1000, // Get larger set for sorting/filtering
    });

    if (!feedWords || feedWords.words.length === 0) {
      return new NextResponse(
        JSON.stringify({
          words: [],
          totalCount: 0,
          hasMore: false,
          nextOffset: null,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Apply filters
    const filteredWords = applyFilters(
      feedWords.words,
      memoryLevel,
      difficulty,
      partOfSpeech
    );

    // Apply sorting
    const sortedWords = applySorting(filteredWords, sortBy);

    // Paginate
    const totalCount = sortedWords.length;
    const paginatedWords = sortedWords.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;
    const nextOffset = hasMore ? offset + limit : null;

    // Add priority scores to each word for frontend display
    const wordsWithPriority = paginatedWords.map((word) => ({
      ...word,
      priorityScore: calculateFeedPriority(word),
    }));

    return new NextResponse(
      JSON.stringify({
        words: wordsWithPriority,
        totalCount,
        hasMore,
        nextOffset,
        stats: {
          memoryBreakdown: {
            learning: filteredWords.filter((w) => w.userWord.memory_level < 40)
              .length,
            familiar: filteredWords.filter(
              (w) =>
                w.userWord.memory_level >= 40 && w.userWord.memory_level < 70
            ).length,
            mastered: filteredWords.filter((w) => w.userWord.memory_level >= 70)
              .length,
          },
          difficultyBreakdown: {
            easy: filteredWords.filter(
              (w) => w.word.difficulty_level === "easy"
            ).length,
            medium: filteredWords.filter(
              (w) => w.word.difficulty_level === "medium"
            ).length,
            hard: filteredWords.filter(
              (w) => w.word.difficulty_level === "hard"
            ).length,
            very_hard: filteredWords.filter(
              (w) => w.word.difficulty_level === "very_hard"
            ).length,
          },
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Feed request error:", error);
    throw error;
  }
}

export const GET = withAuth(handleFeedRequest);
