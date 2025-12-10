/**
 * Centralized routing paths for the application
 * Organized by modules for easy navigation and refactoring
 */

// ============================================================================
// Home & Dashboard
// ============================================================================
export const HOME = "/";

// ============================================================================
// Habits Module
// ============================================================================
export const HABITS = {
  ROOT: "/habits",
  SETTINGS: "/habits/settings",
  STATS: "/habits/stats",
  MAIN: "/habits/main",
} as const;

// ============================================================================
// Flash Cards Module
// ============================================================================
export const FLASH_CARDS = {
  ROOT: "/flash-cards",
} as const;

// ============================================================================
// Stories Module
// ============================================================================
export const STORIES = {
  ROOT: "/stories",
  NEW: "/stories/new",
  DETAIL: (id: string) => `/stories/${id}`,
  WORDS: "/stories/words",
} as const;

// ============================================================================
// Transactions Module
// ============================================================================
export const TRANSACTIONS = {
  ROOT: "/transactions",
} as const;

// ============================================================================
// Buckets Module
// ============================================================================
export const BUCKETS = {
  ROOT: "/buckets",
} as const;

// ============================================================================
// Categories Module
// ============================================================================
export const CATEGORIES = {
  ROOT: "/categories",
} as const;

// ============================================================================
// Todos Module
// ============================================================================
export const TODOS = {
  ROOT: "/todos",
} as const;

// ============================================================================
// Stats Module
// ============================================================================
export const STATS = {
  ROOT: "/stats",
} as const;

// ============================================================================
// Config Module
// ============================================================================
export const CONFIG = {
  ROOT: "/config",
} as const;

// ============================================================================
// Conversions Module
// ============================================================================
export const CONVERSIONS = {
  ROOT: "/conversions",
} as const;

// ============================================================================
// Noxon Module
// ============================================================================
export const NOXON = {
  ROOT: "/noxon",
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get all available paths
 */
export const getAllPaths = () => ({
  HOME,
  HABITS,
  FLASH_CARDS,
  STORIES,
  TRANSACTIONS,
  BUCKETS,
  CATEGORIES,
  TODOS,
  STATS,
  CONFIG,
  CONVERSIONS,
  NOXON,
});

/**
 * Type for all valid paths in the app
 */
export type AppPath =
  | typeof HOME
  | (typeof HABITS)[keyof typeof HABITS]
  | (typeof FLASH_CARDS)[keyof typeof FLASH_CARDS]
  | (typeof STORIES)[keyof typeof STORIES]
  | (typeof TRANSACTIONS)[keyof typeof TRANSACTIONS]
  | (typeof BUCKETS)[keyof typeof BUCKETS]
  | (typeof CATEGORIES)[keyof typeof CATEGORIES]
  | (typeof TODOS)[keyof typeof TODOS]
  | (typeof STATS)[keyof typeof STATS]
  | (typeof CONFIG)[keyof typeof CONFIG]
  | (typeof CONVERSIONS)[keyof typeof CONVERSIONS]
  | (typeof NOXON)[keyof typeof NOXON];
