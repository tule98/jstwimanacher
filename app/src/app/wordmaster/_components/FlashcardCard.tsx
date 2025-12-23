"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Card,
  Typography,
  Button,
  IconButton,
  CircularProgress,
  Alert,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import DeleteIcon from "@mui/icons-material/Delete";
import StarIcon from "@mui/icons-material/Star";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "sonner";
import { useDeleteWord, useUpdateMemoryLevel } from "@/hooks/wordmaster";
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

  const speak = useCallback(
    (text: string, options?: { silent?: boolean }) => {
      if (!isSupported) {
        if (!options?.silent) {
          toast.error("Text-to-speech is not supported in your browser");
        }
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
          // Only show error if not silent mode (auto-play)
          if (!options?.silent) {
            toast.error("Failed to play audio");
          }
        };

        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error("TTS error:", error);
        setIsPlaying(false);
        if (!options?.silent) {
          toast.error("Text-to-speech error");
        }
      }
    },
    [isSupported, isPlaying]
  );

  return { speak, isPlaying, isSupported };
}

// Memory range definitions
const memoryRanges = [
  { label: "1-20", min: 1, max: 20 },
  { label: "20-40", min: 20, max: 40 },
  { label: "40-60", min: 40, max: 60 },
  { label: "60-80", min: 60, max: 80 },
  { label: "80-100", min: 80, max: 100 },
  { label: "101", min: 101, max: 101 },
];

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
  const updateMemoryLevelMutation = useUpdateMemoryLevel(userId || null);
  const hasSpokenRef = useRef(false);

  // Reset spoken flag when word changes
  useEffect(() => {
    hasSpokenRef.current = false;
  }, [word.word.id]);

  // Auto-speak the word when front side is shown, only once
  // Use silent mode to avoid error toasts on auto-play (browsers block auto-play audio)
  useEffect(() => {
    if (!isFlipped && !hasSpokenRef.current && isSupported) {
      speak(word.word.word_text, { silent: true });
      hasSpokenRef.current = true;
    }
  }, [isFlipped, word.word.word_text, speak, isSupported]);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);

    // Speak the word every time we flip to the front
    if (!newFlipped && isSupported) {
      speak(word.word.word_text, { silent: true });
    }
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

  const handleMemoryRangeClick = async (min: number, max: number) => {
    if (!word.userWord?.id) {
      toast.error("Cannot update memory level");
      return;
    }

    // Generate random value in range, or use exact value for 101
    const memoryLevel =
      min === max ? min : Math.floor(Math.random() * (max - min + 1)) + min;

    try {
      await updateMemoryLevelMutation.mutateAsync({
        userWordId: word.userWord.id,
        memoryLevel,
      });
      toast.success(`Memory level updated to ${memoryLevel}`);
    } catch (error) {
      console.error("Update memory level error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update memory level"
      );
    }
  };

  // Helper to determine if current memory level is in range
  const isInRange = (min: number, max: number) => {
    const currentLevel = word.userWord.memory_level;
    return currentLevel >= min && currentLevel <= max;
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
        example_sentence: enrichedData.example_sentence,
        part_of_speech: enrichedData.part_of_speech,
        topic: enrichedData.topic,
        meaning_vi: enrichedData.meaning_vi,
      };
      console.log("Sending update payload:", updatePayload);

      const updateResponse = await fetch(
        "/api/supabase/update-word-enrichment",
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
          example_sentence: enrichedData.example_sentence,
          part_of_speech: enrichedData.part_of_speech,
          topic: enrichedData.topic,
          meaning_vi: enrichedData.meaning_vi,
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

  // Variant-based sizing
  const isCompact = variant === "compact";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Priority and Memory Level Badges - moved outside */}
      {(word.priorityScore !== undefined || showStats) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {word.priorityScore !== undefined && (
            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                padding: "6px 14px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "12px",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                Priority: {Math.round(word.priorityScore)}
              </Typography>
            </Box>
          )}
          {showStats && (
            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                borderRadius: "12px",
                padding: "6px 14px",
                border: "1px solid rgba(255, 255, 255, 0.15)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "12px",
                  color: "#FFFFFF",
                  fontWeight: 700,
                }}
              >
                {Math.round(memoryLevel)}%
              </Typography>
            </Box>
          )}
        </Box>
      )}

      <Card
        onClick={handleFlip}
        sx={{
          cursor: "pointer",
          perspective: "1000px",
          height: isCompact ? "auto" : "100%",
          minHeight: isCompact ? "180px" : "400px",
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: "24px",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
          padding: isCompact ? "16px" : "32px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          transition: "all 0.3s ease-out",
          overflow: "hidden",
          "&:hover": {
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 100%)`,
            backdropFilter: "blur(32px)",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
            "& .glass-gradient-overlay": {
              opacity: 1,
            },
          },
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(to bottom right, rgba(255, 255, 255, 0.05) 0%, transparent 100%)`,
            pointerEvents: "none",
            borderRadius: "24px",
            opacity: 0,
            transition: "opacity 0.3s ease-out",
            className: "glass-gradient-overlay",
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
              gap: "24px",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
              animation: "fadeIn 0.3s ease-out",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "scale(0.95)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
            }}
          >
            {/* Word and Phonetic Section */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              {/* Word Title - Large and Bold */}
              <Typography
                variant="h1"
                sx={{
                  fontSize: isCompact ? "32px" : "60px",
                  fontWeight: 700,
                  color: "#FFFFFF",
                  lineHeight: 1.1,
                  letterSpacing: "-0.5px",
                  textShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                  wordBreak: "break-word",
                }}
              >
                {word.word.word_text}
              </Typography>

              {/* Phonetic Badge - Styled with border */}
              {word.word.phonetic && (
                <Box
                  sx={{
                    padding: "8px 16px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "16px",
                      color: "#a09abc",
                      fontStyle: "italic",
                      fontFamily: "serif",
                      fontWeight: 400,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {word.word.phonetic}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Definition on Front */}
            {word.word.definition && (
              <Box
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "16px",
                  padding: "16px",
                  maxWidth: "720px",
                  width: "100%",
                  textAlign: "center",
                  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.18)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="overline"
                    sx={{
                      letterSpacing: "0.08em",
                      color: "rgba(255, 255, 255, 0.6)",
                      fontWeight: 700,
                    }}
                  >
                    Definition
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigator.clipboard.writeText(word.word.definition);
                      toast.success("Definition copied!");
                    }}
                    sx={{
                      padding: "4px",
                      backgroundColor: "rgba(67, 24, 255, 0.08)",
                      color: "#4318FF",
                      border: "1px solid rgba(67, 24, 255, 0.15)",
                      "&:hover": {
                        backgroundColor: "rgba(67, 24, 255, 0.18)",
                        color: "#4318FF",
                        borderColor: "#4318FF",
                      },
                    }}
                  >
                    <ContentCopyIcon sx={{ fontSize: "14px" }} />
                  </IconButton>
                </Box>
                <Typography
                  variant="body1"
                  sx={{
                    marginTop: "4px",
                    color: "rgba(255, 255, 255, 0.85)",
                    lineHeight: 1.6,
                    fontWeight: 500,
                  }}
                >
                  {word.word.definition}
                </Typography>
              </Box>
            )}

            {/* Sound Button - Large and prominent */}
            {isSupported && (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.word.word_text);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #4318FF 0%, #5e3aff 100%)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 0 25px rgba(67, 24, 255, 0.4)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: "0 0 40px rgba(67, 24, 255, 0.6)",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <VolumeUpIcon
                  sx={{
                    fontSize: "40px",
                    color: "#FFFFFF",
                    animation: isPlaying ? "pulse 1s infinite" : "none",
                    "@keyframes pulse": {
                      "0%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
              </Box>
            )}

            {/* Tap to Flip Hint */}
            <Typography
              variant="caption"
              sx={{
                fontSize: "10px",
                color: "rgba(255, 255, 255, 0.3)",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontWeight: 600,
                animation: "pulse 2s ease-in-out infinite",
                "@keyframes pulse": {
                  "0%, 100%": { opacity: 0.3 },
                  "50%": { opacity: 0.6 },
                },
              }}
            >
              Tap to flip
            </Typography>
          </Box>
        )}

        {/* Back Side (Definition & Example) */}
        {isFlipped && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              width: "100%",
              animation: "fadeIn 0.3s ease-out",
              "@keyframes fadeIn": {
                from: { opacity: 0, transform: "scale(0.95)" },
                to: { opacity: 1, transform: "scale(1)" },
              },
            }}
          >
            {/* Word Title */}
            <Typography
              variant="h2"
              sx={{
                fontSize: isCompact ? "28px" : "48px",
                fontWeight: 700,
                color: "#FFFFFF",
                textAlign: "center",
                lineHeight: 1.2,
              }}
            >
              {word.word.word_text}
            </Typography>

            {/* Tags Row - Part of Speech and Topic */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {/* Part of Speech Badge */}
              {word.word.part_of_speech && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingX: "12px",
                    paddingY: "6px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#a09abc",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {word.word.part_of_speech}
                  </Typography>
                </Box>
              )}

              {/* Topic Badge with accent */}
              {word.word.topic && (
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    paddingX: "12px",
                    paddingY: "6px",
                    borderRadius: "999px",
                    backgroundColor: "rgba(67, 24, 255, 0.2)",
                    border: "1px solid rgba(67, 24, 255, 0.4)",
                    backdropFilter: "blur(8px)",
                    boxShadow: "0 0 10px rgba(67, 24, 255, 0.2)",
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "11px",
                      fontWeight: 600,
                      color: "#FFFFFF",
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                    }}
                  >
                    {word.word.topic}
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Divider */}
            <Box
              sx={{
                width: "48px",
                height: "2px",
                background: "#4318FF",
                margin: "4px auto",
                borderRadius: "1px",
                opacity: 0.6,
              }}
            />

            {/* Vietnamese Meaning */}
            <Box
              sx={{
                backgroundColor: "rgba(67, 24, 255, 0.1)",
                border: "1px solid rgba(67, 24, 255, 0.25)",
                borderRadius: "16px",
                padding: "14px 16px",
                textAlign: "center",
                boxShadow: "0 12px 28px rgba(67, 24, 255, 0.18)",
              }}
            >
              <Typography
                variant="overline"
                sx={{
                  letterSpacing: "0.1em",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontWeight: 700,
                }}
              >
                Vietnamese meaning
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontSize: "16px",
                  color: "rgba(255, 255, 255, 0.9)",
                  lineHeight: 1.6,
                  fontWeight: 600,
                  marginTop: "4px",
                }}
              >
                {word.word.meaning_vi || "No Vietnamese meaning yet."}
              </Typography>
            </Box>

            {/* Example Sentence */}
            {word.word.example_sentence && (
              <Box
                sx={{
                  paddingX: "12px",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "14px",
                    color: "rgba(255, 255, 255, 0.95)",
                    fontStyle: "italic",
                    lineHeight: 1.6,
                    textAlign: "center",
                  }}
                >
                  &quot;
                  {word.word.example_sentence
                    .split(word.word.word_text)
                    .map((part, index, array) => (
                      <span key={index}>
                        {part}
                        {index < array.length - 1 && (
                          <Box
                            component="span"
                            sx={{
                              backgroundColor: "#4318FF",
                              color: "#FFFFFF",
                              fontWeight: 700,
                              padding: "3px 8px",
                              borderRadius: "6px",
                              border: "1px solid rgba(67, 24, 255, 0.8)",
                              boxShadow: "0 2px 12px rgba(67, 24, 255, 0.5)",
                              display: "inline-block",
                              margin: "0 2px",
                              fontStyle: "normal",
                            }}
                          >
                            {word.word.word_text}
                          </Box>
                        )}
                      </span>
                    ))}
                  &quot;
                </Typography>
              </Box>
            )}

            {/* Action Buttons */}
            <Box
              sx={{
                display: "flex",
                gap: "8px",
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteWord();
                }}
                disabled={isDeleting}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderColor: "rgba(239, 68, 68, 0.3)",
                    color: "#EF4444",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                <DeleteIcon sx={{ fontSize: "16px" }} />
                Delete
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReEnrichWord();
                }}
                disabled={isEnriching}
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px",
                  height: "36px",
                  borderRadius: "10px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(67, 24, 255, 0.2)",
                    borderColor: "rgba(67, 24, 255, 0.4)",
                    color: "#FFFFFF",
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    color: "rgba(255, 255, 255, 0.3)",
                  },
                  textTransform: "none",
                  fontWeight: 500,
                  fontSize: "12px",
                }}
              >
                {isEnriching ? (
                  <CircularProgress size={16} sx={{ color: "inherit" }} />
                ) : (
                  <RefreshIcon sx={{ fontSize: "16px" }} />
                )}
                {isEnriching ? "Re-enriching..." : "Re-enrich"}
              </Button>
            </Box>

            {/* Error message */}
            {enrichError && (
              <Alert
                severity="error"
                sx={{
                  backgroundColor: "rgba(239, 68, 68, 0.15)",
                  color: "#EF4444",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  fontSize: "12px",
                  borderRadius: "10px",
                  "& .MuiAlert-icon": {
                    color: "#EF4444",
                  },
                }}
              >
                {enrichError}
              </Alert>
            )}
          </Box>
        )}
      </Card>

      {/* Memory Range Controls - Fixed at bottom of screen */}
      {showStats && userId && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            gap: "4px",
            padding: "12px",
            justifyContent: "center",
            flexWrap: "wrap",
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            backdropFilter: "blur(24px) saturate(180%)",
            borderTop: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
            overflowX: "auto",
            overflowY: "hidden",
            WebkitOverflowScrolling: "touch",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {memoryRanges.map((range, idx) => {
            const isActive = isInRange(range.min, range.max);
            // Assign colors based on memory range
            const getRangeColor = () => {
              switch (idx) {
                case 0:
                  return {
                    bg: "rgba(239, 68, 68, 0.1)",
                    accent: "#EF4444",
                    bar: "#EF4444",
                  }; // 0-20 - red
                case 1:
                  return {
                    bg: "rgba(245, 158, 11, 0.1)",
                    accent: "#F59E0B",
                    bar: "#F59E0B",
                  }; // 20-40 - amber
                case 2:
                  return {
                    bg: "rgba(251, 191, 36, 0.1)",
                    accent: "#FBBF24",
                    bar: "#FBBF24",
                  }; // 40-60 - yellow
                case 3:
                  return {
                    bg: "rgba(163, 230, 53, 0.1)",
                    accent: "#A3E635",
                    bar: "#A3E635",
                  }; // 60-80 - lime
                case 4:
                  return {
                    bg: "rgba(34, 197, 94, 0.1)",
                    accent: "#22C55E",
                    bar: "#22C55E",
                  }; // 80-100 - green
                case 5:
                  return {
                    bg: "rgba(255, 255, 255, 0.1)",
                    accent: "#FFFFFF",
                    bar: "#FFFFFF",
                  }; // 101 - white
                default:
                  return {
                    bg: "rgba(255, 255, 255, 0.05)",
                    accent: "#FFFFFF",
                    bar: "#FFFFFF",
                  };
              }
            };
            const colors = getRangeColor();
            const percentage =
              idx < 5 ? ((range.max - range.min) / 100) * 100 : 0;

            return (
              <Button
                key={range.label}
                size="small"
                onClick={() => handleMemoryRangeClick(range.min, range.max)}
                disabled={updateMemoryLevelMutation.isPending}
                sx={{
                  flexShrink: 0,
                  minWidth: "48px",
                  padding: "0",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "48px",
                  borderRadius: "12px",
                  backgroundColor: colors.bg,
                  border: isActive
                    ? `1px solid ${colors.accent}`
                    : "1px solid rgba(255, 255, 255, 0.05)",
                  backdropFilter: "blur(12px)",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: isActive
                      ? colors.bg
                      : "rgba(255, 255, 255, 0.1)",
                    borderColor: colors.accent,
                  },
                  "&:disabled": {
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.05)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "10px",
                    fontWeight: 700,
                    color: colors.accent,
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {idx === 5 ? (
                    <StarIcon sx={{ fontSize: "14px" }} />
                  ) : (
                    range.label
                  )}
                </Typography>
                <Box
                  sx={{
                    width: "24px",
                    height: "3px",
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${percentage}%`,
                      backgroundColor: colors.bar,
                      borderRadius: "2px",
                      boxShadow: `0 0 8px ${colors.bar}99`,
                      transition: "all 0.2s ease",
                    }}
                  />
                </Box>
              </Button>
            );
          })}
        </Box>
      )}

      {/* Memory Bar - Gradient indicator */}
      {showStats && (
        <Box
          sx={{
            height: "6px",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "3px",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              width: `${memoryLevel}%`,
              background: `linear-gradient(90deg, #EF4444 0%, #F59E0B 20%, #FBBF24 40%, #A3E635 60%, #22C55E 80%, #4318FF 100%)`,
              borderRadius: "0 0 24px 0",
              transition: "width 0.3s ease-out",
              boxShadow: "0 0 12px rgba(67, 24, 255, 0.3)",
            }}
          />
        </Box>
      )}
    </Box>
  );
}
