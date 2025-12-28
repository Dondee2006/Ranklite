-- Add automated exchange settings to exchange_settings
ALTER TABLE exchange_settings ADD COLUMN IF NOT EXISTS auto_exchange_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE exchange_settings ADD COLUMN IF NOT EXISTS automation_risk_level TEXT DEFAULT 'conservative';

-- Add site tiers to sites
ALTER TABLE sites ADD COLUMN IF NOT EXISTS exchange_tier INTEGER DEFAULT 2;

-- Create automation logs table
CREATE TABLE IF NOT EXISTS exchange_automation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for logs
ALTER TABLE exchange_automation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own automation logs"
    ON exchange_automation_logs FOR SELECT
    USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_exchange_automation_logs_user_id ON exchange_automation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sites_exchange_tier ON sites(exchange_tier);
