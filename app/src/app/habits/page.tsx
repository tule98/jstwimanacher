"use client";
import React, { useState, useMemo, lazy, Suspense } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Typography,
  Fab,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { Plus, Flame, Shield } from "lucide-react";
import AppPageLayout from "@/app/_components/AppPageLayout";
import AppPageNav from "@/app/_components/AppPageNav";

import {
  useHabits,
  useCompleteHabit,
  useUncompleteHabit,
  useCreateHabit,
  useAllCompletions,
  useStreakTokens,
} from "@/services/react-query/hooks/habits";
import {
  getTodayString,
  isCompletedToday,
  isHabitScheduledForDate,
} from "@/lib/habit-utils";
import HabitForm, { HabitFormData } from "./_components/HabitForm";
import MoodSelector from "./_components/MoodSelector";

// Dynamic import for drag and drop list
const HabitsList = lazy(() => import("./_components/HabitsList"));

export default function HabitsTodayPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const queryClient = useQueryClient();

  const [formOpen, setFormOpen] = useState(false);
  const [moodSelectorOpen, setMoodSelectorOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const today = getTodayString();
  const todayDate = useMemo(() => new Date(), []);

  // Fetch data
  const { data: habits = [], isLoading: habitsLoading } = useHabits({
    includeEntries: false,
  });

  const { data: completions = [], isLoading: completionsLoading } =
    useAllCompletions(today, today);

  const { data: tokens } = useStreakTokens();

  // Mutations
  const completeHabit = useCompleteHabit();
  const uncompleteHabit = useUncompleteHabit();
  const createHabit = useCreateHabit();

  // Filter habits scheduled for today
  const todayHabits = useMemo(() => {
    return habits.filter((habit) => {
      const frequencyDays = habit.frequency_days
        ? JSON.parse(habit.frequency_days)
        : null;
      return isHabitScheduledForDate(
        todayDate,
        habit.frequency_type,
        frequencyDays
      );
    });
  }, [habits, todayDate]);

  // Calculate stats
  const completedCount = todayHabits.filter((habit) =>
    isCompletedToday(
      completions.filter((c) => c.habit_id === habit.id),
      today
    )
  ).length;

  const totalCount = todayHabits.length;

  const handleComplete = async (habitId: string) => {
    setSelectedHabitId(habitId);
    setMoodSelectorOpen(true);
  };

  const handleSelectMood = async (emoji: string) => {
    if (!selectedHabitId) return;
    await completeHabit.mutateAsync({
      habitId: selectedHabitId,
      completionDate: today,
      moodEmoji: emoji,
    });
    setSelectedHabitId(null);
  };

  const handleSkipMood = async () => {
    if (!selectedHabitId) return;
    await completeHabit.mutateAsync({
      habitId: selectedHabitId,
      completionDate: today,
    });
    setSelectedHabitId(null);
  };

  const handleUncomplete = async (habitId: string) => {
    await uncompleteHabit.mutateAsync({
      habitId,
      completionDate: today,
    });
  };

  const handleCreateHabit = async (data: HabitFormData) => {
    await createHabit.mutateAsync(data);
  };

  const handleReorderHabits = async (habitIds: string[]) => {
    try {
      await fetch("/api/habits/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ habitIds }),
      });
      await queryClient.invalidateQueries({ queryKey: ["habits"] });
    } catch (error) {
      console.error("Failed to reorder habits:", error);
    }
  };

  const isLoading = habitsLoading || completionsLoading;

  return (
    <AppPageLayout
      header={
        <AppPageNav
          title="Today"
          icon={
            <Box sx={{ position: "relative" }}>
              <Flame size={24} color="#FFB01D" fill="#FFB01D" />
            </Box>
          }
        />
      }
    >
      <Box sx={{ padding: "16px", paddingBottom: "80px" }}>
        {/* Header Stats */}
        <Box
          sx={{
            backgroundColor: isDark ? "#5B7AFF" : "#4158D0",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "24px",
            color: "#FFFFFF",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.1)" : "none",
          }}
        >
          <Typography
            sx={{
              fontSize: "32px",
              fontWeight: 700,
              marginBottom: "8px",
            }}
          >
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Typography>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "20px", fontWeight: 600 }}>
                {completedCount}/{totalCount} habits completed
              </Typography>
              {completedCount === totalCount && totalCount > 0 && (
                <Typography
                  sx={{
                    fontSize: "14px",
                    marginTop: "4px",
                    opacity: 0.9,
                  }}
                >
                  🎉 All done for today!
                </Typography>
              )}
            </Box>

            {tokens && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  padding: "8px 16px",
                  borderRadius: "999px",
                }}
              >
                <Shield size={20} />
                <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                  {tokens.total_tokens - tokens.used_tokens}/
                  {tokens.total_tokens}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && todayHabits.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              padding: "48px 24px",
            }}
          >
            <Typography
              sx={{
                fontSize: "48px",
                marginBottom: "16px",
              }}
            >
              🌱
            </Typography>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginBottom: "8px",
              }}
            >
              Start building your first habit
            </Typography>
            <Typography
              sx={{
                fontSize: "14px",
                color: theme.palette.text.secondary,
              }}
            >
              Tap the + button to create a new habit
            </Typography>
          </Box>
        )}

        {/* Habits List */}
        {!isLoading && (
          <Suspense fallback={<CircularProgress />}>
            <HabitsList
              todayHabits={todayHabits}
              completions={completions}
              onReorder={handleReorderHabits}
              onComplete={handleComplete}
              onUncomplete={handleUncomplete}
            />
          </Suspense>
        )}
      </Box>

      {/* FAB */}
      <Fab
        onClick={() => setFormOpen(true)}
        sx={{
          position: "fixed",
          bottom: 80,
          right: 16,
          width: 56,
          height: 56,
          backgroundColor: "#FFB01D",
          color: "#FFFFFF",
          boxShadow: isDark
            ? "0px 4px 12px rgba(0, 0, 0, 0.3)"
            : "0px 4px 12px rgba(255, 176, 29, 0.3)",
          transition: "all 0.2s ease-out",
          "&:hover": {
            backgroundColor: "#FFC247",
            boxShadow: isDark
              ? "0px 8px 16px rgba(0, 0, 0, 0.4)"
              : "0px 8px 16px rgba(255, 176, 29, 0.4)",
            transform: "scale(1.08)",
          },
          "&:active": {
            transform: "scale(0.96)",
          },
          "& svg": {
            fontSize: 28,
          },
        }}
      >
        <Plus size={28} />
      </Fab>

      {/* Modals */}
      <MoodSelector
        open={moodSelectorOpen}
        onClose={() => {
          setMoodSelectorOpen(false);
          setSelectedHabitId(null);
        }}
        onSelectMood={handleSelectMood}
        onSkip={handleSkipMood}
      />

      <HabitForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateHabit}
      />
    </AppPageLayout>
  );
}
