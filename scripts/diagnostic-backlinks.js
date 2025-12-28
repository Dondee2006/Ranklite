const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config();

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
    console.log('--- Database Audit ---');

    const { data: platforms, error: pError } = await supabase.from('backlink_platforms').select('*');
    console.log(`Platforms found: ${platforms?.length || 0}`);
    if (platforms?.length > 0) {
        console.log('Sample Platform:', {
            name: platforms[0].site_name,
            domain: platforms[0].site_domain,
            automation: platforms[0].automation_allowed
        });
    }

    const { data: backlinks, error: bError } = await supabase.from('backlinks').select('*');
    console.log(`Backlinks found: ${backlinks?.length || 0}`);

    const { data: campaigns, error: cError } = await supabase.from('backlink_campaigns').select('*');
    console.log(`Campaigns found: ${campaigns?.length || 0}`);
    if (campaigns?.length > 0) {
        console.log('Campaign Stats:', {
            total: campaigns[0].total_backlinks,
            unique_sources: campaigns[0].unique_sources,
            status: campaigns[0].status
        });
    }

    const { data: tasks, error: tError } = await supabase.from('backlink_tasks').select('*');
    console.log(`Tasks found: ${tasks?.length || 0}`);
    if (tasks?.length > 0) {
        const counts = tasks.reduce((acc, t) => {
            acc[t.status] = (acc[t.status] || 0) + 1;
            return acc;
        }, {});
        console.log('Task Status counts:', counts);
    }
}

check().catch(console.error);
