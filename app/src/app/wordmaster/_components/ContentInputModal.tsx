"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Box,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  Checkbox,
} from "@mui/material";
import { toast } from "sonner";
import {
  useExtractWords,
  useEnrichWords,
  useAddExtractedWords,
} from "@/hooks/wordmaster";
import type { ExtractedWord } from "@/services/wordmaster";

interface ContentInputModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  onSuccess?: () => void;
}

type Step = "input" | "preview" | "enriching" | "adding" | "success";

/**
 * Modal for extracting words from content (lyrics, paragraphs, topics)
 * Provides preview and difficulty breakdown before adding to vocabulary
 */
export function ContentInputModal({
  open,
  onClose,
  userId,
  onSuccess,
}: ContentInputModalProps) {
  const [step, setStep] = useState<Step>("input");
  const [content, setContent] = useState("");
  const [previewData, setPreviewData] = useState<{
    words: ExtractedWord[];
    totalCount: number;
    duplicates: number;
    difficultyBreakdown: Record<string, number>;
  } | null>(null);
  const [selectedWordIndices, setSelectedWordIndices] = useState<Set<number>>(
    new Set()
  );
  const [error, setError] = useState<string | null>(null);

  const extractMutation = useExtractWords();
  const enrichMutation = useEnrichWords();
  const addMutation = useAddExtractedWords(userId);

  const maxCharacters = 5000;
  const characterCount = content.length;
  const isValidInput = characterCount >= 10 && characterCount <= maxCharacters;

  // Handle content extraction
  const handleExtract = useCallback(async () => {
    if (!isValidInput) return;

    setError(null);
    setStep("preview");

    try {
      const result = await extractMutation.mutateAsync({
        content,
        minWordLength: 3,
        maxWordLength: 15,
        includePhrases: true,
      });

      setPreviewData(result.preview);
      // Select all words by default
      setSelectedWordIndices(
        new Set(result.preview.words.map((_, idx) => idx))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extract words");
      setStep("input");
    }
  }, [content, isValidInput, extractMutation]);

  // Handle reset - define this before handleEnrich so it can be used in dependency array
  const handleReset = useCallback(() => {
    setStep("input");
    setContent("");
    setPreviewData(null);
    setSelectedWordIndices(new Set());
    setError(null);
    onClose();
  }, [onClose]);

  // Handle enrichment and adding
  const handleEnrich = useCallback(async () => {
    if (!previewData?.words) return;

    // Filter to only selected words
    const selectedWords = previewData.words.filter((_, idx) =>
      selectedWordIndices.has(idx)
    );

    if (selectedWords.length === 0) {
      toast.error("Please select at least one word");
      return;
    }

    setStep("enriching");
    setError(null);

    try {
      const enriched = await enrichMutation.mutateAsync(
        selectedWords.map((w) => ({ word_text: w.word_text }))
      );

      // Automatically add the enriched words
      setStep("adding");
      await addMutation.mutateAsync(enriched);
      setStep("success");

      // Reset and close after success
      setTimeout(() => {
        handleReset();
        onSuccess?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to enrich words");
      setStep("preview");
    }
  }, [
    previewData,
    selectedWordIndices,
    enrichMutation,
    addMutation,
    onSuccess,
    handleReset,
  ]);

  return (
    <Dialog
      open={open}
      onClose={handleReset}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.05) 100%)`,
          backdropFilter: "blur(30px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "24px",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontSize: "20px",
          fontWeight: 600,
          color: "#FFFFFF",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        {step === "input" && "Add Words from Content"}
        {step === "preview" && "Review Extracted Words"}
        {step === "enriching" && "Enriching Words..."}
        {step === "adding" && "Adding to Vocabulary..."}
        {step === "success" && "✅ Success!"}
      </DialogTitle>

      <DialogContent
        sx={{
          paddingTop: "24px !important",
          color: "#FFFFFF",
        }}
      >
        {/* Input Step */}
        {step === "input" && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Content Input */}
            <TextField
              multiline
              rows={8}
              placeholder="Paste lyrics, text, or topic..."
              value={content}
              onChange={(e) => {
                const newContent = e.target.value.slice(0, maxCharacters);
                setContent(newContent);
              }}
              fullWidth
              inputProps={{
                maxLength: maxCharacters,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  color: "#FFFFFF",
                  "& fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255, 255, 255, 0.3)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "rgba(107, 138, 255, 0.5)",
                  },
                },
                "& .MuiOutlinedInput-input::placeholder": {
                  color: "rgba(255, 255, 255, 0.5)",
                  opacity: 1,
                },
              }}
            />

            {/* Character Counter */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "12px",
                color: "rgba(255, 255, 255, 0.6)",
              }}
            >
              <span>
                {characterCount} / {maxCharacters} characters
              </span>
              {characterCount < 10 && characterCount > 0 && (
                <span style={{ color: "#FFB627" }}>Minimum 10 characters</span>
              )}
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ marginTop: "16px" }}>
              <Button
                variant="outlined"
                onClick={handleReset}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "#FFFFFF",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                  flex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleExtract}
                disabled={!isValidInput || extractMutation.isPending}
                sx={{
                  background:
                    "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
                  color: "#FFFFFF",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #5629FF 0%, #7B9AFF 100%)",
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  flex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {extractMutation.isPending ? "Extracting..." : "Extract Words"}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Preview Step */}
        {step === "preview" && previewData && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Statistics */}
            <Box
              sx={{
                backgroundColor: "rgba(107, 138, 255, 0.1)",
                backdropFilter: "blur(10px)",
                borderRadius: "12px",
                padding: "16px",
                border: "1px solid rgba(107, 138, 255, 0.2)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.6)",
                  letterSpacing: "1px",
                  marginBottom: "12px",
                }}
              >
                Statistics
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>New Words</span>
                  <strong>{previewData.totalCount}</strong>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Duplicates</span>
                  <strong>{previewData.duplicates}</strong>
                </Box>
              </Stack>
            </Box>

            {/* Difficulty Breakdown */}
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  fontSize: "12px",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.6)",
                  letterSpacing: "1px",
                  marginBottom: "12px",
                }}
              >
                Difficulty Breakdown
              </Typography>
              <Stack spacing={1}>
                {(["easy", "medium", "hard", "very_hard"] as const).map(
                  (level) => (
                    <Box key={level}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: "12px",
                        }}
                      >
                        <span>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </span>
                        <strong>
                          {previewData.difficultyBreakdown[level] || 0}
                        </strong>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={
                          previewData.totalCount > 0
                            ? ((previewData.difficultyBreakdown[level] || 0) /
                                previewData.totalCount) *
                              100
                            : 0
                        }
                        sx={{
                          height: "6px",
                          borderRadius: "3px",
                          backgroundColor: "rgba(255, 255, 255, 0.1)",
                          "& .MuiLinearProgress-bar": {
                            background: {
                              easy: "#6BB25E",
                              medium: "#FFB627",
                              hard: "#FF6B35",
                              very_hard: "#4318FF",
                            }[level],
                          },
                        }}
                      />
                    </Box>
                  )
                )}
              </Stack>
            </Box>

            {/* Word Preview */}
            <Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "12px",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "12px",
                    textTransform: "uppercase",
                    color: "rgba(255, 255, 255, 0.6)",
                    letterSpacing: "1px",
                  }}
                >
                  Word Preview (First 10)
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "11px",
                    color: "rgba(255, 255, 255, 0.5)",
                  }}
                >
                  {selectedWordIndices.size} selected
                </Typography>
              </Box>
              <Stack spacing={1}>
                {previewData.words.slice(0, 10).map((word, idx) => (
                  <Box
                    key={idx}
                    onClick={() => {
                      const newSelected = new Set(selectedWordIndices);
                      if (newSelected.has(idx)) {
                        newSelected.delete(idx);
                      } else {
                        newSelected.add(idx);
                      }
                      setSelectedWordIndices(newSelected);
                    }}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px",
                      backgroundColor: selectedWordIndices.has(idx)
                        ? "rgba(67, 24, 255, 0.15)"
                        : "rgba(255, 255, 255, 0.05)",
                      borderRadius: "8px",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "background-color 0.2s ease",
                      border: selectedWordIndices.has(idx)
                        ? "1px solid rgba(107, 138, 255, 0.3)"
                        : "1px solid transparent",
                      "&:hover": {
                        backgroundColor: selectedWordIndices.has(idx)
                          ? "rgba(67, 24, 255, 0.25)"
                          : "rgba(255, 255, 255, 0.1)",
                      },
                    }}
                  >
                    <Checkbox
                      checked={selectedWordIndices.has(idx)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSelected = new Set(selectedWordIndices);
                        if (newSelected.has(idx)) {
                          newSelected.delete(idx);
                        } else {
                          newSelected.add(idx);
                        }
                        setSelectedWordIndices(newSelected);
                      }}
                      size="small"
                      sx={{
                        color: "rgba(107, 138, 255, 0.7)",
                        "&.Mui-checked": {
                          color: "rgba(107, 138, 255, 1)",
                        },
                      }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <span>{word.word_text}</span>
                    </Box>
                    <Chip
                      label={word.difficulty_level}
                      size="small"
                      sx={{
                        height: "20px",
                        fontSize: "11px",
                        backgroundColor: {
                          easy: "rgba(107, 178, 94, 0.2)",
                          medium: "rgba(255, 182, 39, 0.2)",
                          hard: "rgba(255, 107, 53, 0.2)",
                          very_hard: "rgba(67, 24, 255, 0.2)",
                        }[word.difficulty_level],
                        color: {
                          easy: "#6BB25E",
                          medium: "#FFB627",
                          hard: "#FF6B35",
                          very_hard: "#4318FF",
                        }[word.difficulty_level],
                      }}
                    />
                  </Box>
                ))}
              </Stack>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ marginTop: "16px" }}>
              <Button
                variant="outlined"
                onClick={() => setStep("input")}
                sx={{
                  borderColor: "rgba(255, 255, 255, 0.3)",
                  color: "#FFFFFF",
                  "&:hover": {
                    borderColor: "rgba(255, 255, 255, 0.5)",
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                  },
                  flex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleEnrich}
                disabled={enrichMutation.isPending}
                sx={{
                  background:
                    "linear-gradient(90deg, #4318FF 0%, #6B8AFF 100%)",
                  color: "#FFFFFF",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #5629FF 0%, #7B9AFF 100%)",
                  },
                  "&:disabled": {
                    background: "rgba(255, 255, 255, 0.1)",
                    color: "rgba(255, 255, 255, 0.5)",
                  },
                  flex: 1,
                  whiteSpace: "nowrap",
                }}
              >
                {enrichMutation.isPending ? "Enriching..." : "Enrich & Add"}
              </Button>
            </Stack>
          </Box>
        )}

        {/* Loading States */}
        {(step === "enriching" || step === "adding") && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "32px",
            }}
          >
            <CircularProgress
              sx={{
                color: "rgba(67, 24, 255, 0.6)",
              }}
            />
            <Typography sx={{ color: "rgba(255, 255, 255, 0.7)" }}>
              {step === "enriching"
                ? "Enriching words with definitions..."
                : "Adding words to vocabulary..."}
            </Typography>
          </Box>
        )}

        {/* Success State */}
        {step === "success" && (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              padding: "32px",
            }}
          >
            <Typography
              variant="h4"
              sx={{ fontSize: "48px", marginBottom: "8px" }}
            >
              ✅
            </Typography>
            <Typography
              sx={{
                fontSize: "16px",
                color: "#FFFFFF",
                textAlign: "center",
              }}
            >
              {previewData?.totalCount || 0} words added to your vocabulary!
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255, 255, 255, 0.6)",
                marginTop: "8px",
              }}
            >
              Your learning feed has been updated
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
