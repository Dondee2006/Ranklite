-- Add integration_id to articles table to link to cms_integrations
ALTER TABLE articles
ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES cms_integrations(id);
