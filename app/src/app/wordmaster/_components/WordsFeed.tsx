"use client";

import { useCallback, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Box,
  Stack,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useInView } from "react-intersection-observer";
import { useFeed } from "@/hooks/wordmaster";
import {
  useMarkAsKnown,
  useMarkForReview,
  useSkipWord,
} from "@/hooks/wordmaster";
import { FlashcardCard } from "./FlashcardCard";
import type { FeedWord, SortOption } from "@/services/wordmaster";
import { triggerHaptic } from "@/lib/interactions";
import { useToast } from "@/lib/toast-context";

interface WordsFeedProps {
  userId: string;
  limit?: number;
  onWordReviewed?: (word: FeedWord) => void;
}

type FilterOption = "learning" | "reviewing" | "well_known" | "all";

/**
 * Infinite scroll newsfeed component with vertical card layout
 * Integrates with React Query for pagination and memory operations
 */
export function WordsFeed({
  userId,
  limit = 50,
  onWordReviewed,
}: WordsFeedProps) {
  const searchParams = useSearchParams();

  // Read sort and filter from URL params
  const sortBy = (searchParams.get("sort") as SortOption) || "priority";
  const filterBy = (searchParams.get("filter") as FilterOption) || "all";

  const containerRef = useRef<HTMLDivElement>(null);
  const { ref: endRef, inView } = useInView({
    threshold: 0.5,
    rootMargin: "100px",
  });
  const toast = useToast();

  // Fetch feed words with React Query
  const {
    data: feedData,
    hasNextPage,
    fetchNextPage,
    isPending,
    isFetchingNextPage,
    error,
  } = useFeed(userId, {
    limit,
    sortBy: sortBy as SortOption | undefined,
    memoryLevelFilter:
      filterBy !== "all"
        ? (filterBy as "learning" | "reviewing" | "well_known")
        : undefined,
  });

  // Memory operation hooks
  const markAsKnown = useMarkAsKnown(userId);
  const markForReview = useMarkForReview(userId);
  const skipWord = useSkipWord(userId);

  // Flatten paginated words
  const pages =
    (feedData as unknown as { pages?: Array<{ words?: FeedWord[] }> })?.pages ??
    [];
  const allWords: FeedWord[] = pages.flatMap((page) => page.words ?? []);

  // Load more when near end
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle memory operations
  const handleMarkKnown = useCallback(
    async (word: FeedWord) => {
      if (!userId) return;

      try {
        triggerHaptic("medium");
        await markAsKnown.mutateAsync({
          userId,
          userWordId: word.userWord.id,
          wordId: word.word.id,
          currentMemoryLevel: word.userWord.memory_level,
          isQuickLearner: word.userWord.is_quick_learner,
          quickLearningEnabled: true,
        });

        toast.success(`✓ Marked "${word.word.word_text}" as known!`);
        onWordReviewed?.(word);
      } catch (error) {
        triggerHaptic("error");
        toast.error(
          error instanceof Error ? error.message : "Failed to mark as known"
        );
        console.error("Failed to mark as known:", error);
      }
    },
    [userId, markAsKnown, onWordReviewed, toast]
  );

  const handleMarkForReview = useCallback(
    async (word: FeedWord) => {
      if (!userId) return;

      try {
        triggerHaptic("medium");
        await markForReview.mutateAsync({
          userId,
          userWordId: word.userWord.id,
          wordId: word.word.id,
          currentMemoryLevel: word.userWord.memory_level,
        });

        toast.info(`⟲ "${word.word.word_text}" marked for review`);
        onWordReviewed?.(word);
      } catch (error) {
        triggerHaptic("error");
        toast.error(
          error instanceof Error ? error.message : "Failed to mark for review"
        );
        console.error("Failed to mark for review:", error);
      }
    },
    [userId, markForReview, onWordReviewed, toast]
  );

  const handleSkip = useCallback(
    async (word: FeedWord) => {
      if (!userId) return;

      try {
        triggerHaptic("light");
        await skipWord.mutateAsync({
          userId,
          userWordId: word.userWord.id,
          wordId: word.word.id,
          currentMemoryLevel: word.userWord.memory_level,
        });

        toast.warning(`⊘ Skipped "${word.word.word_text}"`);
        onWordReviewed?.(word);
      } catch (error) {
        triggerHaptic("error");
        toast.error(error instanceof Error ? error.message : "Failed to skip");
        console.error("Failed to skip:", error);
      }
    },
    [userId, skipWord, onWordReviewed, toast]
  );

  // Loading state
  if (isPending && !allWords.length) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
        }}
      >
        <CircularProgress
          sx={{
            color: "rgba(67, 24, 255, 0.6)",
          }}
        />
        <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
          Loading vocabulary...
        </Typography>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          padding: "20px",
        }}
      >
        <Typography variant="h6" sx={{ color: "#FF6B35", textAlign: "center" }}>
          ⚠️ Failed to load vocabulary
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
          }}
        >
          {error instanceof Error ? error.message : "Unknown error"}
        </Typography>
      </Box>
    );
  }

  // Empty state
  if (allWords.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: "16px",
          padding: "20px",
        }}
      >
        <Typography variant="h4" sx={{ marginBottom: "8px" }}>
          📚 No words yet
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            textAlign: "center",
            maxWidth: "300px",
          }}
        >
          Add words from lyrics, paragraphs, or topics to start building your
          vocabulary
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowY: "auto",
        padding: "16px",
        gap: "16px",
      }}
    >
      {/* Progress Header */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "rgba(15, 15, 15, 0.8)",
          backdropFilter: "blur(10px)",
          padding: "12px 16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "rgba(255, 255, 255, 0.6)",
            fontSize: "12px",
          }}
        >
          {allWords.length} words loaded
        </Typography>
        <Box
          sx={{
            height: "4px",
            flex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "2px",
            margin: "0 12px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${allWords.length > 0 ? 100 : 0}%`,
              background: "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
              transition: "width 0.3s ease-out",
            }}
          />
        </Box>
      </Box>

      {/* Words Feed */}
      <Stack spacing={2}>
        {allWords.map((word, index) => (
          <Box
            key={`${word.word.id}-${index}`}
            ref={index === allWords.length - 1 ? endRef : null}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {/* Flashcard */}
              <Box
                sx={{
                  width: "100%",
                }}
              >
                <FlashcardCard
                  word={word}
                  userId={userId}
                  variant="compact"
                  showStats={true}
                />
              </Box>

              {/* Action Buttons Row */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  justifyContent: "center",
                  paddingX: "8px",
                }}
              >
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleSkip(word)}
                  disabled={
                    markAsKnown.isPending ||
                    markForReview.isPending ||
                    skipWord.isPending
                  }
                  sx={{
                    background: "rgba(255, 107, 53, 0.2)",
                    color: "#FF6B35",
                    border: "1px solid rgba(255, 107, 53, 0.3)",
                    "&:hover": {
                      background: "rgba(255, 107, 53, 0.3)",
                    },
                    "&:disabled": {
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  Skip
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleMarkForReview(word)}
                  disabled={
                    markAsKnown.isPending ||
                    markForReview.isPending ||
                    skipWord.isPending
                  }
                  sx={{
                    background: "rgba(107, 138, 255, 0.2)",
                    color: "#6B8AFF",
                    border: "1px solid rgba(107, 138, 255, 0.3)",
                    "&:hover": {
                      background: "rgba(107, 138, 255, 0.3)",
                    },
                    "&:disabled": {
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  Review
                </Button>

                <Button
                  variant="contained"
                  size="small"
                  onClick={() => handleMarkKnown(word)}
                  disabled={
                    markAsKnown.isPending ||
                    markForReview.isPending ||
                    skipWord.isPending
                  }
                  sx={{
                    background:
                      "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
                    color: "#FFFFFF",
                    flex: 1,
                    "&:hover": {
                      background:
                        "linear-gradient(90deg, #5629FF 0%, #7B9AFF 100%)",
                    },
                    "&:disabled": {
                      background: "rgba(255, 255, 255, 0.1)",
                      color: "rgba(255, 255, 255, 0.3)",
                    },
                  }}
                >
                  ✓ Known
                </Button>
              </Stack>
            </Box>
          </Box>
        ))}
      </Stack>

      {/* Loading More Indicator */}
      {isFetchingNextPage && (
        <Box
          ref={endRef}
          sx={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            justifyContent: "center",
            paddingY: "16px",
          }}
        >
          <CircularProgress
            size={16}
            sx={{ color: "rgba(67, 24, 255, 0.6)" }}
          />
          <Typography
            variant="caption"
            sx={{ color: "rgba(255, 255, 255, 0.6)" }}
          >
            Loading more words...
          </Typography>
        </Box>
      )}

      {/* End of Feed Indicator */}
      {!hasNextPage && allWords.length > 0 && (
        <Box
          sx={{
            textAlign: "center",
            paddingY: "24px",
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: "rgba(255, 255, 255, 0.5)" }}
          >
            🎉 You&apos;ve reached the end of your vocabulary feed
          </Typography>
        </Box>
      )}
    </Box>
  );
}
