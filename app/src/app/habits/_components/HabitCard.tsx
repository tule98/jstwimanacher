"use client";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Switch,
} from "@mui/material";
import { useMemo } from "react";
import type { Habit, HabitJournalEntry } from "@/services/api/habits";
import { getTodayLocal, formatLocalDate } from "@/lib/timezone";

interface HabitCardProps {
  habit: Habit & { entries?: HabitJournalEntry[] };
  onToggleStatus: (id: string, active: boolean) => void;
  onMarkToday: (habitId: string, date: string) => void;
  onOpenJournal: (habitId: string) => void;
}

// Generate all days in current month with journal entry status
const generateMonthContribution = (
  entries: HabitJournalEntry[] = []
): Array<{
  date: string;
  day: number;
  hasEntry: boolean;
}> => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();

  // Get last day of current month to determine days in month
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();

  const days: Array<{
    date: string;
    day: number;
    hasEntry: boolean;
  }> = [];

  // Create a map of entries for quick lookup
  const entryMap = new Map(entries.map((entry) => [entry.entry_date, entry]));

  // Generate all days
  for (let day = 1; day <= daysInMonth; day++) {
    // Create date string directly to avoid timezone issues
    const dateStr = formatLocalDate(year, month, day, true);
    const entry = entryMap.get(dateStr);

    days.push({
      date: dateStr,
      day,
      hasEntry: !!entry,
    });
  }

  return days;
};

export default function HabitCard({
  habit,
  onToggleStatus,
  onMarkToday,
  onOpenJournal,
}: HabitCardProps) {
  const today = useMemo(() => getTodayLocal(), []);

  const contributionDays = useMemo(
    () => generateMonthContribution(habit.entries),
    [habit.entries]
  );

  const currentMonthName = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  }, []);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{habit.name}</Typography>
        {habit.description && (
          <Typography variant="body2" color="text.secondary">
            {habit.description}
          </Typography>
        )}
        <Typography variant="caption" sx={{ display: "block", mt: 1 }}>
          Status: {habit.status}
        </Typography>

        {/* Full month contribution graph */}
        <Box sx={{ mt: 2 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            gutterBottom
            display="block"
          >
            {currentMonthName}
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.3,
              mt: 1,
            }}
          >
            {contributionDays.map((dayData) => {
              const isToday = dayData.date === today;

              return (
                <Box
                  key={dayData.date}
                  title={`${dayData.date} - ${
                    dayData.hasEntry ? "Has entry" : "No entry"
                  }`}
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.5625rem",
                    fontWeight: isToday ? "bold" : "normal",
                    border: isToday ? "1.5px solid" : "1px solid",
                    borderColor: isToday ? "primary.main" : "divider",
                    backgroundColor: dayData.hasEntry
                      ? "success.main"
                      : "grey.100",
                    color: dayData.hasEntry
                      ? "success.contrastText"
                      : "success.contrastText",
                    cursor: "default",
                  }}
                >
                  {dayData.day}
                </Box>
              );
            })}
          </Box>
          <Box sx={{ mt: 1, display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  bgcolor: "success.main",
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.625rem" }}
                color="text.secondary"
              >
                Has Entry
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: 0.5,
                  bgcolor: "grey.100",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              />
              <Typography
                variant="caption"
                sx={{ fontSize: "0.625rem" }}
                color="text.secondary"
              >
                No Entry
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
      <CardActions>
        <Switch
          checked={habit.status === "active"}
          onChange={(e) => onToggleStatus(habit.id, e.target.checked)}
        />
        <Button size="small" onClick={() => onMarkToday(habit.id, today)}>
          Mark Today
        </Button>
        <Button
          size="small"
          variant="outlined"
          onClick={() => onOpenJournal(habit.id)}
        >
          Journal
        </Button>
      </CardActions>
    </Card>
  );
}
