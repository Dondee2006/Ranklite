-- MIGRATION: Fix Article Table Mismatch
-- Run this in your Supabase SQL Editor to bring the database in sync with the code.

ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS html_content text,
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS outline jsonb,
ADD COLUMN IF NOT EXISTS internal_links jsonb,
ADD COLUMN IF NOT EXISTS external_links jsonb,
ADD COLUMN IF NOT EXISTS images jsonb,
ADD COLUMN IF NOT EXISTS featured_image text,
ADD COLUMN IF NOT EXISTS cms_exports jsonb;

-- Ensure secondary_keywords is an array if not already
-- DO NOT RUN if you already have data in secondary_keywords that isn't compatible with text[]
-- ALTER TABLE articles ALTER COLUMN secondary_keywords TYPE text[] USING secondary_keywords::text[];

-- Update status check if necessary
-- ALTER TABLE articles DROP CONSTRAINT IF EXISTS articles_status_check;
-- ALTER TABLE articles ADD CONSTRAINT articles_status_check CHECK (status IN ('draft', 'published', 'scheduled', 'planned', 'generating', 'qa_validated'));
