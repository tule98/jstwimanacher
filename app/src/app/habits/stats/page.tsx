"use client";
import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { BarChart3 } from "lucide-react";
import AppPageLayout from "@/app/_components/AppPageLayout";
import AppPageNav from "@/app/_components/AppPageNav";
import {
  useHabits,
  useAllCompletions,
} from "@/services/react-query/hooks/habits";
import { formatDate } from "@/lib/habit-utils";

type TimeRange = "week" | "month" | "year";

export default function HabitsStatsPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [timeRange, setTimeRange] = useState<TimeRange>("week");

  const { startDate, endDate } = useMemo(() => {
    const end = new Date();
    const start = new Date();

    switch (timeRange) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    return {
      startDate: formatDate(start),
      endDate: formatDate(end),
    };
  }, [timeRange]);

  const { data: habits = [], isLoading: habitsLoading } = useHabits({
    includeEntries: false,
  });

  const { data: completions = [], isLoading: completionsLoading } =
    useAllCompletions(startDate, endDate);

  const stats = useMemo(() => {
    if (habits.length === 0) return null;

    const totalCompletions = completions.length;

    // Calculate completion rate
    const daysInRange = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    const expectedCompletions = habits.length * daysInRange;
    const completionRate =
      expectedCompletions > 0
        ? Math.round((totalCompletions / expectedCompletions) * 100)
        : 0;

    // Find longest streak
    let longestStreak = 0;
    habits.forEach((habit) => {
      // Use the stored streak from the habit object
      const streak = habit.current_streak ?? 0;
      if (streak > longestStreak) longestStreak = streak;
    });

    // Most common mood
    const moodCounts: Record<string, number> = {};
    completions.forEach((c) => {
      if (c.mood_emoji) {
        moodCounts[c.mood_emoji] = (moodCounts[c.mood_emoji] || 0) + 1;
      }
    });

    const mostCommonMood = Object.entries(moodCounts).sort(
      ([, a], [, b]) => b - a
    )[0]?.[0];

    return {
      totalCompletions,
      completionRate,
      longestStreak,
      mostCommonMood,
      moodCounts,
    };
  }, [habits, completions, startDate, endDate]);

  const habitStats = useMemo(() => {
    return habits.map((habit) => {
      const habitCompletions = completions.filter(
        (c) => c.habit_id === habit.id
      );
      // Use the stored streak from the habit object
      const streak = habit.current_streak ?? 0;
      const completionCount = habitCompletions.length;

      // Calculate expected completions for this habit
      const daysInRange = Math.ceil(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      const completionRate =
        daysInRange > 0 ? Math.round((completionCount / daysInRange) * 100) : 0;

      return {
        habit,
        streak,
        completionCount,
        completionRate,
      };
    });
  }, [habits, completions, startDate, endDate]);

  const isLoading = habitsLoading || completionsLoading;

  return (
    <AppPageLayout
      header={
        <AppPageNav
          title="Stats"
          icon={<BarChart3 size={24} color={isDark ? "#5B7AFF" : "#4158D0"} />}
        />
      }
    >
      <Box sx={{ padding: "16px", paddingBottom: "80px" }}>
        {/* Time Range Selector */}
        <Box
          sx={{
            marginBottom: "24px",
            position: "sticky",
            top: 0,
            zIndex: 10,
            backgroundColor: theme.palette.background.default,
            paddingY: "8px",
          }}
        >
          <ToggleButtonGroup
            value={timeRange}
            exclusive
            onChange={(_, value) => value && setTimeRange(value)}
            fullWidth
            sx={{
              height: "48px",
              "& .MuiToggleButton-root": {
                fontSize: "16px",
                fontWeight: 600,
                textTransform: "none",
                borderRadius: "12px",
                borderColor: isDark ? "#334155" : "#E5E7EB",
                color: theme.palette.text.secondary,
                "&.Mui-selected": {
                  backgroundColor: isDark ? "#5B7AFF" : "#4158D0",
                  color: "#FFFFFF",
                  "&:hover": {
                    backgroundColor: isDark ? "#4158D0" : "#3348B0",
                  },
                },
              },
            }}
          >
            <ToggleButton value="week">Week</ToggleButton>
            <ToggleButton value="month">Month</ToggleButton>
            <ToggleButton value="year">Year</ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Empty State */}
        {!isLoading && habits.length === 0 && (
          <Box sx={{ textAlign: "center", padding: "48px 24px" }}>
            <Typography sx={{ fontSize: "48px", marginBottom: "16px" }}>
              📊
            </Typography>
            <Typography
              sx={{
                fontSize: "20px",
                fontWeight: 600,
                color: theme.palette.text.primary,
                marginBottom: "8px",
              }}
            >
              No stats yet
            </Typography>
            <Typography
              sx={{ fontSize: "14px", color: theme.palette.text.secondary }}
            >
              Start tracking habits to see your progress
            </Typography>
          </Box>
        )}

        {/* Overall Stats */}
        {!isLoading && stats && (
          <>
            <Box
              sx={{
                backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                borderRadius: "16px",
                padding: "20px",
                marginBottom: "24px",
                boxShadow: isDark ? "none" : "0px 1px 3px rgba(0, 0, 0, 0.1)",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "none",
              }}
            >
              <Typography
                sx={{
                  fontSize: "16px",
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                  marginBottom: "16px",
                  letterSpacing: "0.5px",
                }}
              >
                OVERALL PERFORMANCE
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "16px",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: isDark ? "#5B7AFF" : "#4158D0",
                    }}
                  >
                    {stats.completionRate}%
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Completion Rate
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: "32px",
                        fontWeight: 700,
                        color: isDark ? "#FFC247" : "#FFB01D",
                      }}
                    >
                      {stats.longestStreak}
                    </Typography>
                    <Typography sx={{ fontSize: "24px" }}>🔥</Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Longest Streak
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: "32px",
                      fontWeight: 700,
                      color: isDark ? "#34D399" : "#10B981",
                    }}
                  >
                    {stats.totalCompletions}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "14px",
                      color: theme.palette.text.secondary,
                    }}
                  >
                    Total Completions
                  </Typography>
                </Box>

                {stats.mostCommonMood && (
                  <Box>
                    <Typography sx={{ fontSize: "32px", fontWeight: 700 }}>
                      {stats.mostCommonMood}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "14px",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      Most Common Mood
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Habit-Specific Stats */}
            <Typography
              sx={{
                fontSize: "16px",
                fontWeight: 600,
                color: theme.palette.text.secondary,
                marginBottom: "16px",
                letterSpacing: "0.5px",
              }}
            >
              HABIT BREAKDOWN
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {habitStats.map(
                ({ habit, streak, completionCount, completionRate }) => (
                  <Box
                    key={habit.id}
                    sx={{
                      backgroundColor: isDark ? "#1E293B" : "#FFFFFF",
                      borderRadius: "16px",
                      padding: "16px",
                      boxShadow: isDark
                        ? "none"
                        : "0px 1px 3px rgba(0, 0, 0, 0.1)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.05)"
                        : "none",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "18px",
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        marginBottom: "12px",
                      }}
                    >
                      {habit.name}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                      }}
                    >
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: "20px",
                              fontWeight: 700,
                              color: isDark ? "#FFC247" : "#FFB01D",
                            }}
                          >
                            {streak}
                          </Typography>
                          <Typography sx={{ fontSize: "16px" }}>🔥</Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Streak
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: isDark ? "#34D399" : "#10B981",
                          }}
                        >
                          {completionCount}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Completions
                        </Typography>
                      </Box>

                      <Box>
                        <Typography
                          sx={{
                            fontSize: "20px",
                            fontWeight: 700,
                            color: isDark ? "#5B7AFF" : "#4158D0",
                          }}
                        >
                          {completionRate}%
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "12px",
                            color: theme.palette.text.secondary,
                          }}
                        >
                          Rate
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              )}
            </Box>
          </>
        )}
      </Box>
    </AppPageLayout>
  );
}
