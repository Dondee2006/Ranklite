const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- SYSTEM AUDIT ---');

    // 1. Check all platforms
    const { data: platforms, error: pError } = await supabase.from('backlink_platforms').select('*');
    console.log(`Total Platforms in Database: ${platforms?.length || 0}`);

    // 2. Check all campaigns
    const { data: campaigns } = await supabase.from('backlink_campaigns').select('*, user:user_id(email)');
    console.log('--- Campaigns ---');
    campaigns?.forEach(c => {
        console.log(`User: ${c.user_id}, Status: ${c.status}, Unique Sources: ${c.unique_sources}, Total Links: ${c.total_backlinks}`);
    });

    // 3. Check backlinks for each campaign
    for (const c of campaigns || []) {
        const { data: backlinks } = await supabase.from('backlinks').select('source_domain').eq('user_id', c.user_id);
        const unique = new Set(backlinks?.map(b => b.source_domain)).size;
        console.log(`User ${c.user_id} ACTUAL backlink count: ${backlinks?.length || 0}, Unique: ${unique}`);
        if (backlinks?.length > 0) {
            console.log('Unique Domains:', Array.from(new Set(backlinks.map(b => b.source_domain))));
        }
    }

    // 4. Check tasks
    console.log('--- Tasks ---');
    const { data: tasks } = await supabase.from('backlink_tasks').select('status, platform_id').limit(10);
    console.log(`Sample Tasks:`, tasks);
}

check().catch(console.error);
