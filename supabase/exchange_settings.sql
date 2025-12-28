-- Add exchange_settings table for Authority Exchange feature

CREATE TABLE IF NOT EXISTS exchange_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_accept boolean DEFAULT false,
    min_incoming_dr integer DEFAULT 30,
    max_outgoing_per_day integer DEFAULT 5,
    min_hop_distance integer DEFAULT 2,
    tier1_enabled boolean DEFAULT true,
    tier2_enabled boolean DEFAULT true,
    tier3_enabled boolean DEFAULT false,
    auto_exchange_enabled boolean DEFAULT false,
    automation_risk_level text DEFAULT 'medium' CHECK (automation_risk_level IN ('low', 'medium', 'high')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE exchange_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Users can view their own exchange settings" ON exchange_settings;
CREATE POLICY "Users can view their own exchange settings" ON exchange_settings 
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own exchange settings" ON exchange_settings;
CREATE POLICY "Users can update their own exchange settings" ON exchange_settings 
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own exchange settings" ON exchange_settings;
CREATE POLICY "Users can insert their own exchange settings" ON exchange_settings 
    FOR INSERT WITH CHECK (auth.uid() = user_id);
