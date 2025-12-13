"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  Typography,
  Chip,
  Button,
  CircularProgress,
  Alert,
  IconButton,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "sonner";
import { useDeleteWord } from "@/hooks/wordmaster";
import type { FeedWord } from "@/services/wordmaster";

/**
 * Custom hook for text-to-speech functionality using Web Speech API
 */
function useTextToSpeech() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if speechSynthesis is available
    const supported =
      typeof window !== "undefined" &&
      typeof window.speechSynthesis !== "undefined";
    setIsSupported(supported);
  }, []);

  const speak = (text: string) => {
    if (!isSupported) {
      toast.error("Text-to-speech is not supported in your browser");
      return;
    }

    try {
      // Stop any currently playing speech
      if (isPlaying) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 1;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        toast.error("Failed to play audio");
      };

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error("TTS error:", error);
      setIsPlaying(false);
      toast.error("Text-to-speech error");
    }
  };

  return { speak, isPlaying, isSupported };
}

interface FlashcardCardProps {
  word: FeedWord & { priorityScore?: number };
  userId?: string;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
  showStats?: boolean;
  variant?: "full" | "compact";
  onWordUpdated?: (updatedWord: FeedWord) => void;
}

/**
 * Reusable flashcard component with flip animation and memory visualization
 */
export function FlashcardCard({
  word,
  userId,
  onFlip,
  className,
  showStats = true,
  variant = "full",
  onWordUpdated,
}: FlashcardCardProps) {
  const queryClient = useQueryClient();
  const [isFlipped, setIsFlipped] = useState(false);
  const [isEnriching, setIsEnriching] = useState(false);
  const [enrichError, setEnrichError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { speak, isPlaying, isSupported } = useTextToSpeech();
  const deleteWordMutation = useDeleteWord(userId || null);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  const handleDeleteWord = async () => {
    if (!word.userWord?.id) {
      toast.error("Cannot delete word");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteWordMutation.mutateAsync(word.userWord.id);
      toast.success("Word deleted");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete word"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReEnrichWord = async () => {
    setIsEnriching(true);
    setEnrichError(null);

    try {
      console.log("Re-enrich starting for word ID:", word.word.id, word.word);

      // Step 1: Enrich the word with Gemini
      const enrichResponse = await fetch("/api/supabase/enrich-words", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: [{ word_text: word.word.word_text }],
        }),
      });

      if (!enrichResponse.ok) {
        throw new Error("Failed to enrich word");
      }

      const [enrichedData] = await enrichResponse.json();
      console.log("Enriched data received:", enrichedData);

      // Step 2: Update the word in database
      const updatePayload = {
        wordId: word.word.id,
        definition: enrichedData.definition,
        phonetic: enrichedData.phonetic,
        example_sentence: enrichedData.example,
        part_of_speech: enrichedData.partOfSpeech,
      };
      console.log("Sending update payload:", updatePayload);

      const updateResponse = await fetch(
        "/api/wordmaster/update-word-enrichment",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      const updateData = await updateResponse.json();
      console.log("Update response:", updateData, updateResponse.ok);

      if (!updateResponse.ok) {
        throw new Error(
          updateData.error || "Failed to save enriched word data"
        );
      }

      // Step 3: Update local state
      const updatedWord: FeedWord = {
        ...word,
        word: {
          ...word.word,
          definition: enrichedData.definition,
          phonetic: enrichedData.phonetic,
          example_sentence: enrichedData.example,
          part_of_speech: enrichedData.partOfSpeech,
        },
      };

      // Invalidate React Query feed cache to sync with database
      if (userId) {
        queryClient.invalidateQueries({
          queryKey: ["feed", userId],
        });
        // Also invalidate the words detail cache
        queryClient.invalidateQueries({
          queryKey: ["words", "detail", word.word.id],
        });
      }

      // Notify parent component
      onWordUpdated?.(updatedWord);
    } catch (error) {
      console.error("Re-enrich error:", error);
      setEnrichError(
        error instanceof Error ? error.message : "Failed to re-enrich word"
      );
    } finally {
      setIsEnriching(false);
    }
  };

  const memoryLevel = word.userWord.memory_level;
  const difficultyLevel = word.word.difficulty_level;

  // Variant-based sizing
  const isCompact = variant === "compact";
  const cardHeight = isCompact ? "auto" : "100%";
  const minHeight = isCompact ? "180px" : "400px";
  const padding = isCompact ? "16px" : "32px";
  const wordFontSize = isCompact ? "24px" : "48px";
  const gapSize = isCompact ? "12px" : "24px";

  // Difficulty badge styling
  const getDifficultyStyle = () => {
    const baseStyle = {
      fontWeight: 600,
      fontSize: "0.75rem",
      borderRadius: "8px",
    };

    switch (difficultyLevel) {
      case "easy":
        return {
          ...baseStyle,
          backgroundColor: "rgba(107, 178, 94, 0.2)",
          color: "#6BB25E",
        };
      case "medium":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255, 182, 39, 0.2)",
          color: "#FFB627",
        };
      case "hard":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255, 107, 53, 0.2)",
          color: "#FF6B35",
        };
      case "very_hard":
        return {
          ...baseStyle,
          backgroundColor: "rgba(67, 24, 255, 0.2)",
          color: "#4318FF",
        };
      default:
        return baseStyle;
    }
  };

  return (
    <Card
      onClick={handleFlip}
      sx={{
        cursor: "pointer",
        perspective: "1000px",
        height: cardHeight,
        minHeight: minHeight,
        background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`,
        backdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: "24px",
        padding: padding,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        transition: "all 0.3s ease-out",
        position: "relative",
        overflow: "hidden",
        "&:hover": {
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)`,
          backdropFilter: "blur(40px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `linear-gradient(135deg, transparent 0%, rgba(67, 24, 255, 0.1) 100%)`,
          pointerEvents: "none",
          borderRadius: "24px",
        },
        className,
      }}
    >
      {/* Front Side (Word) */}
      {!isFlipped && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: gapSize,
            width: "100%",
            animation: "fadeIn 0.3s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "scale(0.95)" },
              to: { opacity: 1, transform: "scale(1)" },
            },
          }}
        >
          {/* Word and Phonetic */}
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                marginBottom: "8px",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: wordFontSize,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  wordBreak: "break-word",
                }}
              >
                {word.word.word_text}
              </Typography>
              {isSupported && (
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(word.word.word_text);
                  }}
                  size="small"
                  sx={{
                    color: isPlaying
                      ? "rgba(107, 138, 255, 1)"
                      : "rgba(255, 255, 255, 0.7)",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      color: "rgba(255, 255, 255, 1)",
                      backgroundColor: "rgba(107, 138, 255, 0.1)",
                    },
                  }}
                >
                  <VolumeUpIcon sx={{ fontSize: "24px" }} />
                </IconButton>
              )}
            </Box>
            {word.word.phonetic && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: isCompact ? "13px" : "16px",
                  color: "rgba(255, 255, 255, 0.7)",
                  fontStyle: "italic",
                }}
              >
                {word.word.phonetic}
              </Typography>
            )}
          </Box>

          {/* Difficulty Badge */}
          {!isCompact && (
            <Box>
              <Chip
                label={
                  difficultyLevel.charAt(0).toUpperCase() +
                  difficultyLevel.slice(1)
                }
                sx={{
                  ...getDifficultyStyle(),
                  padding: "8px 12px",
                }}
              />
            </Box>
          )}

          {/* Tap to Flip Hint */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              marginTop: isCompact ? "0px" : "16px",
              fontStyle: "italic",
            }}
          >
            Tap to reveal definition
          </Typography>
        </Box>
      )}

      {/* Back Side (Definition & Example) */}
      {isFlipped && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: isCompact ? "12px" : "20px",
            width: "100%",
            animation: "fadeIn 0.3s ease-out",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "scale(0.95)" },
              to: { opacity: 1, transform: "scale(1)" },
            },
          }}
        >
          {/* Definition */}
          <Box>
            <Typography
              variant="caption"
              sx={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "1px",
                display: "block",
                marginBottom: "8px",
              }}
            >
              Definition
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: isCompact ? "14px" : "16px",
                color: "#FFFFFF",
                lineHeight: 1.6,
                paddingTop: "8px",
              }}
            >
              {word.word.definition}
            </Typography>
          </Box>

          {/* Example Sentence */}
          {word.word.example_sentence && (
            <Box
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: isCompact ? "10px" : "12px",
                borderLeft: "3px solid rgba(107, 138, 255, 0.5)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "11px",
                  color: "rgba(255, 255, 255, 0.6)",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  display: "block",
                  marginBottom: "6px",
                }}
              >
                Example
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontSize: isCompact ? "12px" : "14px",
                  color: "#FFFFFF",
                  fontStyle: "italic",
                  lineHeight: 1.5,
                }}
              >
                &quot;{word.word.example_sentence}&quot;
              </Typography>
            </Box>
          )}

          {/* Part of Speech */}
          {word.word.part_of_speech && (
            <Typography
              variant="caption"
              sx={{
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              <strong>{word.word.part_of_speech.toUpperCase()}</strong>
            </Typography>
          )}

          {/* Tap to Flip Back Hint */}
          <Typography
            variant="caption"
            sx={{
              fontSize: "12px",
              color: "rgba(255, 255, 255, 0.5)",
              marginTop: isCompact ? "0px" : "8px",
              fontStyle: "italic",
            }}
          >
            Tap to flip back
          </Typography>

          {/* Re-enrich and Delete Buttons */}
          <Box sx={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleReEnrichWord();
              }}
              disabled={isEnriching}
              startIcon={
                isEnriching ? (
                  <CircularProgress size={16} sx={{ color: "#6B8AFF" }} />
                ) : (
                  <RefreshIcon />
                )
              }
              sx={{
                flex: 1,
                background: "rgba(107, 138, 255, 0.2)",
                color: "#6B8AFF",
                border: "1px solid rgba(107, 138, 255, 0.3)",
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 12px",
                "&:hover": {
                  background: "rgba(107, 138, 255, 0.3)",
                },
                "&:disabled": {
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              {isEnriching ? "Re-enriching..." : "Re-enrich"}
            </Button>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWord();
              }}
              disabled={isDeleting}
              startIcon={
                isDeleting ? (
                  <CircularProgress size={16} sx={{ color: "#FF6B35" }} />
                ) : (
                  <DeleteIcon />
                )
              }
              sx={{
                flex: 1,
                background: "rgba(255, 107, 53, 0.2)",
                color: "#FF6B35",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                borderRadius: "12px",
                textTransform: "none",
                fontSize: "12px",
                fontWeight: 600,
                padding: "6px 12px",
                "&:hover": {
                  background: "rgba(255, 107, 53, 0.3)",
                },
                "&:disabled": {
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "rgba(255, 255, 255, 0.3)",
                },
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </Box>

          {/* Error message */}
          {enrichError && (
            <Alert
              severity="error"
              sx={{
                marginTop: "12px",
                backgroundColor: "rgba(255, 107, 53, 0.2)",
                color: "#FF6B35",
                border: "1px solid rgba(255, 107, 53, 0.3)",
                fontSize: "12px",
                "& .MuiAlert-icon": {
                  color: "#FF6B35",
                },
              }}
            >
              {enrichError}
            </Alert>
          )}
        </Box>
      )}

      {/* Memory Bar (Bottom) */}
      {showStats && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0 0 24px 24px",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${memoryLevel}%`,
              background: `linear-gradient(90deg, #FF6B35 0%, #FFB627 25%, #6B8AFF 75%, #4318FF 100%)`,
              borderRadius: "0 0 24px 0",
              transition: "width 0.3s ease-out",
            }}
          />
        </Box>
      )}

      {/* Memory Level Badge (Top Right) */}
      {showStats && (
        <Box
          sx={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            padding: "4px 12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "11px",
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            {Math.round(memoryLevel)}%
          </Typography>
        </Box>
      )}

      {/* Priority Score Badge (Top Left) */}
      {word.priorityScore !== undefined && (
        <Box
          sx={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            backdropFilter: "blur(10px)",
            borderRadius: "12px",
            padding: "4px 12px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              fontSize: "11px",
              color: "#FFFFFF",
              fontWeight: 600,
            }}
          >
            Priority: {Math.round(word.priorityScore)}
          </Typography>
        </Box>
      )}
    </Card>
  );
}
