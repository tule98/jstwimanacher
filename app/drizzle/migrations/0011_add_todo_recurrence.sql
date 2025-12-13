-- Migration: Add recurrence fields to todos table
-- Up
ALTER TABLE todos ADD COLUMN category_id TEXT REFERENCES todo_categories(id);
ALTER TABLE todos ADD COLUMN recurrence_type TEXT NOT NULL DEFAULT 'none';
ALTER TABLE todos ADD COLUMN recurrence_days TEXT;

-- Down
-- ALTER TABLE todos DROP COLUMN category_id;
-- ALTER TABLE todos DROP COLUMN recurrence_type;
-- ALTER TABLE todos DROP COLUMN recurrence_days;
