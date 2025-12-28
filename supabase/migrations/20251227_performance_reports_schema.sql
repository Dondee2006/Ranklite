-- Create Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create GSC Performance Data table
CREATE TABLE IF NOT EXISTS gsc_performance_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID REFERENCES sites(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    clicks INTEGER DEFAULT 0,
    impressions INTEGER DEFAULT 0,
    ctr FLOAT DEFAULT 0,
    position FLOAT DEFAULT 0,
    page_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(site_id, date, page_url)
);

-- Create Backlinks table (if not exists, as it might be referenced loosely)
CREATE TABLE IF NOT EXISTS backlinks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE SET NULL,
    linking_url TEXT NOT NULL,
    domain_rating INTEGER DEFAULT 0,
    status TEXT DEFAULT 'Live',
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies

-- Reports
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reports"
    ON reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- GSC Data
ALTER TABLE gsc_performance_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their site GSC data"
    ON gsc_performance_data FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM sites
        WHERE sites.id = gsc_performance_data.site_id
        AND sites.user_id = auth.uid()
    ));

-- Backlinks
ALTER TABLE backlinks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view backlinks for their articles"
    ON backlinks FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM articles
        WHERE articles.id = backlinks.article_id
        AND articles.user_id = auth.uid()
    ));
