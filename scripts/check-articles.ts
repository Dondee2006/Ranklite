import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log("Checking articles...");

    // 1. Check total count
    const { count } = await supabase.from("articles").select("*", { count: "exact" });
    console.log(`Total Articles in DB: ${count}`);

    // 2. Check recent articles
    const { data: articles, error } = await supabase
        .from("articles")
        .select("id, title, scheduled_date, site_id, cluster_name, is_pillar, keyword")
        .order("created_at", { ascending: false })
        .limit(5);

    if (error) console.error("Error fetching articles:", error);
    else {
        console.log("Recent 5 articles:");
        console.table(articles);
    }

    // 3. Check sites with NICHE
    const { data: sites } = await supabase
        .from("sites")
        .select("id, name, niche, created_at")
        .order("created_at", { ascending: false });

    console.log("Sites in DB (Ordered by Newest):");
    console.table(sites);
}

check();
