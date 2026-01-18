-- Fix quiz_questions table schema to match API expectations

-- Rename 'question' column to 'question_text'
ALTER TABLE quiz_questions 
CHANGE COLUMN question question_text TEXT NOT NULL;

-- Rename 'question_order' column to 'order_number'  
ALTER TABLE quiz_questions
CHANGE COLUMN question_order order_number INT NOT NULL;

-- Remove option_order from quiz_options if it exists (not needed)
-- ALTER TABLE quiz_options DROP COLUMN IF EXISTS option_order;
