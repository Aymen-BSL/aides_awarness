-- Phase 6D: Add ban columns to users table

ALTER TABLE users 
ADD COLUMN is_banned BOOLEAN DEFAULT FALSE,
ADD COLUMN ban_reason TEXT,
ADD COLUMN banned_at TIMESTAMP NULL,
ADD COLUMN ban_until TIMESTAMP NULL COMMENT 'NULL = permanent ban, TIMESTAMP = temporary ban expiry',
ADD COLUMN banned_by INT NULL;
