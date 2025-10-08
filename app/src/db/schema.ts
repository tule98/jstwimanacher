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
