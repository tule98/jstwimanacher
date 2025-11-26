-- Migration: Add habits and habit_logs tables
-- Up
CREATE TABLE IF NOT EXISTS habits (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id TEXT PRIMARY KEY NOT NULL,
  habit_id TEXT NOT NULL REFERENCES habits(id),
  date TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);

-- Down
-- DROP INDEX IF EXISTS idx_habit_logs_date;
-- DROP INDEX IF EXISTS idx_habit_logs_habit_id;
-- DROP TABLE IF EXISTS habit_logs;
-- DROP TABLE IF EXISTS habits;