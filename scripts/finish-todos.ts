import { runWorkerCycle } from "../src/lib/backlink-engine";
import * as fs from "fs";
import * as path from "path";

// Manual env loader for script
function loadEnv() {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        content.split("\n").forEach(line => {
            const lineContent = line.trim();
            if (!lineContent || lineContent.startsWith("#")) return;
            const [key, ...value] = lineContent.split("=");
            if (key && value) {
                process.env[key.trim()] = value.join("=").trim();
            }
        });
    }
}

loadEnv();

async function finishTodos() {
    const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d";
    console.log(`Starting to finish backlink todos for user ${userId}...`);

    let processedCount = 0;
    let failedCount = 0;
    let consecutiveNoTaskCount = 0;

    while (processedCount < 20) { // Safety cap
        try {
            const result = await runWorkerCycle(userId);
            
            if (!result) {
                consecutiveNoTaskCount++;
                if (consecutiveNoTaskCount > 2) break; // Truly no more tasks
                console.log("No task found, waiting 1s...");
                await new Promise(r => setTimeout(r, 1000));
                continue;
            }

            consecutiveNoTaskCount = 0;
            processedCount++;
            
            if (result.success) {
                console.log(`✅ Processed task ${result.task_id}: ${result.status} ${result.backlink_url || ""}`);
            } else {
                console.log(`⚠️ Task ${result.task_id} failed: ${result.error_message || "Unknown error"}`);
                failedCount++;
            }
        } catch (error: any) {
            console.error(`❌ Worker cycle error: ${error.message}`);
            failedCount++;
        }
    }

    console.log(`\n--- Summary ---`);
    console.log(`Total processed: ${processedCount}`);
    console.log(`Failed/Skipped: ${failedCount}`);
    console.log(`Finished todos.`);
}

finishTodos();
