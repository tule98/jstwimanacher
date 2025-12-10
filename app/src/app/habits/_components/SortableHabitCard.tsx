"use client";
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Box } from "@mui/material";
import HabitCardNew from "./HabitCardNew";
import { HabitCompletion } from "@/services/api/habits";

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
  completions?: HabitCompletion[];
  onComplete: () => void;
  onUncomplete: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function SortableHabitCard({
  id,
  habit,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
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
  };

  return (
    <Box ref={setNodeRef} style={style} {...attributes}>
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
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </Box>
  );
}
