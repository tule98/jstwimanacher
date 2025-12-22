/**
 * Wordmaster React Query Hooks
 * Custom hooks for data fetching and mutations with automatic caching
 */

"use client";

import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { wordmasterDb } from "@/services/wordmaster";
import type {
  UserSettings,
  DailyStats,
  FeedQuery,
  FeedWord,
  CreateWordInput,
  CreateUserWordInput,
  CreateReviewHistoryInput,
} from "@/services/wordmaster";

const QUERY_KEYS = {
  words: {
    all: ["words"] as const,
    detail: (id: string) => [...QUERY_KEYS.words.all, "detail", id] as const,
    byText: (text: string) =>
      [...QUERY_KEYS.words.all, "byText", text] as const,
  },
  userWords: {
    all: ["userWords"] as const,
    byUser: (userId: string) => [...QUERY_KEYS.userWords.all, userId] as const,
    detail: (userId: string, wordId: string) =>
      [...QUERY_KEYS.userWords.byUser(userId), wordId] as const,
  },
  feed: {
    all: ["feed"] as const,
    byUser: (userId: string) => [...QUERY_KEYS.feed.all, userId] as const,
    filtered: (userId: string, query: FeedQuery) =>
      [...QUERY_KEYS.feed.byUser(userId), query] as const,
  },
  reviews: {
    all: ["reviews"] as const,
    byUser: (userId: string) => [...QUERY_KEYS.reviews.all, userId] as const,
    recent: (userId: string, wordId: string) =>
      [...QUERY_KEYS.reviews.byUser(userId), "recent", wordId] as const,
  },
  settings: {
    all: ["userSettings"] as const,
    byUser: (userId: string) => [...QUERY_KEYS.settings.all, userId] as const,
  },
  stats: {
    all: ["stats"] as const,
    today: (userId: string) =>
      [...QUERY_KEYS.stats.all, userId, "today"] as const,
    range: (userId: string, startDate: string, endDate: string) =>
      [...QUERY_KEYS.stats.all, userId, "range", startDate, endDate] as const,
    vocabulary: (userId: string) =>
      [...QUERY_KEYS.stats.all, userId, "vocabulary"] as const,
  },
} as const;

// ============= WORDS HOOKS =============

/**
 * Fetch a single word by ID
 */
export function useWord(wordId: string | null) {
  return useQuery({
    queryKey: wordId ? QUERY_KEYS.words.detail(wordId) : ["disabled"],
    queryFn: async () => {
      if (!wordId) throw new Error("Word ID is required");
      return wordmasterDb.getWord(wordId);
    },
    enabled: !!wordId,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}

/**
 * Fetch word by text
 */
export function useWordByText(wordText: string | null) {
  return useQuery({
    queryKey: wordText ? QUERY_KEYS.words.byText(wordText) : ["disabled"],
    queryFn: async () => {
      if (!wordText) throw new Error("Word text is required");
      return wordmasterDb.getWordByText(wordText);
    },
    enabled: !!wordText,
    staleTime: 1000 * 60 * 60,
  });
}

/**
 * Create a new word
 */
export function useCreateWord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (word: CreateWordInput) => wordmasterDb.createWord(word),
    onSuccess: () => {
      // Invalidate words list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.words.all });
    },
  });
}

// ============= USER WORDS HOOKS =============

/**
 * Fetch user's word progress
 */
export function useUserWord(userId: string | null, wordId: string | null) {
  return useQuery({
    queryKey:
      userId && wordId
        ? QUERY_KEYS.userWords.detail(userId, wordId)
        : ["disabled"],
    queryFn: async () => {
      if (!userId || !wordId)
        throw new Error("User ID and Word ID are required");
      return wordmasterDb.getUserWord(userId, wordId);
    },
    enabled: !!userId && !!wordId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Add word to user's vocabulary
 */
export function useAddWordToUser(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateUserWordInput) => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.createUserWord(userId, input);
    },
    onSuccess: () => {
      if (!userId) return;
      // Invalidate feed and user words
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userWords.byUser(userId),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

/**
 * Batch add words to user's vocabulary
 */
export function useAddWordsToUser(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (wordIds: string[]) => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.addWordsToUser(userId, wordIds);
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userWords.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

/**
 * Update word memory level
 */
export function useUpdateWordMemory(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userWordId,
      newMemoryLevel,
    }: {
      userWordId: string;
      newMemoryLevel: number;
    }) => {
      return wordmasterDb.updateUserWordMemory(userWordId, newMemoryLevel);
    },
    onSuccess: () => {
      if (!userId) return;
      // Invalidate feed - priority might have changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

/**
 * Hook to update a word's memory level directly via API
 * Supports range 0-101 (101 = mastered state)
 */
export function useUpdateMemoryLevel(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { userWordId: string; memoryLevel: number }) => {
      const response = await fetch("/api/supabase/update-memory-level", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update memory level");
      }

      return response.json();
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

/**
 * Delete a word from user's vocabulary
 */
export function useDeleteWord(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userWordId: string) => {
      const response = await fetch("/api/supabase/delete-word", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userWordId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete word");
      }

      return response.json();
    },
    onSuccess: () => {
      if (!userId) return;
      // Invalidate feed and user words cache
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userWords.byUser(userId),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

// ============= FEED HOOKS =============

/**
 * Fetch feed with infinite scroll
 */
export function useFeed(userId: string | null, options: FeedQuery = {}) {
  type FeedWordsResponse = {
    words: FeedWord[];
    total: number;
    hasMore: boolean;
  };

  return useInfiniteQuery<
    FeedWordsResponse,
    Error,
    FeedWordsResponse,
    ReturnType<typeof QUERY_KEYS.feed.filtered>
  >({
    queryKey: QUERY_KEYS.feed.filtered(userId ?? "", options) as ReturnType<
      typeof QUERY_KEYS.feed.filtered
    >,
    queryFn: async ({ pageParam }) => {
      const page = (typeof pageParam === "number" ? pageParam : 0) as number;
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.getFeedWords(userId, { ...options, page });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.hasMore ? allPages.length : undefined,
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  });
}

/**
 * Simplified hook for initial feed load
 */
export function useInitialFeed(userId: string | null, limit: number = 50) {
  return useQuery({
    queryKey: userId
      ? QUERY_KEYS.feed.filtered(userId, { limit, page: 0 })
      : ["disabled"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      const result = await wordmasterDb.getFeedWords(userId, {
        limit,
        page: 0,
      });
      return result.words;
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
}

// ============= REVIEW HISTORY HOOKS =============

/**
 * Fetch recent reviews for quick learning detection
 */
export function useRecentReviews(
  userId: string | null,
  wordId: string | null,
  hoursBack: number = 48
) {
  return useQuery({
    queryKey:
      userId && wordId
        ? QUERY_KEYS.reviews.recent(userId, wordId)
        : ["disabled"],
    queryFn: async () => {
      if (!userId || !wordId)
        throw new Error("User ID and Word ID are required");
      return wordmasterDb.getRecentReviews(userId, wordId, hoursBack);
    },
    enabled: !!userId && !!wordId,
    staleTime: 1000 * 60 * 2, // 2 minutes - reviews change frequently
  });
}

/**
 * Create a review record
 */
export function useCreateReview(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: CreateReviewHistoryInput) => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.createReview(userId, review);
    },
    onSuccess: (newReview) => {
      if (!userId) return;
      // Invalidate recent reviews for this word
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.recent(userId, newReview!.word_id),
      });
      // Invalidate feed - memory changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.today(userId),
      });
    },
  });
}

// ============= USER SETTINGS HOOKS =============

/**
 * Fetch user settings
 */
export function useUserSettings(userId: string | null) {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.settings.byUser(userId) : ["disabled"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.getUserSettings(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 30, // 30 minutes - settings don't change often
  });
}

/**
 * Update user settings
 */
export function useUpdateUserSettings(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UserSettings>) => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.updateUserSettings(userId, updates);
    },
    onSuccess: (updatedSettings) => {
      if (!userId) return;
      // Update cache
      queryClient.setQueryData(
        QUERY_KEYS.settings.byUser(userId),
        updatedSettings
      );
      // Invalidate feed if decay rate or filters changed
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
    },
  });
}

// ============= DAILY STATS HOOKS =============

/**
 * Fetch today's stats
 */
export function useTodayStats(userId: string | null) {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.stats.today(userId) : ["disabled"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.getTodayStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes for real-time stats
  });
}

/**
 * Fetch stats for date range
 */
export function useStatsDateRange(
  userId: string | null,
  startDate: string | null,
  endDate: string | null
) {
  return useQuery({
    queryKey:
      userId && startDate && endDate
        ? QUERY_KEYS.stats.range(userId, startDate, endDate)
        : ["disabled"],
    queryFn: async () => {
      if (!userId || !startDate || !endDate) {
        throw new Error("User ID, start date, and end date are required");
      }
      return wordmasterDb.getStatsDateRange(userId, startDate, endDate);
    },
    enabled: !!userId && !!startDate && !!endDate,
    staleTime: 1000 * 60 * 60, // 1 hour - stats don't change frequently
  });
}

/**
 * Fetch vocabulary statistics
 */
export function useVocabularyStats(userId: string | null) {
  return useQuery({
    queryKey: userId ? QUERY_KEYS.stats.vocabulary(userId) : ["disabled"],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.getVocabularyStats(userId);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchInterval: 1000 * 60 * 10,
  });
}

/**
 * Update daily stats
 */
export function useUpdateDailyStats(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<DailyStats>) => {
      if (!userId) throw new Error("User ID is required");
      return wordmasterDb.updateDailyStats(userId, updates);
    },
    onSuccess: () => {
      if (!userId) return;
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.today(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.stats.vocabulary(userId),
      });
    },
  });
}

// ============= UTILITY HOOKS =============

/**
 * Hook for clearing specific query caches
 */
export function useClearCache() {
  const queryClient = useQueryClient();

  return {
    clearFeed: (userId: string) => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.feed.byUser(userId) });
    },
    clearWords: () => {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.words.all });
    },
    clearUserData: (userId: string) => {
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.userWords.byUser(userId),
      });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.feed.byUser(userId) });
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.reviews.byUser(userId),
      });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.stats.all });
    },
  };
}

/**
 * Hook for invalidating specific query caches
 */
export function useInvalidateCache() {
  const queryClient = useQueryClient();

  return {
    invalidateFeed: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
    },
    invalidateWords: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.words.all });
    },
    invalidateStats: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats.all });
    },
    invalidateUserData: (userId: string) => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userWords.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.feed.byUser(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.reviews.byUser(userId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats.all });
    },
  };
}
