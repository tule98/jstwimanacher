# Flashcard App - Database Design Document (Updated)

## Overview

This document outlines the complete database schema for the vocabulary learning flashcard application using Supabase (PostgreSQL). The design leverages Supabase's built-in authentication system and supports memory-based learning, content extraction, and progress tracking.

---

## Important Notes

### Supabase Auth Integration

This design uses **Supabase's built-in `auth.users` table** for user authentication. We do NOT create a separate `users` table. Instead, we reference `auth.uid()` directly in our application tables.

**Key Points:**

- User authentication is handled entirely by Supabase Auth
- The `auth.users` table contains: `id`, `email`, `created_at`, `updated_at`, and other auth-related fields
- All user-specific tables use `user_id UUID` that references `auth.uid()`
- Row Level Security (RLS) policies use `auth.uid()` for access control

---

## Database Tables

### 1. user_profiles (Optional Extended User Data)

Stores additional user preferences and display information beyond what Supabase Auth provides.

| Column       | Type         | Constraints                                 | Description                |
| ------------ | ------------ | ------------------------------------------- | -------------------------- |
| id           | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4()     | Unique profile identifier  |
| user_id      | UUID         | REFERENCES auth.users(id), UNIQUE, NOT NULL | Reference to auth user     |
| display_name | VARCHAR(100) | NULL                                        | User's display name        |
| timezone     | VARCHAR(50)  | DEFAULT 'UTC'                               | User's timezone            |
| created_at   | TIMESTAMP    | DEFAULT NOW()                               | Profile creation timestamp |
| updated_at   | TIMESTAMP    | DEFAULT NOW()                               | Last profile update        |

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `user_id`

**Foreign Keys:**

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

---

### 2. words

Master vocabulary table storing all unique words/phrases.

| Column           | Type         | Constraints                             | Description                           |
| ---------------- | ------------ | --------------------------------------- | ------------------------------------- |
| id               | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique word identifier                |
| word_text        | VARCHAR(100) | UNIQUE, NOT NULL                        | The actual word or phrase             |
| word_text_lower  | VARCHAR(100) | NOT NULL                                | Lowercase version for searching       |
| phonetic         | VARCHAR(200) | NULL                                    | IPA phonetic transcription            |
| definition       | TEXT         | NOT NULL                                | Primary meaning/definition            |
| part_of_speech   | VARCHAR(20)  | NULL                                    | Noun, Verb, Adjective, etc.           |
| example_sentence | TEXT         | NULL                                    | Contextual example usage              |
| word_length      | INTEGER      | NOT NULL                                | Character count of word               |
| difficulty_level | VARCHAR(20)  | NOT NULL                                | easy, medium, hard, very_hard         |
| language         | VARCHAR(10)  | DEFAULT 'en'                            | Language code (English default)       |
| created_at       | TIMESTAMP    | DEFAULT NOW()                           | When word was first added to system   |
| usage_count      | INTEGER      | DEFAULT 0                               | How many users are learning this word |

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `word_text`
- INDEX on `word_text_lower` (for case-insensitive search)
- INDEX on `difficulty_level`
- INDEX on `word_length`

**Check Constraints:**

```sql
CHECK (difficulty_level IN ('easy', 'medium', 'hard', 'very_hard'))
CHECK (word_length > 0)
CHECK (part_of_speech IN ('noun', 'verb', 'adjective', 'adverb', 'phrase', 'other'))
```

---

### 3. user_words

Junction table linking users to words with memory tracking.

| Column                | Type      | Constraints                             | Description                         |
| --------------------- | --------- | --------------------------------------- | ----------------------------------- |
| id                    | UUID      | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique record identifier            |
| user_id               | UUID      | REFERENCES auth.users(id), NOT NULL     | Reference to auth user              |
| word_id               | UUID      | FOREIGN KEY → words(id), NOT NULL       | Reference to word                   |
| memory_level          | INTEGER   | DEFAULT 0, NOT NULL                     | Current memory strength (0-100)     |
| first_added_at        | TIMESTAMP | DEFAULT NOW()                           | When user first added this word     |
| last_reviewed_at      | TIMESTAMP | NULL                                    | Last time user interacted with word |
| last_memory_update_at | TIMESTAMP | DEFAULT NOW()                           | Last time memory level changed      |
| times_reviewed        | INTEGER   | DEFAULT 0                               | Total review count                  |
| times_marked_known    | INTEGER   | DEFAULT 0                               | Count of "I know this" actions      |
| times_marked_review   | INTEGER   | DEFAULT 0                               | Count of "Need review" actions      |
| is_quick_learner      | BOOLEAN   | DEFAULT FALSE                           | Flag for accelerated learning       |
| is_archived           | BOOLEAN   | DEFAULT FALSE                           | Hide from active feed if mastered   |
| created_at            | TIMESTAMP | DEFAULT NOW()                           | Record creation timestamp           |
| updated_at            | TIMESTAMP | DEFAULT NOW()                           | Last update timestamp               |

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `(user_id, word_id)`
- INDEX on `user_id`
- INDEX on `word_id`
- INDEX on `memory_level`
- INDEX on `last_reviewed_at`
- COMPOSITE INDEX on `(user_id, memory_level, is_archived)` for feed queries

**Check Constraints:**

```sql
CHECK (memory_level >= 0 AND memory_level <= 100)
CHECK (times_reviewed >= 0)
CHECK (times_marked_known >= 0)
CHECK (times_marked_review >= 0)
```

**Foreign Keys:**

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
```

---

### 4. review_history

Tracks every user interaction with words for analytics.

| Column        | Type        | Constraints                             | Description                                  |
| ------------- | ----------- | --------------------------------------- | -------------------------------------------- |
| id            | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique review record                         |
| user_id       | UUID        | REFERENCES auth.users(id), NOT NULL     | Reference to auth user                       |
| word_id       | UUID        | FOREIGN KEY → words(id), NOT NULL       | Reference to word                            |
| user_word_id  | UUID        | FOREIGN KEY → user_words(id), NOT NULL  | Reference to user_word record                |
| action_type   | VARCHAR(20) | NOT NULL                                | marked_known, marked_review, viewed, skipped |
| memory_before | INTEGER     | NOT NULL                                | Memory level before action                   |
| memory_after  | INTEGER     | NOT NULL                                | Memory level after action                    |
| memory_change | INTEGER     | NOT NULL                                | Change in memory (+10, +20, etc.)            |
| session_id    | UUID        | NULL                                    | Groups reviews in same session               |
| reviewed_at   | TIMESTAMP   | DEFAULT NOW()                           | When action occurred                         |

**Indexes:**

- PRIMARY KEY on `id`
- INDEX on `user_id`
- INDEX on `word_id`
- INDEX on `user_word_id`
- INDEX on `reviewed_at`
- INDEX on `session_id`
- COMPOSITE INDEX on `(user_id, reviewed_at)` for daily stats

**Check Constraints:**

```sql
CHECK (action_type IN ('marked_known', 'marked_review', 'viewed', 'skipped'))
CHECK (memory_before >= 0 AND memory_before <= 100)
CHECK (memory_after >= 0 AND memory_after <= 100)
```

**Foreign Keys:**

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
FOREIGN KEY (word_id) REFERENCES words(id) ON DELETE CASCADE
FOREIGN KEY (user_word_id) REFERENCES user_words(id) ON DELETE CASCADE
```

---

### 5. user_settings

Stores user preferences and configuration.

| Column                      | Type        | Constraints                                 | Description                           |
| --------------------------- | ----------- | ------------------------------------------- | ------------------------------------- |
| id                          | UUID        | PRIMARY KEY, DEFAULT uuid_generate_v4()     | Unique setting record                 |
| user_id                     | UUID        | REFERENCES auth.users(id), UNIQUE, NOT NULL | Reference to auth user                |
| daily_decay_rate            | INTEGER     | DEFAULT -1                                  | Memory decay per day (-3 to 0)        |
| daily_review_goal           | INTEGER     | DEFAULT 30                                  | Target words per day                  |
| quick_learning_enabled      | BOOLEAN     | DEFAULT TRUE                                | Enable automatic boost                |
| auto_archive_mastered       | BOOLEAN     | DEFAULT TRUE                                | Hide words at 100 memory              |
| show_phonetics              | BOOLEAN     | DEFAULT TRUE                                | Display phonetic transcription        |
| show_difficulty_badge       | BOOLEAN     | DEFAULT TRUE                                | Show difficulty indicator             |
| auto_flip_cards             | INTEGER     | DEFAULT 0                                   | Auto-flip delay in seconds (0=manual) |
| theme                       | VARCHAR(20) | DEFAULT 'auto'                              | light, dark, auto                     |
| font_size                   | VARCHAR(20) | DEFAULT 'medium'                            | small, medium, large                  |
| minimum_word_length         | INTEGER     | DEFAULT 3                                   | Min chars for extraction              |
| maximum_word_length         | INTEGER     | DEFAULT 15                                  | Max chars for extraction              |
| include_phrases             | BOOLEAN     | DEFAULT TRUE                                | Extract multi-word phrases            |
| notification_daily_reminder | BOOLEAN     | DEFAULT TRUE                                | Enable daily notifications            |
| notification_reminder_time  | TIME        | DEFAULT '09:00:00'                          | Preferred reminder time               |
| notification_critical_words | BOOLEAN     | DEFAULT TRUE                                | Alert for critical words              |
| notification_milestones     | BOOLEAN     | DEFAULT TRUE                                | Achievement notifications             |
| created_at                  | TIMESTAMP   | DEFAULT NOW()                               | Settings creation timestamp           |
| updated_at                  | TIMESTAMP   | DEFAULT NOW()                               | Last settings update                  |

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `user_id`

**Check Constraints:**

```sql
CHECK (daily_decay_rate >= -3 AND daily_decay_rate <= 0)
CHECK (daily_review_goal > 0 AND daily_review_goal <= 500)
CHECK (auto_flip_cards >= 0 AND auto_flip_cards <= 30)
CHECK (theme IN ('light', 'dark', 'auto'))
CHECK (font_size IN ('small', 'medium', 'large'))
CHECK (minimum_word_length >= 1 AND minimum_word_length <= 10)
CHECK (maximum_word_length >= minimum_word_length AND maximum_word_length <= 50)
```

**Foreign Keys:**

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

---

### 6. daily_stats

Aggregated daily statistics for each user.

| Column               | Type         | Constraints                             | Description                      |
| -------------------- | ------------ | --------------------------------------- | -------------------------------- |
| id                   | UUID         | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique stat record               |
| user_id              | UUID         | REFERENCES auth.users(id), NOT NULL     | Reference to auth user           |
| stat_date            | DATE         | NOT NULL                                | Date of statistics               |
| words_reviewed       | INTEGER      | DEFAULT 0                               | Total words interacted with      |
| words_marked_known   | INTEGER      | DEFAULT 0                               | Words marked as known            |
| words_marked_review  | INTEGER      | DEFAULT 0                               | Words needing review             |
| memory_points_gained | INTEGER      | DEFAULT 0                               | Total memory increase            |
| memory_points_lost   | INTEGER      | DEFAULT 0                               | Total memory decrease from decay |
| words_mastered       | INTEGER      | DEFAULT 0                               | Words reaching 100 this day      |
| words_added          | INTEGER      | DEFAULT 0                               | New words added this day         |
| critical_words_count | INTEGER      | DEFAULT 0                               | Words below 20 at end of day     |
| average_memory_level | DECIMAL(5,2) | NULL                                    | Average memory across all words  |
| total_vocabulary     | INTEGER      | DEFAULT 0                               | Total active words (memory > 0)  |
| streak_days          | INTEGER      | DEFAULT 0                               | Consecutive days of activity     |
| daily_goal_achieved  | BOOLEAN      | DEFAULT FALSE                           | Whether goal was met             |
| created_at           | TIMESTAMP    | DEFAULT NOW()                           | Record creation timestamp        |

**Indexes:**

- PRIMARY KEY on `id`
- UNIQUE INDEX on `(user_id, stat_date)`
- INDEX on `user_id`
- INDEX on `stat_date`
- COMPOSITE INDEX on `(user_id, stat_date DESC)` for trends

**Foreign Keys:**

```sql
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
```

---

## Key Relationships

```
auth.users (1) ←→ (1) user_profiles [optional]
auth.users (1) ←→ (many) user_words
words (1) ←→ (many) user_words
auth.users (1) ←→ (1) user_settings
auth.users (1) ←→ (many) daily_stats
auth.users (1) ←→ (many) review_history
user_words (1) ←→ (many) review_history
```

---

## Database Functions

### 1. calculate_priority_score

Function to calculate feed priority for a word.

```sql
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_memory_level INTEGER,
  p_word_length INTEGER
) RETURNS DECIMAL(10,2) AS $$
DECLARE
  urgency_multiplier DECIMAL(3,1);
  length_factor DECIMAL(3,1);
BEGIN
  -- Calculate urgency multiplier
  urgency_multiplier := CASE
    WHEN p_memory_level < 20 THEN 3.0
    WHEN p_memory_level BETWEEN 20 AND 50 THEN 1.5
    WHEN p_memory_level BETWEEN 51 AND 80 THEN 1.0
    ELSE 0.3
  END;

  -- Calculate length factor
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
```

### 2. apply_daily_decay

Edge function to run daily memory decay.

```sql
CREATE OR REPLACE FUNCTION apply_daily_decay()
RETURNS void AS $$
DECLARE
  user_record RECORD;
  word_record RECORD;
  decay_rate INTEGER;
  new_level INTEGER;
BEGIN
  -- Loop through all users from auth.users
  FOR user_record IN SELECT id FROM auth.users LOOP
    -- Get user's decay rate
    SELECT daily_decay_rate INTO decay_rate
    FROM user_settings
    WHERE user_id = user_record.id;

    -- Default to -1 if not set
    decay_rate := COALESCE(decay_rate, -1);

    -- Loop through user's words
    FOR word_record IN
      SELECT id, memory_level, last_memory_update_at
      FROM user_words
      WHERE user_id = user_record.id
        AND memory_level > 0
        AND (last_memory_update_at IS NULL OR last_memory_update_at < CURRENT_DATE)
    LOOP
      -- Calculate new level
      new_level := GREATEST(0, word_record.memory_level + decay_rate);

      -- Update memory level
      UPDATE user_words
      SET memory_level = new_level,
          last_memory_update_at = NOW(),
          updated_at = NOW()
      WHERE id = word_record.id;
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

### 3. update_daily_stats

Function to calculate and save daily statistics.

```sql
CREATE OR REPLACE FUNCTION update_daily_stats(p_user_id UUID, p_date DATE)
RETURNS void AS $$
DECLARE
  v_words_reviewed INTEGER;
  v_words_marked_known INTEGER;
  v_memory_gained INTEGER;
  v_words_mastered INTEGER;
  v_critical_count INTEGER;
  v_avg_memory DECIMAL(5,2);
  v_total_vocab INTEGER;
BEGIN
  -- Count reviews for the day
  SELECT
    COUNT(DISTINCT word_id),
    COUNT(*) FILTER (WHERE action_type = 'marked_known'),
    COALESCE(SUM(memory_change), 0)
  INTO v_words_reviewed, v_words_marked_known, v_memory_gained
  FROM review_history
  WHERE user_id = p_user_id
    AND DATE(reviewed_at) = p_date;

  -- Count mastered words
  SELECT COUNT(*)
  INTO v_words_mastered
  FROM user_words
  WHERE user_id = p_user_id
    AND memory_level = 100
    AND DATE(updated_at) = p_date;

  -- Calculate current stats
  SELECT
    COUNT(*) FILTER (WHERE memory_level < 20),
    AVG(memory_level),
    COUNT(*) FILTER (WHERE memory_level > 0)
  INTO v_critical_count, v_avg_memory, v_total_vocab
  FROM user_words
  WHERE user_id = p_user_id;

  -- Insert or update daily stats
  INSERT INTO daily_stats (
    user_id, stat_date, words_reviewed, words_marked_known,
    memory_points_gained, words_mastered, critical_words_count,
    average_memory_level, total_vocabulary
  ) VALUES (
    p_user_id, p_date, v_words_reviewed, v_words_marked_known,
    v_memory_gained, v_words_mastered, v_critical_count,
    v_avg_memory, v_total_vocab
  )
  ON CONFLICT (user_id, stat_date)
  DO UPDATE SET
    words_reviewed = EXCLUDED.words_reviewed,
    words_marked_known = EXCLUDED.words_marked_known,
    memory_points_gained = EXCLUDED.memory_points_gained,
    words_mastered = EXCLUDED.words_mastered,
    critical_words_count = EXCLUDED.critical_words_count,
    average_memory_level = EXCLUDED.average_memory_level,
    total_vocabulary = EXCLUDED.total_vocabulary;
END;
$$ LANGUAGE plpgsql;
```

---

## Row Level Security (RLS) Policies

Enable RLS on all user-facing tables:

```sql
-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_words ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY user_profiles_policy ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_words_policy ON user_words
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY review_history_policy ON review_history
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY user_settings_policy ON user_settings
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY daily_stats_policy ON daily_stats
  FOR ALL USING (auth.uid() = user_id);

-- Words are readable by all authenticated users
CREATE POLICY words_read_policy ON words
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only allow insert for words (through application logic)
CREATE POLICY words_insert_policy ON words
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

---

## Triggers

### Auto-update timestamps

```sql
-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_words_updated_at
  BEFORE UPDATE ON user_words
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Auto-increment word usage count

```sql
CREATE OR REPLACE FUNCTION increment_word_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE words
  SET usage_count = usage_count + 1
  WHERE id = NEW.word_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_usage_on_new_user_word
  AFTER INSERT ON user_words
  FOR EACH ROW EXECUTE FUNCTION increment_word_usage();
```

### Auto-create user settings on signup

```sql
CREATE OR REPLACE FUNCTION create_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users table (requires Supabase dashboard setup)
-- This is typically set up as a Database Webhook in Supabase
-- Or as an Edge Function triggered on auth.users.after.insert
```

---

## Indexes for Performance

Additional composite indexes for common queries:

```sql
-- Feed query optimization
CREATE INDEX idx_feed_priority ON user_words
  (user_id, memory_level, is_archived)
  WHERE memory_level < 100;

-- Review history for quick learning detection
CREATE INDEX idx_recent_reviews ON review_history
  (user_word_id, reviewed_at DESC);

-- Daily stats trends
CREATE INDEX idx_stats_timeline ON daily_stats
  (user_id, stat_date DESC);

-- Word lookup optimization
CREATE INDEX idx_word_lookup ON words
  USING gin(to_tsvector('english', word_text));
```

---

## Migration Notes

1. **Supabase Auth Setup**: Enable Email/Password authentication in Supabase dashboard
2. **Initial Setup**: Create tables in order of dependencies (words → user_profiles, user_settings, user_words, etc.)
3. **Cron Jobs**: Configure Supabase Edge Function to run `apply_daily_decay()` at 00:00 UTC daily
4. **Foreign Keys**: All user-related tables reference `auth.users(id)` with CASCADE deletes
5. **User Settings**: Create database webhook or Edge Function to auto-create user_settings on signup
6. **Performance**: Monitor query performance and add indexes as needed based on usage patterns

---

## Data Volume Estimates

For a user with 1000 active words and daily usage:

- **user_words**: 1,000 rows per user
- **review_history**: ~30 rows per day per user (10,950/year)
- **daily_stats**: ~365 rows per year per user
- **words**: Shared across all users (~50,000 unique words expected)

**Storage Optimization**:

- Partition `review_history` by month after 6 months
- Archive `daily_stats` older than 2 years to cold storage

---

## Key Differences from Original Design

### Changed:

1. **No separate `users` table** - Uses Supabase `auth.users` directly
2. **Added `user_profiles`** - Optional table for extended user data (display_name, timezone)
3. **All foreign keys** - Now reference `auth.users(id)` instead of custom `users(id)`
4. **RLS policies** - Use `auth.uid()` and `auth.role()` for access control
5. **Removed achievements** - Removed `achievements` and `user_achievements` tables as requested

### Benefits:

- Simplified authentication flow
- Built-in security with Supabase Auth
- No need to manage user passwords or sessions manually
- Automatic email verification and password reset
- Better integration with Supabase ecosystem
