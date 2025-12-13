/**
 * Authentication Utility Functions
 * Helpers for common auth operations with Supabase
 */

import { createBrowserClient } from "@/lib/supabase/client";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Sign out the current user (client-side)
 * Redirects to sign-in page after sign out
 */
export async function signOut() {
  const supabase = createBrowserClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Sign out error:", error);
    throw error;
  }

  // Redirect to sign-in page
  window.location.href = "/sign-in";
}

/**
 * Get the current user session (client-side)
 * Returns user object or null if not authenticated
 */
export async function getCurrentUser() {
  const supabase = createBrowserClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Get session error:", error);
    return null;
  }

  return session?.user ?? null;
}

/**
 * Get the current user session (server-side)
 * Use in Server Components and API Routes
 */
export async function getCurrentUserServer() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Get user error:", error);
    return null;
  }

  return user;
}

/**
 * Check if user is authenticated (client-side)
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isAuthenticatedServer() {
  const user = await getCurrentUserServer();
  return user !== null;
}
