/**
 * React Query hooks for Memory Decay operations
 * Manages cron job scheduling, manual triggers, and status checking
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

/**
 * Hook for manually triggering memory decay
 * Used in admin panel or for testing
 */
export function useManualMemoryDecay() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/words/memory-decay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to trigger memory decay");
      }

      return response.json();
    },
  });
}

/**
 * Hook for checking memory decay job status
 * Shows when it last ran and how many words were decayed
 */
export function useMemoryDecayStatus() {
  return useQuery({
    queryKey: ["memory-decay-status"],
    queryFn: async () => {
      const response = await fetch("/api/words/memory-decay-status");

      if (!response.ok) {
        throw new Error("Failed to fetch memory decay status");
      }

      return response.json();
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    refetchInterval: 60 * 60 * 1000, // Refresh every hour
  });
}

/**
 * Hook for scheduling the cron job
 * Should be called once during app initialization
 */
export function useScheduleMemoryDecayJob() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/words/schedule-memory-decay", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to schedule decay job");
      }

      return response.json();
    },
  });
}

/**
 * Hook for getting decay statistics
 * Returns memory level breakdown and decay trends
 */
export function useMemoryDecayStats(userId?: string) {
  return useQuery({
    queryKey: ["memory-decay-stats", userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (userId) {
        params.append("userId", userId);
      }

      const response = await fetch(`/api/words/memory-decay-stats?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch decay statistics");
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}
