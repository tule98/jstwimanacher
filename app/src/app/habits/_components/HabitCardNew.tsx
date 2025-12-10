import React, { useState } from "react";
import { Box, useTheme } from "@mui/material";
import HabitCardFront from "./HabitCardFront";
import HabitCardBack from "./HabitCardBack";
import { HabitCompletion } from "@/services/api/habits";

export interface HabitCardProps {
  id: string;
  name: string;
  currentStreak: number;
  isCompleted: boolean;
  moodEmoji?: string;
  frequencyType: "daily" | "custom";
  frequencyDays?: number[];
  completions?: HabitCompletion[];
  onEdit?: () => void;
  onDelete?: () => void;
  onComplete: () => void;
  onUncomplete?: () => void;
  onMenu?: () => void;
  isDragging?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export default function HabitCardNew({
  id,
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
  isDragging = false,
  dragHandleProps,
}: HabitCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(true);
  };

  const handleFlipBack = () => {
    setIsFlipped(false);
  };

  return (
    <Box
      sx={{
        position: "relative",
        perspective: "1000px",
        height: "92px", // Fixed height to prevent layout shift
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.6s ease-out",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front Side */}
        <Box
          onClick={handleFlip}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
            opacity: isDragging ? 0.5 : isCompleted ? 0.7 : 1,
            transition: "all 0.2s ease-out",
            backfaceVisibility: "hidden",
            pointerEvents: isFlipped ? "none" : "auto",
            cursor: "pointer",
            "&:hover": {
              boxShadow: isDark ? "none" : "0px 4px 12px rgba(0, 0, 0, 0.15)",
              transform: isFlipped ? "none" : "translateY(-2px)",
              backgroundColor: isDark ? "#334155" : "#FFFFFF",
            },
          }}
        >
          <HabitCardFront
            name={name}
            currentStreak={currentStreak}
            isCompleted={isCompleted}
            moodEmoji={moodEmoji}
            frequencyType={frequencyType}
            frequencyDays={frequencyDays}
            onEdit={onEdit}
            onDelete={onDelete}
            onComplete={onComplete}
            onUncomplete={onUncomplete}
            onFlip={handleFlip}
            dragHandleProps={dragHandleProps}
          />
        </Box>

        {/* Back Side */}
        <Box
          onClick={handleFlipBack}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
            borderRadius: "12px",
            padding: "12px",
            boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            cursor: "pointer",
            pointerEvents: isFlipped ? "auto" : "none",
          }}
        >
          <HabitCardBack habitId={id} habitName={name} />
        </Box>
      </Box>
    </Box>
  );
}
