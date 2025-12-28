-- Add QA columns to backlinks table
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS source_name TEXT;
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS source_domain TEXT;
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS anchor_text TEXT;
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS is_dofollow BOOLEAN;
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS traffic TEXT;
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS check_status TEXT DEFAULT 'pending';
ALTER TABLE backlinks ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMP WITH TIME ZONE;
