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

async function setPaidStatus() {
    const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d"; // dondorian7@gmail.com

    const { data, error } = await supabase
        .from('profiles')
        .update({ is_paid: true })
        .eq('id', userId)
        .select();

    if (error) {
        console.error("Error updating profile:", error);
    } else {
        console.log("Successfully set is_paid to true for user profile.");
        console.log(JSON.stringify(data, null, 2));
    }
}

setPaidStatus();
