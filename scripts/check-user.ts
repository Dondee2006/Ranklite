import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function findUserAndPlans() {
    const email = "dondorian7@gmail.com";

    // Find in auth.users (via admin API)
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError) {
        console.error("Error listing users:", userError.message);
        return;
    }

    const user = users.users.find(u => u.email === email);
    if (!user) {
        console.log(`User ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.email} (ID: ${user.id})`);

    // Find in user_plans
    const { data: plans, error: planError } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id);

    if (planError) {
        console.error("Error fetching plans:", planError.message);
    } else {
        console.log(`Plans for user (${plans.length}):`);
        console.log(JSON.stringify(plans, null, 2));
    }
}

findUserAndPlans();
