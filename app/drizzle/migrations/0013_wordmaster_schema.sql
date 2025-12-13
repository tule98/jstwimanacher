-- Wordmaster Flashcard App - Database Schema
-- This migration creates all tables for the Wordmaster module

-- 1. USER PROFILES (Optional extended user data)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name VARCHAR(100),
  timezone VARCHAR(50) DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. WORDS (Master vocabulary table)
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_text VARCHAR(100) UNIQUE NOT NULL,
  word_text_lower VARCHAR(100) NOT NULL,
  phonetic VARCHAR(200),
  definition TEXT NOT NULL,
  part_of_speech VARCHAR(20),
  example_sentence TEXT,
  word_length INTEGER NOT NULL,
  difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard')),
  language VARCHAR(10) DEFAULT 'en',
  created_at TIMESTAMP DEFAULT NOW(),
  usage_count INTEGER DEFAULT 0,
  CHECK (word_length > 0)
);

-- Create indexes for words table
CREATE INDEX idx_words_lower ON words(word_text_lower);
CREATE INDEX idx_words_difficulty ON words(difficulty_level);
CREATE INDEX idx_words_length ON words(word_length);

-- 3. USER_WORDS (Junction table with memory tracking)
CREATE TABLE IF NOT EXISTS user_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  memory_level INTEGER DEFAULT 0 NOT NULL,
  first_added_at TIMESTAMP DEFAULT NOW(),
  last_reviewed_at TIMESTAMP,
  last_memory_update_at TIMESTAMP DEFAULT NOW(),
  times_reviewed INTEGER DEFAULT 0,
  times_marked_known INTEGER DEFAULT 0,
  times_marked_review INTEGER DEFAULT 0,
  is_quick_learner BOOLEAN DEFAULT FALSE,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, word_id),
  CHECK (memory_level >= 0 AND memory_level <= 100),
  CHECK (times_reviewed >= 0),
  CHECK (times_marked_known >= 0),
  CHECK (times_marked_review >= 0)
);

-- Create indexes for user_words table
CREATE INDEX idx_user_words_user ON user_words(user_id);
CREATE INDEX idx_user_words_word ON user_words(word_id);
CREATE INDEX idx_user_words_memory ON user_words(memory_level);
CREATE INDEX idx_user_words_reviewed ON user_words(last_reviewed_at);
CREATE INDEX idx_user_words_feed ON user_words(user_id, memory_level, is_archived);

-- 4. REVIEW_HISTORY (Track every interaction)
CREATE TABLE IF NOT EXISTS review_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word_id UUID NOT NULL REFERENCES words(id) ON DELETE CASCADE,
  user_word_id UUID NOT NULL REFERENCES user_words(id) ON DELETE CASCADE,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('marked_known', 'marked_review', 'viewed', 'skipped')),
  memory_before INTEGER NOT NULL,
  memory_after INTEGER NOT NULL,
  memory_change INTEGER NOT NULL,
  session_id UUID,
  reviewed_at TIMESTAMP DEFAULT NOW(),
  CHECK (memory_before >= 0 AND memory_before <= 100),
  CHECK (memory_after >= 0 AND memory_after <= 100)
);

-- Create indexes for review_history table
CREATE INDEX idx_review_user ON review_history(user_id);
CREATE INDEX idx_review_word ON review_history(word_id);
CREATE INDEX idx_review_user_word ON review_history(user_word_id);
CREATE INDEX idx_review_date ON review_history(reviewed_at);
CREATE INDEX idx_review_session ON review_history(session_id);
CREATE INDEX idx_review_timeline ON review_history(user_id, reviewed_at DESC);

-- 5. USER_SETTINGS (User preferences)
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  daily_decay_rate INTEGER DEFAULT -1 CHECK (daily_decay_rate >= -3 AND daily_decay_rate <= 0),
  daily_review_goal INTEGER DEFAULT 30 CHECK (daily_review_goal > 0 AND daily_review_goal <= 500),
  quick_learning_enabled BOOLEAN DEFAULT TRUE,
  auto_archive_mastered BOOLEAN DEFAULT TRUE,
  show_phonetics BOOLEAN DEFAULT TRUE,
  show_difficulty_badge BOOLEAN DEFAULT TRUE,
  auto_flip_cards INTEGER DEFAULT 0 CHECK (auto_flip_cards >= 0 AND auto_flip_cards <= 30),
  theme VARCHAR(20) DEFAULT 'auto' CHECK (theme IN ('light', 'dark', 'auto')),
  font_size VARCHAR(20) DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
  minimum_word_length INTEGER DEFAULT 3 CHECK (minimum_word_length >= 1 AND minimum_word_length <= 10),
  maximum_word_length INTEGER DEFAULT 15 CHECK (maximum_word_length >= 3 AND maximum_word_length <= 50),
  include_phrases BOOLEAN DEFAULT TRUE,
  notification_daily_reminder BOOLEAN DEFAULT TRUE,
  notification_reminder_time TIME DEFAULT '09:00:00',
  notification_critical_words BOOLEAN DEFAULT TRUE,
  notification_milestones BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. DAILY_STATS (Aggregated daily statistics)
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stat_date DATE NOT NULL,
  words_reviewed INTEGER DEFAULT 0,
  words_marked_known INTEGER DEFAULT 0,
  words_marked_review INTEGER DEFAULT 0,
  memory_points_gained INTEGER DEFAULT 0,
  memory_points_lost INTEGER DEFAULT 0,
  words_mastered INTEGER DEFAULT 0,
  words_added INTEGER DEFAULT 0,
  critical_words_count INTEGER DEFAULT 0,
  average_memory_level DECIMAL(5,2),
  total_vocabulary INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  daily_goal_achieved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, stat_date)
);

-- Create indexes for daily_stats table
CREATE INDEX idx_stats_user ON daily_stats(user_id);
CREATE INDEX idx_stats_date ON daily_stats(stat_date);
CREATE INDEX idx_stats_timeline ON daily_stats(user_id, stat_date DESC);

-- 7. TRIGGERS FOR AUTO-UPDATING TIMESTAMPS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to user_profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_words
DROP TRIGGER IF EXISTS update_user_words_updated_at ON user_words;
CREATE TRIGGER update_user_words_updated_at
  BEFORE UPDATE ON user_words
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Apply trigger to user_settings
DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. AUTO-INCREMENT WORD USAGE COUNT
CREATE OR REPLACE FUNCTION increment_word_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE words
  SET usage_count = usage_count + 1
  WHERE id = NEW.word_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS increment_usage_on_new_user_word ON user_words;
CREATE TRIGGER increment_usage_on_new_user_word
  AFTER INSERT ON user_words
  FOR EACH ROW
  EXECUTE FUNCTION increment_word_usage();

-- 9. PRIORITY SCORE CALCULATION FUNCTION
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_memory_level INTEGER,
  p_word_length INTEGER
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  urgency_multiplier DECIMAL(3,1);
  length_factor DECIMAL(3,1);
BEGIN
  -- Calculate urgency multiplier based on memory level
  urgency_multiplier := CASE
    WHEN p_memory_level < 20 THEN 3.0
    WHEN p_memory_level BETWEEN 20 AND 50 THEN 1.5
    WHEN p_memory_level BETWEEN 51 AND 80 THEN 1.0
    ELSE 0.3
  END;

  -- Calculate length factor based on word length/difficulty
  length_factor := CASE
    WHEN p_word_length <= 4 THEN 0.8
    WHEN p_word_length BETWEEN 5 AND 7 THEN 1.0
    WHEN p_word_length BETWEEN 8 AND 10 THEN 1.2
    ELSE 1.5
  END;

  -- Return priority score
  RETURN (100 - p_memory_level) * urgency_multiplier * length_factor;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;

-- RLS Policy: user_profiles - Users can only access their own profile
DROP POLICY IF EXISTS user_profiles_policy ON user_profiles;
CREATE POLICY user_profiles_policy ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: user_words - Users can only access their own words
DROP POLICY IF EXISTS user_words_policy ON user_words;
CREATE POLICY user_words_policy ON user_words
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: review_history - Users can only access their own reviews
DROP POLICY IF EXISTS review_history_policy ON review_history;
CREATE POLICY review_history_policy ON review_history
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: user_settings - Users can only access their own settings
DROP POLICY IF EXISTS user_settings_policy ON user_settings;
CREATE POLICY user_settings_policy ON user_settings
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: daily_stats - Users can only access their own stats
DROP POLICY IF EXISTS daily_stats_policy ON daily_stats;
CREATE POLICY daily_stats_policy ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policy: words - All authenticated users can read words
DROP POLICY IF EXISTS words_read_policy ON words;
CREATE POLICY words_read_policy ON words
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policy: words - Only authenticated users can insert words
DROP POLICY IF EXISTS words_insert_policy ON words;
CREATE POLICY words_insert_policy ON words
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
