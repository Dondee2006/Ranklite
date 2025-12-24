-- Migration: Add Topic Cluster Columns to Articles
-- This enables grouping articles into semantic clusters (Hub-and-Spoke model)

ALTER TABLE articles 
ADD COLUMN IF NOT EXISTS cluster_name TEXT,
ADD COLUMN IF NOT EXISTS is_pillar BOOLEAN DEFAULT false;

-- Add indexes for performance when filtering by cluster
CREATE INDEX IF NOT EXISTS idx_articles_cluster_name ON articles(cluster_name);
CREATE INDEX IF NOT EXISTS idx_articles_is_pillar ON articles(is_pillar);

COMMENT ON COLUMN articles.cluster_name IS 'The name of the semantic topic cluster this article belongs to';
COMMENT ON COLUMN articles.is_pillar IS 'Whether this article is a Pillar/Hub post (Authority) or a Spoke post';
