import React from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { Check, Flame, GripVertical, Pencil, Trash } from "lucide-react";

export interface HabitCardFrontProps {
  name: string;
  currentStreak: number;
  isCompleted: boolean;
  moodEmoji?: string;
  frequencyType: "daily" | "custom";
  frequencyDays?: number[];
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete: () => void;
  onUncomplete?: () => void;
  onFlip: () => void;
  dragHandleProps?: Record<string, unknown>;
}

export default function HabitCardFront({
  name,
  currentStreak,
  isCompleted,
  moodEmoji,
  frequencyType,
  frequencyDays,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  onFlip,
  dragHandleProps,
}: HabitCardFrontProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleTap = () => {
    onFlip();
  };

  const getFrequencyLabel = () => {
    if (frequencyType === "daily") return "Daily";
    if (frequencyDays && frequencyDays.length > 0) {
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      return frequencyDays.map((d) => dayNames[d]).join(", ");
    }
    return "Custom";
  };

  return (
    <Box
      onClick={handleTap}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        cursor: "pointer",
      }}
    >
      {/* Drag Handle */}
      {dragHandleProps && (
        <Box
          {...dragHandleProps}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            padding: "2px 6px",
            marginLeft: "-4px",
            borderRadius: "8px",
            transition: "all 0.2s ease-out",
            "&:hover": {
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.05)",
            },
            "&:active": {
              cursor: "grabbing",
              backgroundColor: isDark
                ? "rgba(255, 255, 255, 0.15)"
                : "rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          <GripVertical
            size={18}
            color={theme.palette.text.secondary}
            opacity={0.6}
          />
        </Box>
      )}

      {/* Check Circle */}
      <Box
        onClick={(e) => {
          e.stopPropagation();
          if (isCompleted) {
            onUncomplete?.();
          } else {
            onComplete();
          }
        }}
        sx={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          border: isCompleted
            ? "none"
            : isDark
            ? "2px solid #334155"
            : "2px solid #E5E7EB",
          backgroundColor: isCompleted
            ? isDark
              ? "#5B7AFF"
              : "#4158D0"
            : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.3s ease-out",
          color: "white",
          fontSize: "18px",
        }}
      >
        {isCompleted ? (
          moodEmoji ? (
            <Typography sx={{ fontSize: "18px", lineHeight: 1 }}>
              {moodEmoji}
            </Typography>
          ) : (
            <Check size={20} color="white" strokeWidth={2.3} />
          )
        ) : null}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "18px",
            fontWeight: 600,
            lineHeight: "24px",
            color: theme.palette.text.primary,
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Streak */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Flame
              size={16}
              color={isDark ? "#FFC247" : "#FFB01D"}
              fill={isDark ? "#FFC247" : "#FFB01D"}
            />
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                color:
                  currentStreak > 0
                    ? isDark
                      ? "#FFC247"
                      : "#FFB01D"
                    : theme.palette.text.secondary,
              }}
            >
              {currentStreak}
            </Typography>
          </Box>

          {/* Frequency */}
          <Typography
            sx={{
              flex: 1,
              fontSize: "11px",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              lineHeight: "16px",
            }}
          >
            {getFrequencyLabel()}
          </Typography>

          {/* Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {onEdit && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#F9FAFB",
                  },
                }}
              >
                <Pencil size={17} color={theme.palette.text.secondary} />
              </IconButton>
            )}

            {onDelete && (
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                sx={{
                  width: 36,
                  height: 36,
                  flexShrink: 0,
                  "&:hover": {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "#F9FAFB",
                  },
                }}
              >
                <Trash size={17} color={theme.palette.text.secondary} />
              </IconButton>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
