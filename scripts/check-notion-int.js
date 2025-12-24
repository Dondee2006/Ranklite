const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkIntegration() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const userId = '2e893c56-66e4-44c5-bf00-7a50787fc09d';

    console.log(`--- Checking Integration for User: ${userId} ---`);

    const { data: integrations, error } = await supabase
        .from('cms_integrations')
        .select('*')
        .eq('user_id', userId)
        .eq('platform', 'notion')
        .eq('status', 'active');

    if (error) {
        console.error('Error fetching integrations:', error);
        return;
    }

    if (!integrations || integrations.length === 0) {
        console.log('No active Notion integration found for this user.');
        return;
    }

    console.log('Integrations found:', integrations.length);
    integrations.forEach(integration => {
        console.log(`- ID: ${integration.id}`);
        console.log(`- Site URL: ${integration.site_url}`);
        console.log(`- Token length: ${integration.access_token?.length || 0}`);
        console.log(`- Settings:`, JSON.stringify(integration.settings));
        console.log(`- Created At: ${integration.created_at}`);
    });
}

checkIntegration();
