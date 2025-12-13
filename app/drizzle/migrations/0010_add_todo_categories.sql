-- Migration: Add todo_categories table
-- Up
CREATE TABLE IF NOT EXISTS todo_categories (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Seed predefined categories
INSERT INTO todo_categories (id, name, color) VALUES
  ('cat_work', 'Work', '#4158D0'),
  ('cat_personal', 'Personal', '#FFB01D'),
  ('cat_health', 'Health', '#10B981'),
  ('cat_shopping', 'Shopping', '#FFB8D1'),
  ('cat_other', 'Other', '#6B7280');

-- Down
-- DELETE FROM todo_categories;
-- DROP TABLE IF EXISTS todo_categories;
