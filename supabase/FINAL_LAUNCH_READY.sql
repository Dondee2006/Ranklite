-- RANKLITE FINAL LAUNCH READY SCRIPT (Standard SQL Version)
-- Optimized for Supabase SQL Editor compatibility.

-- 1. PLANS TABLE
CREATE TABLE IF NOT EXISTS plans (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    price numeric DEFAULT 0,
    period text DEFAULT 'month',
    created_at timestamptz DEFAULT now()
);

-- Safely add missing columns to plans
ALTER TABLE plans ADD COLUMN IF NOT EXISTS posts_per_month integer DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS backlinks_per_post integer DEFAULT 0;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS qa_validation boolean DEFAULT false;
ALTER TABLE plans ADD COLUMN IF NOT EXISTS integrations_limit integer DEFAULT 0;

-- Safely add daily tracking columns to usage_tracking
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS backlinks_today integer DEFAULT 0;
ALTER TABLE usage_tracking ADD COLUMN IF NOT EXISTS last_backlink_date date;

-- 2. USER_PLANS TABLE
CREATE TABLE IF NOT EXISTS user_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id text REFERENCES plans(id),
    status text DEFAULT 'active',
    current_period_start timestamptz DEFAULT now(),
    current_period_end timestamptz DEFAULT (now() + interval '3 days'), -- Default to 3-day trial
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 3. USAGE_TRACKING TABLE
CREATE TABLE IF NOT EXISTS usage_tracking (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    period_start timestamptz NOT NULL,
    period_end timestamptz NOT NULL,
    posts_generated integer DEFAULT 0,
    backlinks_generated integer DEFAULT 0,
    backlinks_today integer DEFAULT 0, -- Daily velocity tracking
    last_backlink_date date, -- Daily reset tracker
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id, period_start, period_end)
);

-- 4. BACKLINK_VERIFICATION TABLE
CREATE TABLE IF NOT EXISTS backlink_verification (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id uuid REFERENCES backlink_tasks(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_url text NOT NULL,
    expected_anchor_text text,
    found_anchor_text text,
    link_type text CHECK (link_type IN ('dofollow', 'nofollow')),
    is_dofollow boolean,
    is_indexed boolean DEFAULT false,
    verification_status text DEFAULT 'pending',
    last_verified_at timestamptz,
    next_verification_at timestamptz,
    verification_count integer DEFAULT 0,
    response_status_code integer,
    html_snippet text,
    created_at timestamptz DEFAULT now()
);

-- 5. SECURITY & RLS
ALTER TABLE IF EXISTS usage_tracking ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read their own usage" ON usage_tracking;
CREATE POLICY "Users can read their own usage" ON usage_tracking FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can insert their own usage" ON usage_tracking;
CREATE POLICY "Users can insert their own usage" ON usage_tracking FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own usage" ON usage_tracking;
CREATE POLICY "Users can update their own usage" ON usage_tracking FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE IF EXISTS backlink_verification ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own backlink verifications" ON backlink_verification;
CREATE POLICY "Users can view their own backlink verifications" ON backlink_verification FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE IF EXISTS user_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own plan" ON user_plans;
CREATE POLICY "Users can view their own plan" ON user_plans FOR SELECT USING (auth.uid() = user_id);

-- 6. SEED / UPDATE PRO TIER
-- This ensures the 'pro' plan has the correct limits regardless of existing data.
INSERT INTO plans (id, name, posts_per_month, backlinks_per_post, qa_validation, integrations_limit, price)
VALUES ('pro', 'Pro Tier', 30, 50, true, 10, 59)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    posts_per_month = EXCLUDED.posts_per_month,
    backlinks_per_post = EXCLUDED.backlinks_per_post,
    qa_validation = EXCLUDED.qa_validation,
    integrations_limit = EXCLUDED.integrations_limit,
    price = EXCLUDED.price;
