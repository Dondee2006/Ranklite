-- Migration: Seed Backlink Platforms and Fix RLS
-- This adds initial high-quality platforms for the backlink engine

-- 1. Seed Backlink Platforms
ALTER TABLE articles ADD COLUMN IF NOT EXISTS backlinks_status text DEFAULT 'pending';
ALTER TABLE articles ADD COLUMN IF NOT EXISTS backlinks_count integer DEFAULT 0;
ALTER TABLE backlink_tasks ADD COLUMN IF NOT EXISTS article_id uuid REFERENCES articles(id) ON DELETE SET NULL;
ALTER TABLE backlink_tasks ADD COLUMN IF NOT EXISTS site_id uuid REFERENCES sites(id) ON DELETE CASCADE;
ALTER TABLE backlink_tasks ADD COLUMN IF NOT EXISTS outreach_status text;
ALTER TABLE backlink_tasks ADD COLUMN IF NOT EXISTS verification_status text;

-- Ensure backlink_campaigns has unique user_id
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'backlink_campaigns_user_id_key') THEN
        DELETE FROM backlink_campaigns 
        WHERE id IN (
          SELECT id 
          FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as row_num 
            FROM backlink_campaigns
          ) t 
          WHERE t.row_num > 1
        );
        ALTER TABLE backlink_campaigns ADD CONSTRAINT backlink_campaigns_user_id_key UNIQUE (user_id);
    END IF;
END $$;

INSERT INTO backlink_platforms (site_name, site_domain, submission_type, submission_url, automation_allowed, domain_rating, monthly_traffic, category)
VALUES 
('Clutch', 'clutch.co', 'form', 'https://clutch.co/submit', true, 89, '1M+', 'Business Directory'),
('Crunchbase', 'crunchbase.com', 'form', 'https://www.crunchbase.com/add-company', true, 91, '5M+', 'Business Directory'),
('Product Hunt', 'producthunt.com', 'api', 'https://api.producthunt.com/v2/posts', true, 90, '2M+', 'Product Launch'),
('Medium', 'medium.com', 'api', 'https://api.medium.com/v1/posts', true, 94, '50M+', 'Blogging/News'),
('Reddit', 'reddit.com', 'api', 'https://oauth.reddit.com/api/submit', true, 91, '1B+', 'Social/Community'),
('Yellow Pages', 'yellowpages.com', 'form', 'https://www.yellowpages.com/listings/new', true, 85, '10M+', 'Local Directory'),
('Yelp', 'yelp.com', 'form', 'https://www.yelp.com/biz_attribute', true, 93, '20M+', 'Local Directory'),
('Trustpilot', 'trustpilot.com', 'api', 'https://api.trustpilot.com/v1/reviews', true, 92, '15M+', 'Review Platform'),
('Indie Hackers', 'indiehackers.com', 'form', 'https://www.indiehackers.com/submit', true, 78, '500K+', 'Community'),
('Hacker News', 'news.ycombinator.com', 'form', 'https://news.ycombinator.com/submit', true, 91, '5M+', 'Community')
ON CONFLICT DO NOTHING;

-- 2. Fix RLS for backlink_platforms (System needs read access)
DROP POLICY IF EXISTS "Public can read platforms" ON backlink_platforms;
CREATE POLICY "Public can read platforms" ON backlink_platforms FOR SELECT USING (true);

-- 3. Ensure usage_tracking exists for users
INSERT INTO usage_tracking (user_id, period_start, period_end)
SELECT id, now(), now() + interval '30 days'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM usage_tracking)
ON CONFLICT DO NOTHING;
