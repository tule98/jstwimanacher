import React from "react";
import { Box, Typography, IconButton, useTheme } from "@mui/material";
import { Check, Flame, MoreVertical, GripVertical } from "lucide-react";

export interface HabitCardProps {
  id: string;
  name: string;
  currentStreak: number;
  isCompleted: boolean;
  moodEmoji?: string;
  frequencyType: "daily" | "custom";
  frequencyDays?: number[];
  onComplete: () => void;
  onUncomplete?: () => void;
  onMenu?: () => void;
  isDragging?: boolean;
  dragHandleProps?: { onMouseDown: () => void };
}

export default function HabitCardNew({
  name,
  currentStreak,
  isCompleted,
  moodEmoji,
  frequencyType,
  frequencyDays,
  onComplete,
  onUncomplete,
  onMenu,
  isDragging = false,
  dragHandleProps,
}: HabitCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const handleTap = () => {
    if (isCompleted && onUncomplete) {
      onUncomplete();
    } else if (!isCompleted) {
      onComplete();
    }
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
        position: "relative",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderRadius: "16px",
        padding: "16px",
        minHeight: "80px",
        display: "flex",
        alignItems: "center",
        gap: 2,
        cursor: "pointer",
        transition: "all 0.2s ease-out",
        boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        opacity: isDragging ? 0.5 : isCompleted ? 0.7 : 1,
        "&:hover": {
          boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.15)",
          transform: "translateY(-2px)",
          backgroundColor: isDark ? "#334155" : "#FFFFFF",
        },
        "&:active": {
          transform: "scale(0.98)",
        },
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
            padding: "4px 8px",
            marginLeft: "-8px",
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
        sx={{
          width: 44,
          height: 44,
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
        }}
      >
        {isCompleted && <Check size={24} color="white" strokeWidth={2.5} />}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: "20px",
            fontWeight: 500,
            lineHeight: "28px",
            color: theme.palette.text.primary,
            marginBottom: "4px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Streak */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Flame
              size={16}
              color={isDark ? "#FFC247" : "#FFB01D"}
              fill={isDark ? "#FFC247" : "#FFB01D"}
            />
            <Typography
              sx={{
                fontSize: "14px",
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
              fontSize: "12px",
              fontWeight: 500,
              color: theme.palette.text.secondary,
              lineHeight: "16px",
            }}
          >
            {getFrequencyLabel()}
          </Typography>

          {/* Mood Emoji if completed */}
          {isCompleted && moodEmoji && (
            <Typography sx={{ fontSize: "20px", lineHeight: 1 }}>
              {moodEmoji}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Menu Button */}
      {onMenu && (
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onMenu();
          }}
          sx={{
            width: 44,
            height: 44,
            flexShrink: 0,
            "&:hover": {
              backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "#F9FAFB",
            },
          }}
        >
          <MoreVertical size={20} color={theme.palette.text.secondary} />
        </IconButton>
      )}
    </Box>
  );
}
