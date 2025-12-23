import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase URL or Service Role Key in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listPlansAndUser() {
    // Common typo in my prompt, user said dondorian7@gmail.com
    const email = "dondorian7@gmail.com";

    const { data: plans, error: plansError } = await supabase.from('plans').select('*');
    if (plansError) {
        console.error("Error fetching plans:", plansError);
    } else {
        console.log("Available Plans:");
        console.log(JSON.stringify(plans, null, 2));
    }

    // Find user via Supabase Auth Admin
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
        console.error("Error fetching users:", userError);
    } else {
        const user = users.find(u => u.email === email);
        if (user) {
            console.log("Found User:");
            console.log(JSON.stringify(user, null, 2));

            // Check existing plan
            const { data: userPlan } = await supabase.from('user_plans').select('*').eq('user_id', user.id);
            console.log("Current User Plan:", JSON.stringify(userPlan, null, 2));
        } else {
            console.log(`User ${email} not found.`);
            // List all emails just in case
            console.log("All User Emails:", users.map(u => u.email));
        }
    }
}

listPlansAndUser();
