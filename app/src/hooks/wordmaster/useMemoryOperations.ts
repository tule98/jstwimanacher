/**
 * Wordmaster Memory Operations Hook
 * Handles memory updates with smart calculation and quick learning detection
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  calculateMemoryIncrease,
  shouldMarkAsQuickLearner,
  type ReviewHistory,
} from "@/services/wordmaster";
import { wordmasterDb } from "@/services/wordmaster";

interface MarkAsKnownInput {
  userId: string;
  userWordId: string;
  wordId: string;
  currentMemoryLevel: number;
  isQuickLearner: boolean;
  quickLearningEnabled: boolean;
}

interface MarkAsKnownResponse {
  newMemoryLevel: number;
  bonusApplied: number;
  isQuickLearner: boolean;
  reason: string;
}

/**
 * Hook for marking a word as known with smart memory calculation
 */
export function useMarkAsKnown(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      input: MarkAsKnownInput
    ): Promise<MarkAsKnownResponse> => {
      // Get recent reviews for quick learning detection
      const recentReviews = await wordmasterDb.getRecentReviews(
        input.userId,
        input.wordId,
        48 // Last 48 hours
      );

      // Calculate memory increase with bonus detection
      const result = await calculateMemoryIncrease(
        input.currentMemoryLevel,
        recentReviews,
        input.isQuickLearner,
        input.quickLearningEnabled
      );

      // Update memory level in database
      await wordmasterDb.updateUserWordMemory(
        input.userWordId,
        result.newMemoryLevel
      );

      // Create review record
      await wordmasterDb.createReview(input.userId, {
        word_id: input.wordId,
        user_word_id: input.userWordId,
        action_type: "marked_known",
        memory_before: input.currentMemoryLevel,
        memory_after: result.newMemoryLevel,
        memory_change: result.totalIncrease,
      });

      // Check if should mark as quick learner
      const shouldBeQuickLearner = shouldMarkAsQuickLearner(recentReviews, 2);

      return {
        newMemoryLevel: result.newMemoryLevel,
        bonusApplied: result.bonusIncrease,
        isQuickLearner: shouldBeQuickLearner,
        reason: result.reason,
      };
    },
    onSuccess: (data, input) => {
      if (!userId) return;
      // Invalidate feed and stats after memory update
      queryClient.invalidateQueries({ queryKey: ["feed", userId] });
      queryClient.invalidateQueries({ queryKey: ["stats", userId] });
      queryClient.invalidateQueries({
        queryKey: ["reviews", userId, "recent", input.wordId],
      });
    },
  });
}

/**
 * Hook for marking a word as needing review
 */
export function useMarkForReview(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      userWordId: string;
      wordId: string;
      currentMemoryLevel: number;
    }) => {
      // Create review record without memory change
      const review = await wordmasterDb.createReview(input.userId, {
        word_id: input.wordId,
        user_word_id: input.userWordId,
        action_type: "marked_review",
        memory_before: input.currentMemoryLevel,
        memory_after: input.currentMemoryLevel,
        memory_change: 0,
      });

      return review;
    },
    onSuccess: (data, input) => {
      if (!userId) return;
      // Invalidate feed - word should reappear sooner
      queryClient.invalidateQueries({ queryKey: ["feed", userId] });
      queryClient.invalidateQueries({
        queryKey: ["reviews", userId, "recent", input.wordId],
      });
    },
  });
}

/**
 * Hook for skipping a word (no action taken)
 */
export function useSkipWord(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      userId: string;
      userWordId: string;
      wordId: string;
      currentMemoryLevel: number;
    }) => {
      // Create review record for tracking
      const review = await wordmasterDb.createReview(input.userId, {
        word_id: input.wordId,
        user_word_id: input.userWordId,
        action_type: "skipped",
        memory_before: input.currentMemoryLevel,
        memory_after: input.currentMemoryLevel,
        memory_change: 0,
      });

      return review;
    },
    onSuccess: (data, input) => {
      if (!userId) return;
      queryClient.invalidateQueries({
        queryKey: ["reviews", userId, "recent", input.wordId],
      });
    },
  });
}

/**
 * Hook for batch updating memory after viewing
 */
export function useBatchMemoryUpdate(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      updates: Array<{
        userWordId: string;
        wordId: string;
        newMemoryLevel: number;
        previousMemoryLevel: number;
      }>
    ) => {
      // Update all in database
      const results = await Promise.all(
        updates.map(async (update) => {
          await wordmasterDb.updateUserWordMemory(
            update.userWordId,
            update.newMemoryLevel
          );

          // Create review records
          if (userId) {
            await wordmasterDb.createReview(userId, {
              word_id: update.wordId,
              user_word_id: update.userWordId,
              action_type: "marked_known",
              memory_before: update.previousMemoryLevel,
              memory_after: update.newMemoryLevel,
              memory_change: update.newMemoryLevel - update.previousMemoryLevel,
            });
          }
        })
      );

      return results;
    },
    onSuccess: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey: ["feed", userId] });
      queryClient.invalidateQueries({ queryKey: ["stats", userId] });
    },
  });
}
