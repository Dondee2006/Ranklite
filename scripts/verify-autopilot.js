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

async function verifyAutopilot() {
    console.log("Verifying Autopilot settings persistence...");

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users[0];

    if (!user) {
        console.error("No users found");
        return;
    }

    console.log(`User: ${user.email} (${user.id})`);

    const { data: site } = await supabase.from('sites').select('id').eq('user_id', user.id).single();

    if (!site) {
        console.error("No site found for user");
        return;
    }

    console.log(`Site ID: ${site.id}`);

    // 1. Initial Check (should be default ON if we hit the API, but directly in DB it might not exist yet)
    const { data: initialSettings } = await supabase
        .from('autopilot_settings')
        .select('*')
        .eq('site_id', site.id)
        .single();

    console.log("Initial DB Settings:", initialSettings);

    // 2. Simulate Save (ON)
    console.log("Saving Autopilot: ON");
    const { data: savedOn } = await supabase
        .from('autopilot_settings')
        .upsert({ site_id: site.id, enabled: true })
        .select()
        .single();

    console.log("Saved (ON):", savedOn?.enabled === true ? "SUCCESS" : "FAILED");

    // 3. Simulate Save (OFF)
    console.log("Saving Autopilot: OFF");
    const { data: savedOff } = await supabase
        .from('autopilot_settings')
        .upsert({ site_id: site.id, enabled: false })
        .select()
        .single();

    console.log("Saved (OFF):", savedOff?.enabled === false ? "SUCCESS" : "FAILED");

    // 4. Cleanup/Reset to ON (Always On requirement)
    console.log("Restoring Autopilot: ON (Default)");
    await supabase
        .from('autopilot_settings')
        .upsert({ site_id: site.id, enabled: true });
}

verifyAutopilot().catch(console.error);
