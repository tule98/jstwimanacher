/**
 * Wordmaster Flashcard App - TypeScript Type Definitions
 * These types mirror the Supabase PostgreSQL schema
 */

// ============= USER PROFILES =============
export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileInput {
  display_name?: string;
  timezone?: string;
}

// ============= WORDS =============
export type DifficultyLevel = "easy" | "medium" | "hard" | "very_hard";
export type PartOfSpeech =
  | "noun"
  | "verb"
  | "adjective"
  | "adverb"
  | "phrase"
  | "other";

export interface Word {
  id: string;
  word_text: string;
  word_text_lower: string;
  phonetic: string | null;
  definition: string;
  part_of_speech: PartOfSpeech | null;
  example_sentence: string | null;
  word_length: number;
  difficulty_level: DifficultyLevel;
  language: string;
  created_at: string;
  usage_count: number;
}

export interface CreateWordInput {
  word_text: string;
  phonetic?: string;
  definition: string;
  part_of_speech?: PartOfSpeech;
  example_sentence?: string;
  word_length: number;
  difficulty_level: DifficultyLevel;
  language?: string;
}

// ============= USER_WORDS =============
export interface UserWord {
  id: string;
  user_id: string;
  word_id: string;
  memory_level: number; // 0-100
  first_added_at: string;
  last_reviewed_at: string | null;
  last_memory_update_at: string;
  times_reviewed: number;
  times_marked_known: number;
  times_marked_review: number;
  is_quick_learner: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserWordWithWord extends UserWord {
  word: Word;
}

export interface CreateUserWordInput {
  word_id: string;
  memory_level?: number;
  is_quick_learner?: boolean;
}

// ============= REVIEW_HISTORY =============
export type ActionType =
  | "marked_known"
  | "marked_review"
  | "viewed"
  | "skipped";

export interface ReviewHistory {
  id: string;
  user_id: string;
  word_id: string;
  user_word_id: string;
  action_type: ActionType;
  memory_before: number;
  memory_after: number;
  memory_change: number;
  session_id: string | null;
  reviewed_at: string;
}

export interface CreateReviewHistoryInput {
  word_id: string;
  user_word_id: string;
  action_type: ActionType;
  memory_before: number;
  memory_after: number;
  memory_change: number;
  session_id?: string;
}

// ============= USER_SETTINGS =============
export type ThemeMode = "light" | "dark" | "auto";
export type FontSizeMode = "small" | "medium" | "large";

export interface UserSettings {
  id: string;
  user_id: string;
  daily_decay_rate: number; // -3 to 0
  daily_review_goal: number;
  quick_learning_enabled: boolean;
  auto_archive_mastered: boolean;
  show_phonetics: boolean;
  show_difficulty_badge: boolean;
  auto_flip_cards: number; // seconds, 0 = manual
  theme: ThemeMode;
  font_size: FontSizeMode;
  minimum_word_length: number;
  maximum_word_length: number;
  include_phrases: boolean;
  notification_daily_reminder: boolean;
  notification_reminder_time: string; // HH:MM:SS format
  notification_critical_words: boolean;
  notification_milestones: boolean;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserSettingsInput {
  daily_decay_rate?: number;
  daily_review_goal?: number;
  quick_learning_enabled?: boolean;
  auto_archive_mastered?: boolean;
  show_phonetics?: boolean;
  show_difficulty_badge?: boolean;
  auto_flip_cards?: number;
  theme?: ThemeMode;
  font_size?: FontSizeMode;
  minimum_word_length?: number;
  maximum_word_length?: number;
  include_phrases?: boolean;
  notification_daily_reminder?: boolean;
  notification_reminder_time?: string;
  notification_critical_words?: boolean;
  notification_milestones?: boolean;
}

// ============= DAILY_STATS =============
export interface DailyStats {
  id: string;
  user_id: string;
  stat_date: string; // YYYY-MM-DD format
  words_reviewed: number;
  words_marked_known: number;
  words_marked_review: number;
  memory_points_gained: number;
  memory_points_lost: number;
  words_mastered: number;
  words_added: number;
  critical_words_count: number;
  average_memory_level: number | null;
  total_vocabulary: number;
  streak_days: number;
  daily_goal_achieved: boolean;
  created_at: string;
}

// ============= FEED & ALGORITHM TYPES =============
export interface FeedWord {
  userWord: UserWord;
  word: Word;
  priorityScore: number;
}

export interface FeedResponse {
  words: FeedWord[];
  total: number;
  hasMore: boolean;
  page: number;
}

export type MemoryLevelFilter =
  | "all"
  | "critical"
  | "learning"
  | "reviewing"
  | "well_known";
export type SortOption =
  | "priority"
  | "memory_level"
  | "word_length"
  | "recently_added"
  | "alphabetical";

export interface FeedQuery {
  page?: number;
  limit?: number;
  memoryLevelFilter?: MemoryLevelFilter;
  difficultyFilter?: DifficultyLevel | "all";
  partOfSpeechFilter?: PartOfSpeech | "all";
  sortBy?: SortOption;
}

// ============= CONTENT EXTRACTION =============
export type ContentInputType = "song" | "paragraph" | "topic" | "manual";

export interface ExtractedWord {
  word_text: string;
  phonetic?: string;
  definition: string;
  part_of_speech?: PartOfSpeech;
  example_sentence?: string;
  word_length: number;
  difficulty_level: DifficultyLevel;
  source_content?: string;
}

export interface ExtractionPreview {
  words: ExtractedWord[];
  totalCount: number;
  difficultyBreakdown: {
    easy: number;
    medium: number;
    hard: number;
    very_hard: number;
  };
  duplicates: number; // Already in user's vocabulary
}

export interface ExtractWordsRequest {
  content: string;
  inputType: ContentInputType;
  minWordLength?: number;
  maxWordLength?: number;
  includePhrases?: boolean;
}

// ============= MEMORY UPDATE RESPONSE =============
export interface MemoryUpdateResponse {
  userWordId: string;
  previousMemory: number;
  newMemory: number;
  changeAmount: number;
  reason: string; // e.g., "marked_known", "quick_learning_bonus", "decay"
  isQuickLearner?: boolean;
  isMastered?: boolean;
}

// ============= STATISTICS TYPES =============
export interface VocabularyStats {
  totalVocabulary: number;
  masteredWords: number;
  activeLearning: number;
  criticalWords: number;
  averageMemoryLevel: number;
}

export interface TodayActivity {
  wordsReviewedToday: number;
  memoryPointsGainedToday: number;
  dailyGoalProgress: number;
  currentStreak: number;
}

export interface MemoryHealthDistribution {
  critical: number; // 0-20
  learning: number; // 21-50
  reviewing: number; // 51-80
  wellKnown: number; // 81-99
  mastered: number; // 100
}

export interface ProgressTrendPoint {
  date: string;
  averageMemory?: number;
  wordsReviewedCount?: number;
  newWordsAdded?: number;
  wordsMastered?: number;
}

// ============= ERROR TYPES =============
export interface WordmasterError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class WordmasterAPIError extends Error implements WordmasterError {
  code: string;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = "WordmasterAPIError";
  }
}
