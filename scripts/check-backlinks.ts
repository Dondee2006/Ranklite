
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBacklinks() {
    console.log("Checking Backlink System Status...\n");

    // 1. Check Sites
    const { data: sites, error: siteError } = await supabase
        .from("sites")
        .select("*");

    if (siteError) {
        console.error("Error fetching sites:", siteError);
    } else {
        console.log(`Found ${sites.length} sites.`);
        sites.forEach(s => console.log(`- Site ID: ${s.id} | URL: ${s.url} | Name: ${s.name}`));
    }

    // 2. Check Campaigns
    const { data: campaigns, error: campError } = await supabase
        .from("backlink_campaigns")
        .select("*");

    if (campError) {
        console.error("Error fetching campaigns:", campError);
        return;
    }

    console.log(`Found ${campaigns.length} campaigns.`);
    campaigns.forEach((c) => {
        console.log(`- User: ${c.user_id} | Daily limit: ${c.max_daily_submissions} | Total: ${c.total_backlinks}`);
    });

    // 2. Check Tasks Stats
    const { data: tasks, error: taskError } = await supabase
        .from("backlink_tasks")
        .select("status, scheduled_for, created_at");

    if (taskError) {
        console.error("Error fetching tasks:", taskError);
        return;
    }

    const stats = tasks.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    console.log("\nTask Statistics:");
    console.table(stats);

    // 3. Check Pending Tasks Schedule
    const pendingTasks = tasks.filter(t => t.status === "pending");
    if (pendingTasks.length > 0) {
        // Sort by scheduled_for
        pendingTasks.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());

        console.log(`\nNext 5 Pending Tasks (Total: ${pendingTasks.length}):`);
        const now = new Date();

        pendingTasks.slice(0, 5).forEach((t, i) => {
            const scheduled = new Date(t.scheduled_for);
            const isPast = scheduled <= now;
            console.log(`${i + 1}. Scheduled: ${t.scheduled_for} (${isPast ? "READY" : "FUTURE"})`);
        });
    } else {
        console.log("\nNo pending tasks found.");
    }
}

checkBacklinks().catch(console.error);
