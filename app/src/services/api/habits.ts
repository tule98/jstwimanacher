import { httpClient } from "@/lib/http-client";

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  frequency_type: "daily" | "custom";
  frequency_days?: string | null; // JSON string
  start_date: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  current_streak: number; // Current streak count
}

export interface HabitJournalEntry {
  id: string;
  habit_id: string;
  content: string; // HTML content with mentions
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completion_date: string; // YYYY-MM-DD
  mood_emoji?: string | null;
  completed_at: string;
  created_at: string;
  updated_at: string;
}

export interface StreakFreezeToken {
  id: string;
  user_id: string;
  total_tokens: number;
  used_tokens: number;
  month: number;
  year: number;
  created_at: string;
  updated_at: string;
}

export const HabitsAPI = {
  async list(options?: {
    includeEntries?: boolean;
    month?: number;
    year?: number;
  }): Promise<(Habit & { entries?: HabitJournalEntry[] })[]> {
    const params = new URLSearchParams();
    if (options?.includeEntries === false)
      params.set("includeEntries", "false");
    if (options?.month) params.set("month", String(options.month));
    if (options?.year) params.set("year", String(options.year));
    return httpClient.get<(Habit & { entries?: HabitJournalEntry[] })[]>(
      `/api/habits${params.toString() ? `?${params.toString()}` : ""}`
    );
  },
  async create(payload: {
    name: string;
    description?: string;
    frequency_type?: "daily" | "custom";
    frequency_days?: number[];
    start_date?: string;
  }): Promise<Habit> {
    return httpClient.post<Habit>("/api/habits", payload);
  },
  async update(
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      status: "active" | "inactive";
      frequency_type: "daily" | "custom";
      frequency_days: number[];
    }>
  ): Promise<Habit> {
    return httpClient.put<Habit>(`/api/habits/${id}`, payload);
  },
  async remove(id: string): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(`/api/habits/${id}`);
  },
  async createJournalEntry(payload: {
    habitId: string;
    content: string;
    entry_date: string;
  }): Promise<HabitJournalEntry> {
    return httpClient.post<HabitJournalEntry>(
      `/api/habits/${payload.habitId}/habit-journal-entries`,
      {
        content: payload.content,
        entry_date: payload.entry_date,
      }
    );
  },
  async getJournalEntries(
    habitId: string,
    limit?: number
  ): Promise<HabitJournalEntry[]> {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    return httpClient.get<HabitJournalEntry[]>(
      `/api/habits/${habitId}/habit-journal-entries${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
  },
  // Completions
  async completeHabit(payload: {
    habitId: string;
    completionDate: string;
    moodEmoji?: string;
  }): Promise<HabitCompletion> {
    return httpClient.post<HabitCompletion>("/api/habits/completions", payload);
  },
  async uncompleteHabit(
    habitId: string,
    completionDate: string
  ): Promise<{ success: boolean }> {
    return httpClient.delete<{ success: boolean }>(
      `/api/habits/completions?habitId=${habitId}&completionDate=${completionDate}`
    );
  },
  async getCompletions(
    habitId: string,
    startDate?: string,
    endDate?: string
  ): Promise<HabitCompletion[]> {
    const params = new URLSearchParams({ habitId });
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    return httpClient.get<HabitCompletion[]>(
      `/api/habits/completions?${params.toString()}`
    );
  },
  async getAllCompletions(
    startDate: string,
    endDate: string
  ): Promise<HabitCompletion[]> {
    const params = new URLSearchParams({ startDate, endDate });
    return httpClient.get<HabitCompletion[]>(
      `/api/habits/completions?${params.toString()}`
    );
  },
  // Archive
  async archive(id: string): Promise<Habit> {
    return httpClient.post<Habit>(`/api/habits/${id}/archive`, {});
  },
  async unarchive(id: string): Promise<Habit> {
    return httpClient.delete<Habit>(`/api/habits/${id}/archive`);
  },
  async getArchived(): Promise<Habit[]> {
    return httpClient.get<Habit[]>("/api/habits/archived");
  },
  // Tokens
  async getTokens(userId?: string): Promise<StreakFreezeToken> {
    const params = userId ? `?userId=${userId}` : "";
    return httpClient.get<StreakFreezeToken>(`/api/habits/tokens${params}`);
  },
  async consumeToken(payload: {
    habitId: string;
    freezeDate: string;
    userId?: string;
  }): Promise<{ success: boolean; message: string }> {
    return httpClient.post<{ success: boolean; message: string }>(
      "/api/habits/tokens/use",
      payload
    );
  },
};
