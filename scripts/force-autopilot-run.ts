
import { AutopilotEngine } from "@/lib/services/autopilot-engine";
import dotenv from "dotenv";
import path from "path";

// Load env (hacky for scripts)
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function main() {
    console.log("--- Forcing Autopilot Run ---");
    try {
        const results = await AutopilotEngine.runForAllSites();
        console.log("Results:", JSON.stringify(results, null, 2));
    } catch (error) {
        console.error("Autopilot execution failed:", error);
    }
}

main();
