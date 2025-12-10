"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import HabitCardNew from "./HabitCardNew";

interface SortableHabitCardProps {
  id: string;
  habit: {
    id: string;
    name: string;
    frequency_type: "daily" | "custom";
    frequencyDays?: number[];
    streak: number;
    completed: boolean;
    mood?: string;
  };
  onComplete: () => void;
  onUncomplete: () => void;
}

export default function SortableHabitCard({
  id,
  habit,
  onComplete,
  onUncomplete,
}: SortableHabitCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Box
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <HabitCardNew
        id={habit.id}
        name={habit.name}
        currentStreak={habit.streak}
        isCompleted={habit.completed}
        moodEmoji={habit.mood}
        frequencyType={habit.frequency_type}
        frequencyDays={habit.frequencyDays}
        onComplete={onComplete}
        onUncomplete={onUncomplete}
        isDragging={isDragging}
      />
    </Box>
  );
}
