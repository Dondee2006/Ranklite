-- Create GSC Integrations table if not exists
CREATE TABLE IF NOT EXISTS gsc_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    property_url TEXT NOT NULL,
    site_url TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    auto_refresh_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id)
);

-- Create GA Integrations table
CREATE TABLE IF NOT EXISTS ga_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    property_id TEXT,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    scope TEXT,
    auto_refresh_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id)
);

-- RLS Policies
ALTER TABLE gsc_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ga_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own GSC integrations"
    ON gsc_integrations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own GA integrations"
    ON ga_integrations FOR SELECT
    USING (auth.uid() = user_id);
