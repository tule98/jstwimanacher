"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  HabitsAPI,
  Habit,
  HabitJournalEntry,
  HabitCompletion,
  StreakFreezeToken,
} from "@/services/api/habits";

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
  archived: () => ["habits", "archived"] as const,
  completions: (habitId?: string) =>
    ["habits", "completions", habitId] as const,
  tokens: () => ["habits", "tokens"] as const,
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
    mutationFn: (payload: {
      name: string;
      description?: string;
      frequency_type?: "daily" | "custom";
      frequency_days?: number[];
      start_date?: string;
    }) => HabitsAPI.create(payload),
    onSuccess: () => {
      // Invalidate all habit queries including lists with different options
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
        frequency_type: "daily" | "custom";
        frequency_days: number[];
      }>;
    }) => HabitsAPI.update(args.id, args.data),
    onSuccess: () => {
      // Invalidate all habit queries including lists with different options
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useDeleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HabitsAPI.remove(id),
    onSuccess: () => {
      // Invalidate all habit queries including lists with different options
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

// Completions hooks
export function useCompleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      habitId: string;
      completionDate: string;
      moodEmoji?: string;
    }) => HabitsAPI.completeHabit(payload),
    onMutate: async (payload) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await qc.cancelQueries({ queryKey: habitQueryKeys.all });

      // Snapshot previous values for rollback
      const previousCompletions = qc.getQueryData<HabitCompletion[]>([
        "habits",
        "completions",
        "all",
      ]);

      // Optimistically update completions cache
      qc.setQueriesData<HabitCompletion[]>(
        { queryKey: ["habits", "completions", "all"], exact: false },
        (old) => {
          if (!old) return old;
          // Check if completion already exists
          const exists = old.some(
            (c) =>
              c.habit_id === payload.habitId &&
              c.completion_date === payload.completionDate
          );
          if (exists) return old;
          // Add new completion
          return [
            ...old,
            {
              id: `temp-${Date.now()}`,
              habit_id: payload.habitId,
              completion_date: payload.completionDate,
              mood_emoji: payload.moodEmoji || null,
              created_at: new Date().toISOString(),
            } as HabitCompletion,
          ];
        }
      );

      return { previousCompletions };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        qc.setQueryData(
          ["habits", "completions", "all"],
          context.previousCompletions
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useUncompleteHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (args: { habitId: string; completionDate: string }) =>
      HabitsAPI.uncompleteHabit(args.habitId, args.completionDate),
    onMutate: async (args) => {
      // Cancel outgoing refetches
      await qc.cancelQueries({ queryKey: habitQueryKeys.all });

      // Snapshot previous values for rollback
      const previousCompletions = qc.getQueryData<HabitCompletion[]>([
        "habits",
        "completions",
        "all",
      ]);

      // Optimistically remove completion from cache
      qc.setQueriesData<HabitCompletion[]>(
        { queryKey: ["habits", "completions", "all"], exact: false },
        (old) => {
          if (!old) return old;
          return old.filter(
            (c) =>
              !(
                c.habit_id === args.habitId &&
                c.completion_date === args.completionDate
              )
          );
        }
      );

      return { previousCompletions };
    },
    onError: (_error, _variables, context) => {
      // Rollback on error
      if (context?.previousCompletions) {
        qc.setQueryData(
          ["habits", "completions", "all"],
          context.previousCompletions
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
    },
  });
}

export function useHabitCompletions(
  habitId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery<HabitCompletion[]>({
    queryKey: habitQueryKeys.completions(habitId),
    queryFn: () => HabitsAPI.getCompletions(habitId, startDate, endDate),
    enabled: !!habitId,
    staleTime: 30_000,
  });
}

export function useAllCompletions(startDate: string, endDate: string) {
  return useQuery<HabitCompletion[]>({
    queryKey: ["habits", "completions", "all", startDate, endDate],
    queryFn: () => HabitsAPI.getAllCompletions(startDate, endDate),
    staleTime: 30_000,
  });
}

// Archive hooks
export function useArchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HabitsAPI.archive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
      qc.invalidateQueries({ queryKey: habitQueryKeys.archived() });
    },
  });
}

export function useUnarchiveHabit() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => HabitsAPI.unarchive(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.all });
      qc.invalidateQueries({ queryKey: habitQueryKeys.archived() });
    },
  });
}

export function useArchivedHabits() {
  return useQuery<Habit[]>({
    queryKey: habitQueryKeys.archived(),
    queryFn: () => HabitsAPI.getArchived(),
    staleTime: 60_000,
  });
}

// Token hooks
export function useStreakTokens(userId?: string) {
  return useQuery<StreakFreezeToken>({
    queryKey: habitQueryKeys.tokens(),
    queryFn: () => HabitsAPI.getTokens(userId),
    staleTime: 300_000, // 5 minutes
  });
}

export function useStreakFreezeToken() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      habitId: string;
      freezeDate: string;
      userId?: string;
    }) => HabitsAPI.consumeToken(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: habitQueryKeys.tokens() });
    },
  });
}
