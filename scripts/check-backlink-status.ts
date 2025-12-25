
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkStatus() {
    console.log("--- Backlink System Status Check ---\n");

    // 1. Check Active Campaigns
    const { data: campaigns, error: campError } = await supabase
        .from("backlink_campaigns")
        .select("*")
        .eq("status", "active");

    if (campError) {
        console.error("Error fetching campaigns:", campError.message);
        return;
    }

    console.log(`Active Campaigns: ${campaigns?.length || 0}`);
    if (campaigns && campaigns.length > 0) {
        campaigns.forEach((c) => {
            console.log(`- Campaign ID: ${c.id}`);
            console.log(`  User ID: ${c.user_id}`);
            console.log(`  Current Step: ${c.current_step}`);
            console.log(`  Last Scan: ${c.last_scan_at}`);
            console.log(`  Role: ${c.agent_role || 'Not set'}`);
            console.log("");
        });
    }

    // 2. Check Tasks
    const { count: totalTasks, data: allTasks } = await supabase
        .from("backlink_tasks")
        .select("*", { count: "exact" });

    console.log(`Total Tasks in DB: ${totalTasks}`);
    if (totalTasks && totalTasks > 0) {
        console.log("Sample Task:", JSON.stringify(allTasks[0], null, 2));
    }
}

checkStatus().catch(console.error);
