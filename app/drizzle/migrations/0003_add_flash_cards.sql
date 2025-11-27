-- Create flash_cards table
CREATE TABLE IF NOT EXISTS flash_cards (
  id TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  phonetic TEXT,
  meaning TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_learned',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
