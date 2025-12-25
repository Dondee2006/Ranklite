
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkPlatforms() {
    console.log("Checking Backlink Platforms...");

    const { data: allPlatforms, error } = await supabase
        .from("backlink_platforms")
        .select("*");

    if (error) {
        console.error("Error:", error);
        return;
    }

    console.log(`Total Platforms: ${allPlatforms?.length || 0}`);

    const automated = allPlatforms?.filter(p => p.automation_allowed);
    console.log(`Automated Platforms: ${automated?.length || 0}`);

    if (allPlatforms && allPlatforms.length > 0) {
        console.log("Sample Platform:", allPlatforms[0]);
    }
}

checkPlatforms();
