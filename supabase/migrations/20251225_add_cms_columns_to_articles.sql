-- Add CMS related columns to articles table
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS cms_target text,
ADD COLUMN IF NOT EXISTS cms_post_id text,
ADD COLUMN IF NOT EXISTS published_url text;

-- Add checking constraint for cms_target if desired, or keep it open text
-- ALTER TABLE articles ADD CONSTRAINT check_cms_target CHECK (cms_target IN ('wordpress', 'webflow', 'shopify', 'notion', 'wix', 'framer'));
