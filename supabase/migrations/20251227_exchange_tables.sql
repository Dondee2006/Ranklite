-- Create Link Inventory table
CREATE TABLE IF NOT EXISTS link_inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    site_id UUID REFERENCES sites(id) ON DELETE SET NULL,
    page_url TEXT NOT NULL,
    page_title TEXT,
    domain TEXT NOT NULL,
    domain_rating INTEGER DEFAULT 0,
    trust_flow INTEGER DEFAULT 0,
    traffic_estimate INTEGER DEFAULT 0,
    niche TEXT,
    topics TEXT[],
    max_outbound_links INTEGER DEFAULT 2,
    current_outbound_links INTEGER DEFAULT 0,
    link_type TEXT DEFAULT 'dofollow',
    content_placement TEXT DEFAULT 'contextual',
    tier INTEGER DEFAULT 2,
    quality_score FLOAT DEFAULT 50,
    risk_score FLOAT DEFAULT 0,
    credits_per_link FLOAT DEFAULT 10,
    verification_status TEXT DEFAULT 'pending', -- pending, verified, rejected
    rejection_reason TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    is_indexed BOOLEAN DEFAULT FALSE,
    last_verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, page_url)
);

-- Create Exchange Link Graph table
CREATE TABLE IF NOT EXISTS exchange_link_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_user_id UUID REFERENCES auth.users(id), -- The giver
    target_user_id UUID REFERENCES auth.users(id), -- The receiver (requester)
    source_inventory_id UUID REFERENCES link_inventory(id) ON DELETE SET NULL,
    target_site_domain TEXT NOT NULL,
    link_url TEXT NOT NULL, -- The specific page receiving the link
    anchor_text TEXT,
    anchor_type TEXT,
    hop_distance INTEGER DEFAULT 1,
    route_path TEXT[], -- Array of user_ids in the chain
    credits_awarded FLOAT DEFAULT 0,
    credits_status TEXT DEFAULT 'pending',
    min_live_days INTEGER DEFAULT 30,
    expires_at TIMESTAMP WITH TIME ZONE,
    is_live BOOLEAN DEFAULT TRUE,
    is_indexed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE link_inventory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own inventory"
    ON link_inventory FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own inventory"
    ON link_inventory FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Exchange Link Graph RLS
ALTER TABLE exchange_link_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view links they gave or received"
    ON exchange_link_graph FOR SELECT
    USING (auth.uid() = source_user_id OR auth.uid() = target_user_id);
