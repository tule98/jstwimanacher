/**
 * Wordmaster Content Extraction Hook
 * Handles extraction and enrichment of words from user content
 */

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ExtractWordsRequest,
  ExtractedWord,
  ExtractionPreview,
} from "@/services/wordmaster";

interface ExtractWordsResponse {
  preview: ExtractionPreview;
  words: ExtractedWord[];
}

/**
 * Hook for extracting words from content
 * Handles API communication with the extraction endpoint
 */
export function useExtractWords() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      request: ExtractWordsRequest
    ): Promise<ExtractWordsResponse> => {
      const response = await fetch("/api/supabase/extract-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to extract words");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate words cache since new words might have been added
      queryClient.invalidateQueries({ queryKey: ["words"] });
    },
  });
}

/**
 * Hook for enriching extracted words with definitions, phonetics, examples
 * Requires Gemini API integration
 */
export function useEnrichWords() {
  return useMutation({
    mutationFn: async (
      words: Array<{ word_text: string }>
    ): Promise<ExtractedWord[]> => {
      const response = await fetch("/api/supabase/enrich-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ words }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to enrich words");
      }

      return response.json();
    },
  });
}

/**
 * Hook for adding extracted words to user's vocabulary
 */
export function useAddExtractedWords(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (extractedWords: ExtractedWord[]) => {
      if (!userId) throw new Error("User ID is required");

      const response = await fetch("/api/supabase/add-extracted-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          words: extractedWords,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add words");
      }

      return response.json();
    },
    onSuccess: () => {
      if (!userId) return;
      // Invalidate user's vocabulary and feed
      queryClient.invalidateQueries({ queryKey: ["feed", userId] });
      queryClient.invalidateQueries({
        queryKey: ["stats", userId, "vocabulary"],
      });
    },
  });
}
