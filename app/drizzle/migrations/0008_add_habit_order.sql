-- Add order column to habits table for drag-to-reorder functionality
ALTER TABLE habits ADD COLUMN "order" INTEGER DEFAULT 0;
