-- Add category column to articles table

ALTER TABLE articles
ADD COLUMN category VARCHAR(50) DEFAULT NULL AFTER content;
