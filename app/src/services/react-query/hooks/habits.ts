"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { HabitsAPI, Habit, HabitJournalEntry } from "@/services/api/habits";

export const habitQueryKeys = {
  all: ["habits"] as const,
  lists: () => ["habits", "list"] as const,
  list: (opts?: { includeEntries?: boolean; month?: number; year?: number }) =>
    [
      "habits",
      "list",
      opts?.includeEntries ?? true,
      opts?.month,
      opts?.year,
    ] as const,
};

export function useHabits(options?: {
  includeEntries?: boolean;
  month?: number;
  year?: number;
}) {
  return useQuery<(Habit & { entries?: HabitJournalEntry[] })[]>({
    queryKey: habitQueryKeys.list(options),
    queryFn: () => HabitsAPI.list(options),
    staleTime: 60_000,
  });
}

export function useCreateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      HabitsAPI.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useUpdateHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: {
      id: string;
      data: Partial<{
        name: string;
        description: string;
        status: "active" | "inactive";
      }>;
    }) => HabitsAPI.update(args.id, args.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HabitsAPI.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useCreateJournalEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      habitId: string;
      content: string;
      entry_date: string;
    }) => HabitsAPI.createJournalEntry(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useJournalEntries(habitId: string, limit?: number) {
  return useQuery({
    queryKey: ["habitJournalEntries", habitId, limit],
    queryFn: () => HabitsAPI.getJournalEntries(habitId, limit),
    enabled: !!habitId,
    staleTime: 60_000,
  });
}
