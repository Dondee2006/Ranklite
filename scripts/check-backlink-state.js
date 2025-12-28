
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env from root
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFunctionality() {
    console.log('--- Ranklite Backlink System Diagnostic ---');

    const { count: taskCount } = await supabase.from('backlink_tasks').select('*', { count: 'exact', head: true });
    console.log(`Backlink Tasks: ${taskCount || 0}`);

    const { count: backlinkCount } = await supabase.from('backlinks').select('*', { count: 'exact', head: true });
    console.log(`Live Backlinks: ${backlinkCount || 0}`);

    const { count: participantCount } = await supabase.from('exchange_participants').select('*', { count: 'exact', head: true });
    console.log(`Exchange Participants: ${participantCount || 0}`);

    const { count: linkCount } = await supabase.from('exchange_links').select('*', { count: 'exact', head: true });
    console.log(`Exchange Links Placed: ${linkCount || 0}`);

    const { data: recentTasks } = await supabase.from('backlink_tasks').select('status, created_at').order('created_at', { ascending: false }).limit(5);
    console.log('\nRecent Task Statuses:');
    recentTasks?.forEach(t => console.log(`- ${t.status} (${t.created_at})`));

    process.exit(0);
}

checkFunctionality();
