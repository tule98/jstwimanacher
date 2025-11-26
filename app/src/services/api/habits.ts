import { httpClient } from "@/lib/http-client";

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface HabitJournalEntry {
  id: string;
  habit_id: string;
  content: string; // HTML content with mentions
  entry_date: string; // YYYY-MM-DD
  created_at: string;
  updated_at: string;
}

export const HabitsAPI = {
  async list(options?: {
    includeEntries?: boolean;
    days?: number;
  }): Promise<(Habit & { entries?: HabitJournalEntry[] })[]> {
    const params = new URLSearchParams();
    if (options?.includeEntries === false)
      params.set("includeEntries", "false");
    if (options?.days) params.set("days", String(options.days));
    return httpClient.get<(Habit & { entries?: HabitJournalEntry[] })[]>(
      `/api/habits${params.toString() ? `?${params.toString()}` : ""}`
    );
  },
  async create(payload: {
    name: string;
    description?: string;
  }): Promise<Habit> {
    return httpClient.post<Habit>("/api/habits", payload);
  },
  async update(
    id: string,
    payload: Partial<{
      name: string;
      description: string;
      status: "active" | "inactive";
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
};
