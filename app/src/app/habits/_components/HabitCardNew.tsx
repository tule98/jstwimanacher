import React from "react";
import { Box, useTheme } from "@mui/material";
import HabitCardFront from "./HabitCardFront";
import { HabitCompletion } from "@/services/api/habits";

export interface HabitCardProps {
  id: string;
  name: string;
  description?: string;
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
  description,
  currentStreak,
  isCompleted,
  moodEmoji,
  frequencyType,
  frequencyDays,
  completions,
  onEdit,
  onDelete,
  onComplete,
  onUncomplete,
  isDragging = false,
  dragHandleProps,
}: HabitCardProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
        borderRadius: "12px",
        padding: "12px",
        boxShadow: isDark ? "none" : "0px 1px 2px rgba(0, 0, 0, 0.08)",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
        opacity: isDragging ? 0.5 : 1,
        transition: "all 0.2s ease-out",
      }}
    >
      <HabitCardFront
        habitId={id}
        name={name}
        description={description}
        currentStreak={currentStreak}
        isCompleted={isCompleted}
        moodEmoji={moodEmoji}
        frequencyType={frequencyType}
        frequencyDays={frequencyDays}
        completions={completions}
        onEdit={onEdit}
        onDelete={onDelete}
        onComplete={onComplete}
        onUncomplete={onUncomplete}
        dragHandleProps={dragHandleProps}
      />
    </Box>
  );
}
