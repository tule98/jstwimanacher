"use client";
import React, { useMemo, useState } from "react";
import { Box } from "@mui/material";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableHabitCard from "./SortableHabitCard";
import {
  calculateStreak,
  getTodayString,
  isCompletedToday,
  getTodayMood,
} from "@/lib/habit-utils";
import { Habit, HabitCompletion } from "@/services/api/habits";

interface HabitsListProps {
  todayHabits: Habit[];
  completions: HabitCompletion[];
  onReorder: (habitIds: string[]) => Promise<void>;
  onComplete: (habitId: string) => void;
  onUncomplete: (habitId: string) => void;
  onEdit?: (habit: Habit) => void;
  onDelete?: (habitId: string, name: string) => void;
}

export default function HabitsList({
  todayHabits,
  completions,
  onReorder,
  onComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: HabitsListProps) {
  const today = getTodayString();

  // State for optimistic updates
  const [optimisticHabits, setOptimisticHabits] = useState<Habit[] | null>(
    null
  );

  // Use optimistic order if available, otherwise use original
  const displayHabits = optimisticHabits || todayHabits;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const habitIds = useMemo(
    () => displayHabits.map((h) => h.id),
    [displayHabits]
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = habitIds.indexOf(active.id as string);
      const newIndex = habitIds.indexOf(over.id as string);

      const newOrder = arrayMove(habitIds, oldIndex, newIndex);
      const reorderedHabits = newOrder
        .map((id) => displayHabits.find((h) => h.id === id))
        .filter((habit): habit is Habit => habit !== undefined);

      // Optimistically update UI
      setOptimisticHabits(reorderedHabits);

      try {
        // Call API with new order
        await onReorder(newOrder);
        // Keep optimistic state since API succeeded
      } catch (error) {
        // Revert to original order on error
        console.error("Failed to reorder, reverting:", error);
        setOptimisticHabits(null);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={habitIds} strategy={verticalListSortingStrategy}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {displayHabits.map((habit) => {
            const habitCompletions = completions.filter(
              (c) => c.habit_id === habit.id
            );
            const streak = calculateStreak(habit, habitCompletions);
            const completed = isCompletedToday(habitCompletions, today);
            const mood = getTodayMood(habitCompletions, today);
            const frequencyDays = habit.frequency_days
              ? JSON.parse(habit.frequency_days)
              : undefined;

            return (
              <SortableHabitCard
                key={habit.id}
                id={habit.id}
                habit={{
                  ...habit,
                  streak,
                  completed,
                  mood,
                  frequencyDays,
                }}
                completions={habitCompletions}
                onComplete={() => onComplete(habit.id)}
                onUncomplete={() => onUncomplete(habit.id)}
                onEdit={onEdit ? () => onEdit(habit) : undefined}
                onDelete={
                  onDelete ? () => onDelete(habit.id, habit.name) : undefined
                }
              />
            );
          })}
        </Box>
      </SortableContext>
    </DndContext>
  );
}
