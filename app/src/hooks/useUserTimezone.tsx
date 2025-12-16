"use client";

import { useEffect, useState, useCallback, useContext, createContext } from "react";
import { useAuth } from "./useAuth";
import {
  formatInTimeZone,
  toZonedTime,
  fromZonedTime,
} from "date-fns-tz";
import { parseISO } from "date-fns";
import { VN_TIMEZONE } from "@/lib/timezone";

interface UseUserTimezoneReturn {
  timezone: string;
  loading: boolean;
  formatDate: (utcDateString: string) => string;
  formatDateTime: (utcDateString: string) => string;
  parseUserInput: (input: string) => string; // Returns UTC ISO string
  toLocalDate: (utcDateString: string) => Date;
  _testSetTimezone?: (tz: string) => void; // For testing only
}

/**
 * Context for timezone - allows sharing timezone state without prop drilling
 */
const TimezoneContext = createContext<UseUserTimezoneReturn | null>(null);

/**
 * Hook to use timezone context throughout the app
 * Must be called within TimezoneProvider
 */
export function useUserTimezone(): UseUserTimezoneReturn {
  const context = useContext(TimezoneContext);
  if (!context) {
    throw new Error("useUserTimezone must be used within TimezoneProvider");
  }
  return context;
}

/**
 * Provider component that wraps the app
 * Handles timezone auto-detection and context management
 */
export function TimezoneProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [timezone, setTimezone] = useState<string>(VN_TIMEZONE);
  const [loading, setLoading] = useState(true);
  const [testTimezone, setTestTimezone] = useState<string | null>(null);

  // Fetch user timezone from database
  const fetchUserTimezone = useCallback(async () => {
    try {
      const response = await fetch("/api/user/timezone");
      if (response.ok) {
        const data = await response.json();
        if (data.timezone) {
          setTimezone(data.timezone);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to fetch user timezone:", error);
    }

    // Fallback: auto-detect timezone on first load
    await autoDetectAndSaveTimezone();
  }, []);

  // Auto-detect timezone using browser API
  const autoDetectAndSaveTimezone = useCallback(async () => {
    try {
      const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Save to database
      const response = await fetch("/api/user/timezone", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timezone: detectedTimezone }),
      });

      if (response.ok) {
        setTimezone(detectedTimezone);
      } else {
        // Fallback if save fails
        setTimezone(detectedTimezone);
      }
    } catch (error) {
      console.error("Failed to auto-detect timezone:", error);
      setTimezone(VN_TIMEZONE); // Fallback to default
    } finally {
      setLoading(false);
    }
  }, []);

  // On first page load (when user is authenticated), fetch or detect timezone
  useEffect(() => {
    if (user) {
      fetchUserTimezone();
    } else if (!user && !loading) {
      // User is not authenticated - use default timezone
      setLoading(false);
    }
  }, [user, fetchUserTimezone]);

  // Formatting utilities
  const formatDate = useCallback(
    (utcDateString: string): string => {
      try {
        const activeTimezone = testTimezone || timezone;
        const utcDate = parseISO(utcDateString);
        return formatInTimeZone(utcDate, activeTimezone, "dd/MM/yyyy");
      } catch (error) {
        console.error("Failed to format date:", error);
        return "Invalid date";
      }
    },
    [timezone, testTimezone]
  );

  const formatDateTime = useCallback(
    (utcDateString: string): string => {
      try {
        const activeTimezone = testTimezone || timezone;
        const utcDate = parseISO(utcDateString);
        return formatInTimeZone(utcDate, activeTimezone, "dd/MM/yyyy HH:mm");
      } catch (error) {
        console.error("Failed to format datetime:", error);
        return "Invalid datetime";
      }
    },
    [timezone, testTimezone]
  );

  const parseUserInput = useCallback(
    (input: string): string => {
      try {
        const activeTimezone = testTimezone || timezone;

        // If already UTC, return as-is
        if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(input)) {
          return parseISO(input).toISOString();
        }

        // Parse input as local time and convert to UTC
        const parsed = parseISO(input);
        const utcDate = fromZonedTime(parsed, activeTimezone);
        return utcDate.toISOString();
      } catch (error) {
        console.error("Failed to parse user input:", error);
        return new Date().toISOString();
      }
    },
    [timezone, testTimezone]
  );

  const toLocalDate = useCallback(
    (utcDateString: string): Date => {
      try {
        const activeTimezone = testTimezone || timezone;
        const utcDate = parseISO(utcDateString);
        return toZonedTime(utcDate, activeTimezone);
      } catch (error) {
        console.error("Failed to convert to local date:", error);
        return new Date();
      }
    },
    [timezone, testTimezone]
  );

  // Test-only function to override timezone for testing different regions
  const _testSetTimezone = useCallback((tz: string) => {
    setTestTimezone(tz);
  }, []);

  const value: UseUserTimezoneReturn = {
    timezone: testTimezone || timezone,
    loading,
    formatDate,
    formatDateTime,
    parseUserInput,
    toLocalDate,
    _testSetTimezone,
  };

  return (
    <TimezoneContext.Provider value={value}>{children}</TimezoneContext.Provider>
  );
}

export { TimezoneContext };
