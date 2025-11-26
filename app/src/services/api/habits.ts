import { httpClient } from "@/lib/http-client";

export interface Habit {
  id: string;
  name: string;
  description?: string | null;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
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
    includeLogs?: boolean;
    days?: number;
  }): Promise<(Habit & { logs?: HabitLog[] })[]> {
    const params = new URLSearchParams();
    if (options?.includeLogs === false) params.set("includeLogs", "false");
    if (options?.days) params.set("days", String(options.days));
    return httpClient.get<(Habit & { logs?: HabitLog[] })[]>(
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
  async log(payload: {
    habitId: string;
    date: string;
    completed?: boolean;
  }): Promise<HabitLog> {
    return httpClient.post<HabitLog>("/api/habits/log", payload);
  },
  async createJournalEntry(payload: {
    habitId: string;
    content: string;
    entry_date: string;
  }): Promise<HabitJournalEntry> {
    return httpClient.post<HabitJournalEntry>(
      `/api/habits/${payload.habitId}/habit-logs`,
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
      `/api/habits/${habitId}/habit-logs${
        params.toString() ? `?${params.toString()}` : ""
      }`
    );
  },
};
