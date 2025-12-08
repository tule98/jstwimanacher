import { geminiService } from "@/services/gemini/GeminiService";
import { toUTC, VN_TIMEZONE } from "@/lib/timezone";

// AI service for inferring due date/time from a task description.
// Uses Google Gemini API to intelligently determine task timing.
// Returns dates in UTC for database storage.

/**
 * Create a fallback time at 06:00 (6 AM) for the given date in GMT+7
 * then convert to UTC for storage
 */
function createFallbackTime(referenceDate: Date): string {
  const fallbackDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    6,
    0,
    0
  );
  return toUTC(fallbackDate, VN_TIMEZONE);
}

export async function inferDueDateFromDescription(
  description: string
): Promise<string> {
  const now = new Date();

  // Fallback heuristic if API key is missing
  if (!process.env.GEMINI_API_KEY) {
    return createFallbackTime(now);
  }

  try {
    const prompt = `
      Given the task description: "${description}"
      
      Determine a reasonable due date and time for this task in GMT+7 (Asia/Ho_Chi_Minh timezone).
      If you cannot determine an exact time, default to 06:00 (6 AM).
      
      Consider:
      - Urgency indicators (words like "urgent", "asap", "today", "tomorrow", "next week")
      - Duration hints (long vs short tasks)
      - Current time in GMT+7: ${now.toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
      })}
      
      Respond with ONLY an ISO 8601 datetime string in GMT+7 (e.g., 2025-12-08T14:30:00 or 2025-12-08T06:00:00).
      No timezone suffix, no additional text or explanation.
    `;

    const content = await geminiService.generateText(prompt);
    const trimmed = content.trim();

    if (trimmed && /^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      // Treat the string as Asia/Ho_Chi_Minh local time, then convert to UTC
      return toUTC(trimmed, VN_TIMEZONE);
    }

    // Fallback if response format is invalid - default to 06:00 AM
    return createFallbackTime(now);
  } catch (error) {
    // Log error and return fallback (06:00 AM)
    console.error("AI due date inference failed:", error);
    return createFallbackTime(now);
  }
}
