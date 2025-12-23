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

async function grantAccess() {
    const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d"; // dondorian7@gmail.com
    const planId = "pro"; // Valid plan ID from previous step

    // Set expiration to 100 years from now
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('user_plans')
        .upsert({
            user_id: userId,
            plan_id: planId,
            status: 'active'
        })
        .select();

    if (error) {
        console.error("Error granting access:", error);
    } else {
        console.log("Successfully granted Pro access to user.");
        console.log(data);
    }
}

grantAccess();
