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

async function simulateQuickSync() {
    console.log("Simulating Quick Sync for first user found...");

    const { data: { users } } = await supabase.auth.admin.listUsers();
    const user = users[0];

    if (!user) {
        console.error("No users found");
        return;
    }

    console.log(`User: ${user.email} (${user.id})`);

    // We can't hit the internal API easily with fetch since it requires Next.js context/auth headers
    // But we can call the logic directly or look at the route.ts logic.
    // The route.ts logic uses createTasksForUser.

    const { createTasksForUser } = require('../src/lib/backlink-engine/task-queue');
    const { data: site } = await supabase.from('sites').select('*').eq('user_id', user.id).single();

    if (!site) {
        console.error("No site found for user");
        return;
    }

    console.log(`Site: ${site.name} (${site.url})`);

    const result = await createTasksForUser(
        user.id,
        site.url,
        site.name,
        site.description || ""
    );

    console.log("Sync Result:", result);
}

simulateQuickSync().catch(console.error);
