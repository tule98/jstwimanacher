-- Migration: Add habit_journal_entries table
-- Up
CREATE TABLE IF NOT EXISTS habit_journal_entries (
  id TEXT PRIMARY KEY NOT NULL,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  content TEXT NOT NULL,
  entry_date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_habit_journal_entries_habit_id ON habit_journal_entries(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_journal_entries_entry_date ON habit_journal_entries(entry_date);

-- Down
-- DROP INDEX IF EXISTS idx_habit_journal_entries_entry_date;
-- DROP INDEX IF EXISTS idx_habit_journal_entries_habit_id;
-- DROP TABLE IF EXISTS habit_journal_entries;
