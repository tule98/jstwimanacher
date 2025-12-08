-- Migration: Add todos table
-- Up
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_completed',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);

-- Down
-- DROP INDEX IF EXISTS idx_todos_status;
-- DROP INDEX IF EXISTS idx_todos_due_date;
-- DROP TABLE IF EXISTS todos;
