import React, { useMemo } from "react";
import { Box, Typography, useTheme, CircularProgress } from "@mui/material";
import { useHabitCompletions } from "@/services/react-query/hooks/habits";
import { formatDate } from "@/lib/habit-utils";
import { toZonedTime } from "date-fns-tz";
import { VN_TIMEZONE } from "@/lib/timezone";

export interface HabitCardBackProps {
  habitId: string;
  habitName: string;
}

export default function HabitCardBack({
  habitId,
  habitName,
}: HabitCardBackProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  // TODO: Calculate the correct date range for the contribution graph
  // Currently using last 60 days, adjust as needed
  const endDate = useMemo(() => {
    // Get today's date at midnight in user's timezone
    const now = new Date();
    const zonedNow = toZonedTime(now, VN_TIMEZONE);
    const today = new Date(zonedNow);
    today.setHours(23, 59, 59, 999);
    return formatDate(today);
  }, []);

  const startDate = useMemo(() => {
    // Get date 60 days ago in user's timezone
    const now = new Date();
    const zonedNow = toZonedTime(now, VN_TIMEZONE);
    const date = new Date(zonedNow);
    date.setDate(date.getDate() - 60);
    date.setHours(0, 0, 0, 0);
    return formatDate(date);
  }, []);

  const { data: completions, isLoading } = useHabitCompletions(
    habitId,
    startDate,
    endDate
  );

  // Generate contribution graph data for the last 60 days
  const contributionData = useMemo(() => {
    // Get today's date at midnight in user's timezone
    const now = new Date();
    const zonedNow = toZonedTime(now, VN_TIMEZONE);
    const baseDate = new Date(zonedNow);
    baseDate.setHours(23, 59, 59, 999);

    return Array.from({ length: 61 }, (_, idx) => {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - (60 - idx));
      const dateStr = formatDate(d);
      const completed = completions?.some((c) => c.completion_date === dateStr);
      return {
        date: dateStr,
        completed,
        dayOfWeek: d.getDay(),
      };
    });
  }, [completions]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Habit Name Header */}
      <Typography
        sx={{
          fontSize: "14px",
          fontWeight: 600,
          color: theme.palette.text.primary,
          lineHeight: "20px",
          marginBottom: "6px",
          flexShrink: 0,
        }}
      >
        {habitName}
      </Typography>

      {/* Contribution Graph */}
      {isLoading ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={20} />
        </Box>
      ) : (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            overflow: "auto",
          }}
        >
          {/* Contribution Grid - Single row with wrap */}
          <Box
            sx={{
              display: "flex",
              gap: "2px",
              flexWrap: "wrap",
              alignContent: "flex-start",
            }}
          >
            {contributionData.map((day) => (
              <Box
                key={day.date}
                title={`${new Date(day.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })} — ${day.completed ? "Done" : "Missed"}`}
                sx={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "2px",
                  backgroundColor: day.completed
                    ? isDark
                      ? "#5B7AFF"
                      : "#4158D0"
                    : isDark
                    ? "rgba(255, 255, 255, 0.06)"
                    : "#F3F4F6",
                  border: `1px solid ${
                    day.completed
                      ? isDark
                        ? "rgba(255, 255, 255, 0.1)"
                        : "rgba(65, 88, 208, 0.3)"
                      : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#E5E7EB"
                  }`,
                  flexShrink: 0,
                  transition: "all 0.15s ease-out",
                  "&:hover": {
                    transform: "scale(1.3)",
                    zIndex: 1,
                  },
                }}
              />
            ))}
          </Box>
          {/* Stats - compact */}
          <Typography
            sx={{
              fontSize: "11px",
              color: theme.palette.text.secondary,
              lineHeight: "14px",
              marginTop: "2px",
            }}
          >
            {completions?.length || 0} days completed
          </Typography>
        </Box>
      )}
    </Box>
  );
}
