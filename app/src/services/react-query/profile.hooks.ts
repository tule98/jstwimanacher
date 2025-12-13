/**
 * Profile React Query Hooks
 * Hooks for user profile data queries
 */

import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { wordmasterDb } from "@/services/wordmaster";
import type { UserProfile } from "@/services/wordmaster/types";

const PROFILE_QUERY_KEYS = {
  all: ["profile"],
  detail: (userId: string) => ["profile", userId],
};

/**
 * Get current user profile (uses authenticated user from session)
 */
export function useGetUserProfile() {
  const getProfile = useCallback(async () => {
    try {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user?.id) return null;

      // Use wordmasterDb which handles client/server context
      return wordmasterDb.getUserProfile(user.id);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }
  }, []);

  return useQuery<UserProfile | null>({
    queryKey: PROFILE_QUERY_KEYS.all,
    queryFn: getProfile,
  });
}
