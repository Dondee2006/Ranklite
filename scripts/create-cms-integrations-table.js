const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createCmsIntegrationsTable() {
    console.log("Creating cms_integrations table...");

    const { error } = await supabase.rpc('exec_sql', {
        sql: `
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

      CREATE INDEX IF NOT EXISTS idx_cms_integrations_user_id ON cms_integrations(user_id);
      CREATE INDEX IF NOT EXISTS idx_cms_integrations_platform ON cms_integrations(platform);

      ALTER TABLE cms_integrations ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS "Users can view their own integrations" ON cms_integrations;
      CREATE POLICY "Users can view their own integrations"
        ON cms_integrations FOR SELECT
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert their own integrations" ON cms_integrations;
      CREATE POLICY "Users can insert their own integrations"
        ON cms_integrations FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update their own integrations" ON cms_integrations;
      CREATE POLICY "Users can update their own integrations"
        ON cms_integrations FOR UPDATE
        USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete their own integrations" ON cms_integrations;
      CREATE POLICY "Users can delete their own integrations"
        ON cms_integrations FOR DELETE
        USING (auth.uid() = user_id);
    `
    });

    if (error) {
        console.error("Error creating table:", error);
        // Try direct query approach
        console.log("Trying direct SQL execution...");

        const { error: directError } = await supabase.from('cms_integrations').select('id').limit(1);

        if (directError && directError.code === '42P01') {
            console.error("Table doesn't exist and couldn't be created via RPC.");
            console.log("\nPlease run this SQL manually in Supabase SQL Editor:");
            console.log("-------------------------------------------------------");
            console.log(require('fs').readFileSync('./supabase/migrations/20251224_create_cms_integrations.sql', 'utf8'));
            process.exit(1);
        } else if (!directError) {
            console.log("Table already exists!");
        }
    } else {
        console.log("cms_integrations table created successfully!");
    }
}

createCmsIntegrationsTable();
