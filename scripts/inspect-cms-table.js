const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function inspectTable() {
    console.log('Inspecting cms_integrations table...');

    try {
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: `
        SELECT 
          conname as constraint_name, 
          pg_get_constraintdef(oid) as definition
        FROM pg_constraint 
        WHERE conrelid = 'cms_integrations'::regclass;
      `
        });

        if (error) {
            console.error('Error fetching constraints:', error);
            return;
        }

        console.log('Constraints details:');
        console.log(JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Failed to inspect table:', err);
    }
}

inspectTable();
