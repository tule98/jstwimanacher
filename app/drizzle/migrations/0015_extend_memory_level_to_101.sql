-- Extend memory_level constraint to allow value up to 101
-- This enables special "mastered" state (101) beyond regular 0-100 range

ALTER TABLE user_words DROP CONSTRAINT IF EXISTS user_words_memory_level_check;
ALTER TABLE user_words ADD CONSTRAINT user_words_memory_level_check CHECK (memory_level >= 0 AND memory_level <= 101);
