-- 1. Add missing columns
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_target text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_post_id text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_url text;
ALTER TABLE articles ADD COLUMN IF NOT EXISTS integration_id uuid;

-- 2. Link articles to Notion
UPDATE articles SET cms_target = 'notion', cms_post_id = '2d421923-aeac-81ae-babe-df802202eaa6', integration_id = 'acb17c05-ed0a-4f17-8777-c09b73e4e029' WHERE id = '3fb6e724-993a-4524-a3af-ca3c34a8e11b';
UPDATE articles SET cms_target = 'notion', cms_post_id = '2d321923-aeac-817e-9a1b-f2072dc69b38', integration_id = 'acb17c05-ed0a-4f17-8777-c09b73e4e029' WHERE id = '4d855667-c6f5-4bab-83c6-211c6b939108';
UPDATE articles SET cms_target = 'notion', cms_post_id = '2d321923-aeac-8130-9f55-f2b2a6fa09c9', integration_id = 'acb17c05-ed0a-4f17-8777-c09b73e4e029' WHERE id = '4586edf2-8da5-41ef-a23a-3b300218f52b';
UPDATE articles SET cms_target = 'notion', cms_post_id = '2d521923-aeac-816f-b4c6-e286a44a2251', integration_id = 'acb17c05-ed0a-4f17-8777-c09b73e4e029' WHERE id = '4e9378b1-a1b3-4d13-9544-971263810da7';