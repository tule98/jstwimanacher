-- Migration: Add memory decay tracking and daily statistics
-- Description: Add columns for tracking memory decay system

-- Add columns to user_words table for decay tracking
ALTER TABLE user_words
ADD COLUMN IF NOT EXISTS last_memory_update_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS memory_decay_paused BOOLEAN DEFAULT FALSE;

-- Create daily_stats table for aggregated daily metrics
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Learning metrics
  words_learned INT DEFAULT 0,
  words_reviewed INT DEFAULT 0,
  review_streak INT DEFAULT 0,
  
  -- Decay metrics
  words_decayed INT DEFAULT 0,
  total_memory_loss DECIMAL(5, 2) DEFAULT 0,
  
  -- Performance metrics
  avg_memory_change DECIMAL(5, 2),
  total_study_time_minutes INT DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_daily_stats_user_date ON daily_stats(user_id, date DESC);

-- Create memory_decay_history table for detailed tracking
CREATE TABLE IF NOT EXISTS memory_decay_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  word_id UUID NOT NULL,
  user_word_id UUID,
  
  memory_before DECIMAL(5, 2) NOT NULL,
  memory_after DECIMAL(5, 2) NOT NULL,
  decay_amount DECIMAL(5, 2) NOT NULL,
  
  days_since_review INT,
  decay_rate_applied DECIMAL(5, 2) NOT NULL DEFAULT 5.0,
  
  decayed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE,
  FOREIGN KEY (user_word_id) REFERENCES user_words(id) ON DELETE SET NULL
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_memory_decay_user ON memory_decay_history(user_id, decayed_at DESC);
CREATE INDEX IF NOT EXISTS idx_memory_decay_word ON memory_decay_history(word_id);

-- Enable RLS for daily_stats
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Users can only see their own stats
CREATE POLICY "Users can view their own stats"
  ON daily_stats
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert stats
CREATE POLICY "Service role can manage stats"
  ON daily_stats
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Enable RLS for memory_decay_history
ALTER TABLE memory_decay_history ENABLE ROW LEVEL SECURITY;

-- Users can view their own decay history
CREATE POLICY "Users can view their own decay history"
  ON memory_decay_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert decay records
CREATE POLICY "Service role can record decay"
  ON memory_decay_history
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
