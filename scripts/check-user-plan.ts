
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import { getUserPlanAndUsage } from "../src/lib/usage-limits";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const userId = "b925e3df-f92e-4fa2-b5b2-cae26a599e4d";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkPlan() {
    console.log("Checking User Plan...");

    try {
        const { data: userPlan } = await supabase
            .from("user_plans")
            .select("*, plans(*)")
            .eq("user_id", userId)
            .eq("status", "active")
            .single();

        console.log("DB User Plan:", JSON.stringify(userPlan, null, 2));

        console.log("calling getUserPlanAndUsage functionality:");
        const result = await getUserPlanAndUsage(userId, supabase);
        console.log("Limits Result:", JSON.stringify(result, null, 2));

    } catch (e) {
        console.error("Error:", e);
    }
}

checkPlan();
