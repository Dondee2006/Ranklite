const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testStatusValues() {
    const statuses = ['connected', 'Connected', 'active', 'Active', 'CONNECTED', 'success', 'Success'];
    const platform = 'notion';

    // Get a valid user_id
    const { data: userData } = await supabase.from('articles').select('user_id').limit(1).single();
    if (!userData) {
        console.error('No users found in articles table');
        return;
    }
    const userId = userData.user_id;

    for (const status of statuses) {
        console.log(`Testing status: "${status}"...`);
        const { data, error } = await supabase
            .from('cms_integrations')
            .insert({
                user_id: userId,
                platform: platform,
                credentials: { test: true },
                status: status
            })
            .select();

        if (error) {
            console.log(`❌ Failed for "${status}": ${error.message}`);
        } else {
            console.log(`✅ SUCCESS for "${status}"!`);
            // Cleanup
            await supabase.from('cms_integrations').delete().eq('id', data[0].id);
            return;
        }
    }
}

testStatusValues();
