import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

// Categories table
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  type: text("type").notNull().default("expense"), // 'expense' hoặc 'income'
});

// Transactions table
export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  amount: integer("amount").notNull(), // Lưu số nguyên (VND để tránh floating point)
  category_id: text("category_id")
    .notNull()
    .references(() => categories.id),
  // Optional bucket association
  bucket_id: text("bucket_id").references(() => buckets.id),
  note: text("note"),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
  is_resolved: integer("is_resolved", { mode: "boolean" })
    .notNull()
    .default(true),
  is_virtual: integer("is_virtual", { mode: "boolean" })
    .notNull()
    .default(false), // Đánh dấu giao dịch ảo
});

// Buckets table
export const buckets = sqliteTable("buckets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  is_default: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Assets table
export const assets = sqliteTable("assets", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  unit: text("unit").notNull().default("đơn vị"), // Đơn vị của tài sản (đồng, cổ, gram, lượng, ...)
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Asset Conversions table
export const assetConversions = sqliteTable("asset_conversions", {
  id: text("id").primaryKey(),
  asset_id: text("asset_id")
    .notNull()
    .references(() => assets.id, { onDelete: "cascade" }),
  transaction_id: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  conversion_type: text("conversion_type").notNull(), // 'buy' hoặc 'sell'
  quantity: integer("quantity").notNull(), // Số lượng tài sản chuyển đổi
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// LearningWord table
export const learningWords = sqliteTable("learning_words", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  phonetic: text("phonetic"),
  meaning: text("meaning").notNull(),
  added_at: text("added_at")
    .notNull()
    .default(sql`datetime('now')`),
  study_dates: text("study_dates"), // JSON array of ISO date strings
  is_mastered: integer("is_mastered", { mode: "boolean" })
    .notNull()
    .default(false),
});

// StorySession table
export const storySessions = sqliteTable("story_sessions", {
  id: text("id").primaryKey(),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  words: text("words").notNull(), // JSON array of LearningWord ids
  story_text: text("story_text").notNull(),
  submitted_at: text("submitted_at"),
  status: text("status").notNull().default("draft"), // 'draft' | 'submitted'
});

// Habits table
export const habits = sqliteTable("habits", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"), // 'active' | 'inactive'
  frequency_type: text("frequency_type").notNull().default("daily"), // 'daily' | 'custom'
  frequency_days: text("frequency_days"), // JSON array of day numbers [0-6] for custom (0=Sunday)
  start_date: text("start_date")
    .notNull()
    .default(sql`date('now')`), // YYYY-MM-DD
  is_archived: integer("is_archived", { mode: "boolean" })
    .notNull()
    .default(false),
  order: integer("order").notNull().default(0), // For drag-to-reorder functionality
  current_streak: integer("current_streak").notNull().default(0), // Current streak count
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Habit Journal Entries table
export const habitJournalEntries = sqliteTable("habit_journal_entries", {
  id: text("id").primaryKey(),
  habit_id: text("habit_id")
    .notNull()
    .references(() => habits.id),
  content: text("content").notNull(), // HTML content with mentions
  entry_date: text("entry_date").notNull(), // YYYY-MM-DD
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Transaction Buckets table - Many-to-many relationship
export const transactionBuckets = sqliteTable("transaction_buckets", {
  id: text("id").primaryKey(),
  transaction_id: text("transaction_id")
    .notNull()
    .references(() => transactions.id, { onDelete: "cascade" }),
  bucket_id: text("bucket_id")
    .notNull()
    .references(() => buckets.id, { onDelete: "cascade" }),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Flash Cards table
export const flashCards = sqliteTable("flash_cards", {
  id: text("id").primaryKey(),
  word: text("word").notNull(),
  phonetic: text("phonetic"),
  meaning: text("meaning").notNull(),
  example: text("example"),
  status: text("status").notNull().default("not_learned"), // 'not_learned' | 'learning' | 'learned' | 'mastered'
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
}); // Todo Categories table
export const todoCategories = sqliteTable("todo_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  is_default: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// To-dos table
export const todos = sqliteTable("todos", {
  id: text("id").primaryKey(),
  description: text("description").notNull(),
  due_date: text("due_date").notNull(), // ISO datetime string
  status: text("status", { enum: ["completed", "not_completed"] })
    .notNull()
    .default("not_completed"),
  category_id: text("category_id").references(() => todoCategories.id),
  recurrence_type: text("recurrence_type", {
    enum: ["none", "daily", "weekly", "specific_days"],
  })
    .notNull()
    .default("none"),
  recurrence_days: text("recurrence_days"), // JSON array of day numbers [0-6] for specific_days (0=Sunday)
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Habit Completions table
export const habitCompletions = sqliteTable("habit_completions", {
  id: text("id").primaryKey(),
  habit_id: text("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  completion_date: text("completion_date").notNull(), // YYYY-MM-DD
  mood_emoji: text("mood_emoji"), // Optional emoji
  completed_at: text("completed_at")
    .notNull()
    .default(sql`datetime('now')`),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Streak Freeze Tokens table
export const streakFreezeTokens = sqliteTable("streak_freeze_tokens", {
  id: text("id").primaryKey(),
  user_id: text("user_id").notNull().default("default_user"),
  total_tokens: integer("total_tokens").notNull().default(2),
  used_tokens: integer("used_tokens").notNull().default(0),
  month: integer("month").notNull(), // 1-12
  year: integer("year").notNull(),
  created_at: text("created_at")
    .notNull()
    .default(sql`datetime('now')`),
  updated_at: text("updated_at")
    .notNull()
    .default(sql`datetime('now')`),
});

// Token Usage Log table
export const tokenUsageLog = sqliteTable("token_usage_log", {
  id: text("id").primaryKey(),
  habit_id: text("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  freeze_date: text("freeze_date").notNull(), // YYYY-MM-DD
  used_at: text("used_at")
    .notNull()
    .default(sql`datetime('now')`),
  token_record_id: text("token_record_id")
    .notNull()
    .references(() => streakFreezeTokens.id),
});

// Types cho TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetConversion = typeof assetConversions.$inferSelect;
export type NewAssetConversion = typeof assetConversions.$inferInsert;
export type LearningWord = typeof learningWords.$inferSelect;
export type NewLearningWord = typeof learningWords.$inferInsert;
export type StorySession = typeof storySessions.$inferSelect;
export type NewStorySession = typeof storySessions.$inferInsert;
export type Bucket = typeof buckets.$inferSelect;
export type NewBucket = typeof buckets.$inferInsert;
export type TransactionBucket = typeof transactionBuckets.$inferSelect;
export type NewTransactionBucket = typeof transactionBuckets.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitJournalEntry = typeof habitJournalEntries.$inferSelect;
export type NewHabitJournalEntry = typeof habitJournalEntries.$inferInsert;
export type FlashCard = typeof flashCards.$inferSelect;
export type NewFlashCard = typeof flashCards.$inferInsert;
export type TodoCategory = typeof todoCategories.$inferSelect;
export type NewTodoCategory = typeof todoCategories.$inferInsert;
export type Todo = typeof todos.$inferSelect;
export type NewTodo = typeof todos.$inferInsert;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;
export type StreakFreezeToken = typeof streakFreezeTokens.$inferSelect;
export type NewStreakFreezeToken = typeof streakFreezeTokens.$inferInsert;
export type TokenUsageLog = typeof tokenUsageLog.$inferSelect;
export type NewTokenUsageLog = typeof tokenUsageLog.$inferInsert;
