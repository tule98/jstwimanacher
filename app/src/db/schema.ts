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

// Types cho TypeScript
export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
