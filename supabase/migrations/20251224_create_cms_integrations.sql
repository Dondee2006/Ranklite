-- Create CMS integrations table
CREATE TABLE IF NOT EXISTS cms_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  site_id uuid REFERENCES sites(id) ON DELETE CASCADE,
  platform text NOT NULL,
  credentials jsonb NOT NULL,
  site_url text,
  status text NOT NULL DEFAULT 'connected',
  config jsonb DEFAULT '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CONSTRAINT cms_integrations_platform_check CHECK (platform IN (
    'wordpress', 'webflow', 'shopify', 'notion', 'wix', 'framer', 'gsc', 'ga'
  )),
  CONSTRAINT cms_integrations_status_check CHECK (status IN (
    'connected', 'disconnected', 'error'
  ))
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_cms_integrations_user_id ON cms_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_cms_integrations_platform ON cms_integrations(platform);

-- Enable RLS
ALTER TABLE cms_integrations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own integrations"
  ON cms_integrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations"
  ON cms_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations"
  ON cms_integrations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations"
  ON cms_integrations FOR DELETE
  USING (auth.uid() = user_id);
