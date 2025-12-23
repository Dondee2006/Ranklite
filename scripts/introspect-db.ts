import { createClient } from "@supabase/supabase-js";
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
    const { data, error } = await supabase
        .rpc('get_tables'); // Hope there is an RPC for this, or use a query that likely exists

    if (error) {
        // Fallback: search for autopilot_settings explicitly
        const { data: settings, error: settingsError } = await supabase.from('autopilot_settings').select('count', { count: 'exact', head: true });
        console.log("Autopilot settings count:", settingsError ? settingsError.message : settings);

        // Check sites
        const { data: sites, error: sitesError } = await supabase.from('sites').select('count', { count: 'exact', head: true });
        console.log("Sites count:", sitesError ? sitesError.message : sites);
    } else {
        console.log("Tables:", data);
    }
}

listTables();
