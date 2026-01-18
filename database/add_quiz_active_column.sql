-- Add active column to quizzes table if it doesn't exist

ALTER TABLE quizzes 
ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
