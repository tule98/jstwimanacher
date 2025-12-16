import { Habit, HabitCompletion } from "@/services/api/habits";
import { getTodayLocal, formatLocalDate } from "@/lib/timezone";

/**
 * Calculate the current streak for a habit
 *
 * @deprecated This function is deprecated. The streak is now stored in the `current_streak`
 * field of the Habit object and is automatically updated when completions are added/removed
 * or when streak freeze tokens are used. Use `habit.current_streak` instead.
 *
 * This function is kept for backward compatibility and migration purposes only.
 */
export function calculateStreak(
  habit: Habit,
  completions: HabitCompletion[],
  tokenUsedDates: string[] = []
): number {
  const startDate = new Date(habit.start_date);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  const frequencyDays = habit.frequency_days
    ? JSON.parse(habit.frequency_days)
    : null;

  // Sort completions by date descending
  const sortedCompletions = [...completions].sort(
    (a, b) =>
      new Date(b.completion_date).getTime() -
      new Date(a.completion_date).getTime()
  );

  let streak = 0;
  const currentDate = new Date(today);

  // Check if habit is scheduled for today
  const isScheduledToday = isHabitScheduledForDate(
    currentDate,
    habit.frequency_type,
    frequencyDays
  );

  // If today is scheduled and not completed, start from yesterday
  if (isScheduledToday) {
    const todayCompletion = sortedCompletions.find(
      (c) => c.completion_date === formatDate(currentDate)
    );
    if (todayCompletion) {
      streak++;
    }
  }

  // Go back day by day
  currentDate.setDate(currentDate.getDate() - 1);

  while (currentDate >= startDate) {
    const dateStr = formatDate(currentDate);

    // Check if this day is scheduled
    if (
      !isHabitScheduledForDate(currentDate, habit.frequency_type, frequencyDays)
    ) {
      currentDate.setDate(currentDate.getDate() - 1);
      continue;
    }

    // Check if completed or token used
    const hasCompletion = sortedCompletions.some(
      (c) => c.completion_date === dateStr
    );
    const hasToken = tokenUsedDates.includes(dateStr);

    if (hasCompletion || hasToken) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // Streak broken
      break;
    }
  }

  return streak;
}

/**
 * Check if a habit is scheduled for a specific date
 */
export function isHabitScheduledForDate(
  date: Date,
  frequencyType: "daily" | "custom",
  frequencyDays: number[] | null
): boolean {
  if (frequencyType === "daily") return true;
  if (!frequencyDays || frequencyDays.length === 0) return false;

  const dayOfWeek = date.getDay(); // 0 = Sunday
  return frequencyDays.includes(dayOfWeek);
}

/**
 * Format date as YYYY-MM-DD
 * Builds explicit YYYY-MM-DD string without timezone conversion
 * (avoids .toISOString().slice which can cause timezone offset issues)
 */
export function formatDate(date: Date): string {
  return formatLocalDate(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    true // month is 0-indexed from getMonth()
  );
}

/**
 * Get today's date as YYYY-MM-DD in user's local timezone
 * Uses timezone-aware utility to ensure correct "today" regardless of server timezone
 */
export function getTodayString(): string {
  return getTodayLocal();
}

/**
 * Check if a habit is completed today
 */
export function isCompletedToday(
  completions: HabitCompletion[],
  today: string = getTodayString()
): boolean {
  return completions.some((c) => c.completion_date === today);
}

/**
 * Get the mood emoji for today's completion
 */
export function getTodayMood(
  completions: HabitCompletion[],
  today: string = getTodayString()
): string | undefined {
  const todayCompletion = completions.find((c) => c.completion_date === today);
  return todayCompletion?.mood_emoji || undefined;
}
