import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';

// Load env from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkCaseSensitivity() {
    const names = ['profiles', 'Profiles', 'PROFILES', 'User_Profiles', 'UserProfiles'];
    for (const n of names) {
        const { error } = await supabase.from(n).select('id').limit(1);
        if (!error) {
            console.log(`Table exists: ${n}`);
        } else if (error.code !== 'PGRST204' && error.code !== 'PGRST205') {
            console.log(`Table ${n} hit error: ${error.message} (code ${error.code})`);
        }
    }
}

checkCaseSensitivity();
