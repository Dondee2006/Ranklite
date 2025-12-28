const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function main() {
    let envContent;
    try {
        envContent = fs.readFileSync('.env.local', 'utf8');
    } catch (e) {
        console.error('Could not read .env.local');
        return;
    }

    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/);
    const keyMatch = envContent.match(/SUPABASE_SERVICE_ROLE_KEY=(.+)/);

    if (!urlMatch || !keyMatch) {
        console.error('Missing env vars');
        return;
    }

    const url = urlMatch[1].trim().replace(/^['"]|['"]$/g, '');
    const key = keyMatch[1].trim().replace(/^['"]|['"]$/g, '');

    const supabase = createClient(url, key);

    console.log('Applying CMS schema changes to articles table...');

    const sql = `
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_target text;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS cms_post_id text;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS published_url text;
        ALTER TABLE articles ADD COLUMN IF NOT EXISTS integration_id uuid REFERENCES cms_integrations(id);
    `;

    const { error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
        console.error('Error applying schema changes:', error);
        console.log('\nPlease run this SQL manually in Supabase SQL Editor:');
        console.log('-------------------------------------------------------');
        console.log(sql);
    } else {
        console.log('CMS schema changes applied successfully!');
    }
}

main().catch(console.error);
