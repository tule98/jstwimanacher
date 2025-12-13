import { parseUserDateToUTC } from "./timezone";

export type RecurrenceType = "none" | "daily" | "weekly" | "specific_days";

/**
 * Calculate the next due date based on recurrence pattern
 * @param currentDueDate Current due date in ISO format (UTC)
 * @param recurrenceType Type of recurrence
 * @param recurrenceDays Day numbers for specific_days pattern [0-6] (0=Sunday)
 * @returns Next due date in ISO format (UTC)
 */
export function calculateNextDueDate(
  currentDueDate: string,
  recurrenceType: RecurrenceType,
  recurrenceDays?: number[]
): string {
  if (recurrenceType === "none") {
    return currentDueDate;
  }

  // Convert UTC to local time to preserve the same local time for next occurrence
  const currentDate = new Date(currentDueDate);
  const localDate = new Date(currentDate.getTime());

  if (recurrenceType === "daily") {
    localDate.setDate(localDate.getDate() + 1);
  } else if (recurrenceType === "weekly") {
    localDate.setDate(localDate.getDate() + 7);
  } else if (
    recurrenceType === "specific_days" &&
    recurrenceDays &&
    recurrenceDays.length > 0
  ) {
    // Find next occurrence of one of the specified days
    const nextDate = new Date(localDate);
    const maxIterations = 365; // Prevent infinite loop
    let iterations = 0;

    while (iterations < maxIterations) {
      nextDate.setDate(nextDate.getDate() + 1);
      if (recurrenceDays.includes(nextDate.getDay())) {
        localDate.setTime(nextDate.getTime());
        break;
      }
      iterations++;
    }
  }

  // Convert back to UTC, preserving the local time
  return parseUserDateToUTC(localDate.toISOString().slice(0, 16));
}

/**
 * Parse recurrence_days JSON string to array
 */
export function parseRecurrenceDays(
  daysStr: string | null | undefined
): number[] {
  if (!daysStr) return [];
  try {
    return JSON.parse(daysStr);
  } catch {
    return [];
  }
}

/**
 * Format recurrence for display
 */
export function formatRecurrence(
  recurrenceType: RecurrenceType,
  recurrenceDays?: number[]
): string {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  if (recurrenceType === "none") {
    return "No repeat";
  } else if (recurrenceType === "daily") {
    return "Daily";
  } else if (recurrenceType === "weekly") {
    return "Weekly";
  } else if (
    recurrenceType === "specific_days" &&
    recurrenceDays &&
    recurrenceDays.length > 0
  ) {
    const dayLabels = recurrenceDays
      .sort()
      .map((day) => dayNames[day])
      .join(", ");
    return `Every ${dayLabels}`;
  }
  return "No repeat";
}
