-- Add frequency and archiving fields to habits table
ALTER TABLE habits ADD COLUMN frequency_type TEXT NOT NULL DEFAULT 'daily'; -- 'daily' or 'custom'
ALTER TABLE habits ADD COLUMN frequency_days TEXT; -- JSON array of day numbers [0-6] for custom frequency (0=Sunday)
-- ALTER TABLE habits ADD COLUMN start_date TEXT NOT NULL DEFAULT (date('now')); -- YYYY-MM-DD format
ALTER TABLE habits ADD COLUMN start_date TEXT NOT NULL DEFAULT '2023-01-01'; -- YYYY-MM-DD format
ALTER TABLE habits ADD COLUMN is_archived INTEGER NOT NULL DEFAULT 0; -- boolean flag

-- Create habit completions table for tracking check-offs with mood
CREATE TABLE IF NOT EXISTS habit_completions (
  id TEXT PRIMARY KEY NOT NULL,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  completion_date TEXT NOT NULL, -- YYYY-MM-DD
  mood_emoji TEXT, -- Optional emoji selected by user
  completed_at DATETIME NOT NULL DEFAULT (datetime('now')),
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE(habit_id, completion_date) -- One completion per habit per day
);

-- Create streak freeze tokens table
CREATE TABLE IF NOT EXISTS streak_freeze_tokens (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL DEFAULT 'default_user', -- For future multi-user support
  total_tokens INTEGER NOT NULL DEFAULT 2, -- Monthly allocation
  used_tokens INTEGER NOT NULL DEFAULT 0,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT (datetime('now')),
  updated_at DATETIME NOT NULL DEFAULT (datetime('now')),
  UNIQUE(user_id, month, year) -- One record per user per month
);

-- Create token usage log table
CREATE TABLE IF NOT EXISTS token_usage_log (
  id TEXT PRIMARY KEY NOT NULL,
  habit_id TEXT NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  freeze_date TEXT NOT NULL, -- YYYY-MM-DD - the date being protected
  used_at DATETIME NOT NULL DEFAULT (datetime('now')),
  token_record_id TEXT NOT NULL REFERENCES streak_freeze_tokens(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_date ON habit_completions(habit_id, completion_date);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_token_usage_habit ON token_usage_log(habit_id);
CREATE INDEX IF NOT EXISTS idx_token_usage_date ON token_usage_log(freeze_date);
CREATE INDEX IF NOT EXISTS idx_habits_archived ON habits(is_archived);

-- Update existing habits status field comment for clarity
-- status can be: 'active' | 'inactive' (inactive is for temporarily paused habits)
-- is_archived handles permanent archiving
