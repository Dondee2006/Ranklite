-- Migration: Add Article Settings Columns
-- This migration adds all the article settings columns that are collected during onboarding
-- and managed in the Article Settings page

-- Add columns to article_settings table
ALTER TABLE article_settings
ADD COLUMN IF NOT EXISTS sitemap_url TEXT,
ADD COLUMN IF NOT EXISTS blog_address TEXT,
ADD COLUMN IF NOT EXISTS example_urls TEXT[],
ADD COLUMN IF NOT EXISTS auto_publish BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS article_style TEXT DEFAULT 'Informative',
ADD COLUMN IF NOT EXISTS internal_links TEXT DEFAULT '3 links per article',
ADD COLUMN IF NOT EXISTS global_instructions TEXT,
ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#000000',
ADD COLUMN IF NOT EXISTS image_style TEXT DEFAULT 'brand-text',
ADD COLUMN IF NOT EXISTS title_based_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS youtube_video BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS call_to_action BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_infographics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS include_emojis BOOLEAN DEFAULT false;

-- Add comment to table
COMMENT ON TABLE article_settings IS 'Stores article generation preferences and settings for each site';

-- Add comments to columns for documentation
COMMENT ON COLUMN article_settings.sitemap_url IS 'URL to the site sitemap.xml';
COMMENT ON COLUMN article_settings.blog_address IS 'Main blog URL';
COMMENT ON COLUMN article_settings.example_urls IS 'Array of example article URLs for style reference';
COMMENT ON COLUMN article_settings.auto_publish IS 'Whether to automatically publish generated articles';
COMMENT ON COLUMN article_settings.article_style IS 'Writing style: Informative, Conversational, Professional, or Casual';
COMMENT ON COLUMN article_settings.internal_links IS 'Number of internal links per article';
COMMENT ON COLUMN article_settings.global_instructions IS 'Custom instructions applied to all articles';
COMMENT ON COLUMN article_settings.brand_color IS 'Brand color in hex format for images';
COMMENT ON COLUMN article_settings.image_style IS 'Image style: brand-text, watercolor, cinematic, illustration, or sketch';
COMMENT ON COLUMN article_settings.title_based_image IS 'Whether to use title-based featured images';
COMMENT ON COLUMN article_settings.youtube_video IS 'Whether to include YouTube videos in articles';
COMMENT ON COLUMN article_settings.call_to_action IS 'Whether to include call-to-action sections';
COMMENT ON COLUMN article_settings.include_infographics IS 'Whether to include infographics';
COMMENT ON COLUMN article_settings.include_emojis IS 'Whether to include emojis in articles';
