-- Migration: Add SEO Metrics to Articles
-- This adds volume and difficulty columns to store estimated SEO data

ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS volume INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS difficulty INTEGER DEFAULT 0;

COMMENT ON COLUMN articles.volume IS 'Estimated monthly search volume for the primary keyword';
COMMENT ON COLUMN articles.difficulty IS 'Estimated keyword difficulty score (0-100)';
