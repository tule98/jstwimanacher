-- Add topic column to words table
-- Free-form text for AI-generated categorization (e.g., "technology", "food", "emotions")
-- Topic is optional and can be null

ALTER TABLE words ADD COLUMN topic VARCHAR(100);
