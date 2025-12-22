"use client";

import { useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useFeed } from "@/hooks/wordmaster";
import { FlashcardCard } from "./FlashcardCard";
import type { FeedWord, SortOption } from "@/services/wordmaster";

interface WordsFeedProps {
  userId: string;
  limit?: number;
}

type FilterOption = "learning" | "reviewing" | "well_known" | "all";

/**
 * Infinite scroll newsfeed component with vertical card layout
 * Integrates with React Query for pagination and memory operations
 */
export function WordsFeed({ userId, limit = 3 }: WordsFeedProps) {
  const searchParams = useSearchParams();

  // Read sort and filter from URL params
  const sortBy = (searchParams.get("sort") as SortOption) || "memory_level";
  const filterBy = (searchParams.get("filter") as FilterOption) || "all";

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch feed words with React Query
  const {
    data: feedData,
    isPending,
    error,
  } = useFeed(userId, {
    limit,
    sortBy: sortBy as SortOption | undefined,
    memoryLevelFilter:
      filterBy !== "all"
        ? (filterBy as "learning" | "reviewing" | "well_known")
        : undefined,
  });

  // Flatten paginated words
  const pages =
    (
      feedData as unknown as {
        pages?: Array<{ words?: FeedWord[]; total?: number }>;
      }
    )?.pages ?? [];
  const allWords: FeedWord[] = pages.flatMap((page) => page.words ?? []);
  const totalCount = pages[0]?.total ?? 0;

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

  const currentWord = allWords[0]; // Show first word only

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        padding: "16px",
        gap: "16px",
        position: "relative",
        backgroundColor: "#130f23",
        overflow: "hidden",
      }}
    >
      {/* Animated Background Orbs */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {/* Top-left orb - Primary Blue */}
        <Box
          sx={{
            position: "absolute",
            top: "-80px",
            left: "-80px",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(67, 24, 255, 0.4) 0%, rgba(67, 24, 255, 0) 100%)",
            filter: "blur(100px)",
            animation: "pulse 8s ease-in-out infinite",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 0.4 },
              "50%": { transform: "scale(1.2)", opacity: 0.6 },
            },
          }}
        />

        {/* Bottom-right orb - Purple */}
        <Box
          sx={{
            position: "absolute",
            bottom: "-120px",
            right: "-80px",
            width: "384px",
            height: "384px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(147, 51, 234, 0.2) 0%, rgba(147, 51, 234, 0) 100%)",
            filter: "blur(120px)",
            animation: "pulse 10s ease-in-out infinite",
            animationDelay: "2s",
            "@keyframes pulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 0.2 },
              "50%": { transform: "scale(1.1)", opacity: 0.4 },
            },
          }}
        />

        {/* Center orb - Blue */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "256px",
            height: "256px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0) 100%)",
            filter: "blur(80px)",
            transform: "translate(-50%, -50%)",
            animation: "pulse 12s ease-in-out infinite",
            animationDelay: "4s",
            "@keyframes pulse": {
              "0%, 100%": {
                transform: "translate(-50%, -50%) scale(1)",
                opacity: 0.1,
              },
              "50%": {
                transform: "translate(-50%, -50%) scale(1.15)",
                opacity: 0.2,
              },
            },
          }}
        />
      </Box>

      {/* Relative content container */}
      <Box sx={{ position: "relative", zIndex: 10 }}>
        {/* Progress Header */}
        <Box
          sx={{
            backgroundColor: "rgba(30, 27, 46, 0.4)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            padding: "12px 16px",
            borderRadius: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Close Button */}
          <Button
            sx={{
              minWidth: "40px",
              width: "40px",
              height: "40px",
              padding: 0,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "transparent",
              color: "rgba(255, 255, 255, 0.5)",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                color: "rgba(255, 255, 255, 0.8)",
              },
            }}
          >
            ✕
          </Button>

          {/* Center Title and Progress */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.9)",
                letterSpacing: "0.05em",
                textTransform: "capitalize",
                marginBottom: "6px",
              }}
            >
              English Vocabulary
            </Typography>
            {/* Progress Bar */}
            <Box
              sx={{
                width: "64px",
                height: "4px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: `${(1 / Math.max(totalCount, 1)) * 100}%`,
                  backgroundColor: "#4318FF",
                  borderRadius: "2px",
                  boxShadow: "0 0 10px rgba(67, 24, 255, 0.8)",
                  transition: "width 0.3s ease",
                }}
              />
            </Box>
          </Box>

          {/* Card Counter */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#a09abc",
              letterSpacing: "0.05em",
              minWidth: "40px",
              textAlign: "right",
            }}
          >
            1/{totalCount}
          </Typography>
        </Box>
      </Box>

      {/* Single Card View */}
      {currentWord && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            flex: 1,
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Flashcard */}
          <Box
            sx={{
              width: "100%",
            }}
          >
            <FlashcardCard
              word={currentWord}
              userId={userId}
              variant="compact"
              showStats={true}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
}
