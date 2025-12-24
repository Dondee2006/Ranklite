const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBacklinkStatus() {
    console.log("Checking Backlink System Status...");

    // 1. Check Platforms
    const { count: platformCount } = await supabase
        .from('backlink_platforms')
        .select('*', { count: 'exact', head: true });
    console.log(`- Platforms available: ${platformCount}`);

    // 2. Check Active Campaigns
    const { data: campaigns } = await supabase
        .from('backlink_campaigns')
        .select('*');
    console.log(`- Active Campaigns: ${campaigns?.length || 0}`);

    // 3. Check Task Stats
    const { data: tasks } = await supabase
        .from('backlink_tasks')
        .select('status');

    const stats = Object.fromEntries(
        ['pending', 'processing', 'completed', 'failed', 'require_manual'].map(s => [s, 0])
    );

    tasks?.forEach(t => {
        if (stats.hasOwnProperty(t.status)) stats[t.status]++;
    });

    console.log("- Task Summary:");
    Object.entries(stats).forEach(([status, count]) => {
        console.log(`  - ${status}: ${count}`);
    });

    // 4. Check Backlinks
    const { count: backlinkCount } = await supabase
        .from('backlinks')
        .select('*', { count: 'exact', head: true });
    console.log(`- Total Backlinks found: ${backlinkCount}`);
}

checkBacklinkStatus().catch(console.error);
