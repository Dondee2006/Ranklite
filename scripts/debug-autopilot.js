
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim();
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing credentials");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugAutopilot() {
    console.log("--- Debugging Autopilot ---");

    // 1. Get User/Site
    const { data: { users } } = await supabase.auth.admin.listUsers();
    // Assuming first user is the target for now, or finding by email if known.
    // Let's list status for all enabled sites.

    const { data: settings } = await supabase
        .from('autopilot_settings')
        .select('site_id, enabled, publish_time_start, publish_time_end, articles_per_day')
        .eq('enabled', true);

    console.log(`Found ${settings.length} enabled autopilot settings.`);

    for (const setting of settings) {
        console.log(`\nChecking Site: ${setting.site_id}`);

        // Window Check
        const now = new Date();
        const hour = now.getUTCHours();
        const start = setting.publish_time_start ?? 0;
        const end = setting.publish_time_end ?? 23;

        console.log(`Time Window: ${start}-${end} UTC. Current: ${hour} UTC.`);
        const inWindow = hour >= start && hour <= end;
        if (!inWindow) console.warn("!! OUTSIDE WINDOW !!");

        // Quota Check
        const today = now.toISOString().split('T')[0];
        const { count: publishedToday } = await supabase
            .from('articles')
            .select('*', { count: 'exact', head: true })
            .eq('site_id', setting.site_id)
            .eq('status', 'published')
            .gte('published_at', `${today}T00:00:00Z`);

        console.log(`Published Today: ${publishedToday} / Target: ${setting.articles_per_day}`);

        if (publishedToday >= setting.articles_per_day) {
            console.warn("!! QUOTA REACHED !!");
        }

        // Candidates
        const { data: candidates } = await supabase
            .from('articles')
            .select('id, title, status, scheduled_date, scheduled_time')
            .eq('site_id', setting.site_id)
            .lte('scheduled_date', today)
            .in('status', ['planned', 'generated', 'draft']);

        console.log(`Pending Candidates (<= ${today}): ${candidates.length}`);
        candidates.forEach(c => {
            console.log(`- [${c.status}] ${c.title} (Date: ${c.scheduled_date}, Time: ${c.scheduled_time})`);

            // Time Check
            const currentTimeStr = now.toTimeString().split(" ")[0];
            if (c.scheduled_time && c.scheduled_time > currentTimeStr) {
                console.log(`  -> Scheduled for later today (${c.scheduled_time} > ${currentTimeStr})`);
            } else {
                console.log(`  -> READY to process`);
            }
        });
    }
}

debugAutopilot().catch(console.error);
