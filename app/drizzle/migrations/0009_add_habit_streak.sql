-- Migration: Add current_streak column to habits table
-- This stores the current streak value directly in the habits table
-- to avoid calculating it on every page load

ALTER TABLE habits ADD COLUMN current_streak INTEGER NOT NULL DEFAULT 0;

-- Initialize current_streak for existing habits by calculating from completions
-- This is a one-time migration to populate the streak values
-- Note: This simplified version sets all existing habits to 0
-- You may want to run a script to calculate actual current streaks after migration
