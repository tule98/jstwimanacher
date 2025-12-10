import React from "react";
import { Box, Typography, Button, Modal, Backdrop, Fade } from "@mui/material";

export interface MoodSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelectMood: (emoji: string) => void;
  onSkip: () => void;
}

const MOOD_EMOJIS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😴", label: "Tired" },
  { emoji: "⚡", label: "Energized" },
  { emoji: "😰", label: "Stressed" },
  { emoji: "😤", label: "Frustrated" },
  { emoji: "🎯", label: "Focused" },
  { emoji: "😌", label: "Calm" },
];

export default function MoodSelector({
  open,
  onClose,
  onSelectMood,
  onSkip,
}: MoodSelectorProps) {
  const handleSelect = (emoji: string) => {
    onSelectMood(emoji);
    onClose();
  };

  const handleSkip = () => {
    onSkip();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 200,
          sx: {
            backgroundColor: "rgba(0, 0, 0, 0.4)",
          },
        },
      }}
    >
      <Fade in={open}>
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: (theme) =>
              theme.palette.mode === "dark" ? "#1E293B" : "#FFFFFF",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            padding: "32px 24px 40px",
            boxShadow: "0px 12px 24px rgba(0, 0, 0, 0.2)",
            border: (theme) =>
              theme.palette.mode === "dark"
                ? "1px solid rgba(255, 255, 255, 0.08)"
                : "none",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <Typography
            sx={{
              fontSize: "24px",
              fontWeight: 600,
              color: (theme) => theme.palette.text.primary,
              textAlign: "center",
              marginBottom: "24px",
              lineHeight: "32px",
            }}
          >
            How did you feel?
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "12px",
              marginBottom: "24px",
              justifyContent: "center",
            }}
          >
            {MOOD_EMOJIS.map(({ emoji, label }) => (
              <Box
                key={emoji}
                onClick={() => handleSelect(emoji)}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "8px",
                  flex: "0 1 calc(25% - 12px)",
                  maxWidth: "calc(25% - 12px)",
                  cursor: "pointer",
                  padding: "12px",
                  borderRadius: "12px",
                  transition: "all 0.2s ease-out",
                  "&:hover": {
                    backgroundColor: (theme) =>
                      theme.palette.mode === "dark"
                        ? "rgba(255, 255, 255, 0.05)"
                        : "#F9FAFB",
                  },
                  "&:active": {
                    transform: "scale(0.95)",
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: "32px",
                    lineHeight: 1,
                  }}
                >
                  {emoji}
                </Typography>
                <Typography
                  sx={{
                    fontSize: "12px",
                    fontWeight: 500,
                    color: (theme) => theme.palette.text.secondary,
                    textAlign: "center",
                  }}
                >
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>

          <Button
            onClick={handleSkip}
            fullWidth
            sx={{
              height: "48px",
              borderRadius: "12px",
              fontSize: "16px",
              fontWeight: 600,
              color: (theme) => theme.palette.text.secondary,
              textTransform: "none",
              backgroundColor: "transparent",
              "&:hover": {
                backgroundColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#F9FAFB",
              },
            }}
          >
            Skip
          </Button>
        </Box>
      </Fade>
    </Modal>
  );
}
