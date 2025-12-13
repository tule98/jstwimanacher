-- Migration: Add is_default flag to todo_categories
-- Up
ALTER TABLE todo_categories ADD COLUMN is_default INTEGER NOT NULL DEFAULT 0;

-- Ensure all existing categories are non-default; you'll set one manually later
UPDATE todo_categories SET is_default = 0;

-- Down
-- Note: SQLite does not support dropping columns directly; to rollback, you would need
-- to recreate the table without the column and copy data back.
