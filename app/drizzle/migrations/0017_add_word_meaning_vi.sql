-- Add Vietnamese meaning column for Wordmaster words
-- Stores short glossary-style Vietnamese translation; optional

ALTER TABLE words ADD COLUMN meaning_vi TEXT;
