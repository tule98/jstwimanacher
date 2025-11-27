-- Add phonetic and example columns to flash_cards table
ALTER TABLE flash_cards ADD COLUMN phonetic TEXT;
ALTER TABLE flash_cards ADD COLUMN example TEXT;
