import { runWorkerCycle } from "../src/lib/backlink-engine";

async function main() {
  const userIds = [
    "2e893c56-66e4-44c5-bf00-7a50787fc09d",
    "b925e3df-f92e-4fa2-b5b2-cae26a599e4d"
  ];

  console.log("Starting to process pending backlink tasks...");

  for (const userId of userIds) {
    console.log(`Processing tasks for user: ${userId}`);
    let processedCount = 0;
    let result;
    
    // Each runWorkerCycle processes ONE task. We loop until it returns null (no more pending tasks).
    do {
      try {
        result = await runWorkerCycle(userId);
        if (result) {
          processedCount++;
          console.log(`  [${processedCount}] Task ${result.task_id}: ${result.status} ${result.success ? "✅" : "❌"}`);
          if (result.error_message) {
             console.log(`      Error: ${result.error_message}`);
          }
        }
      } catch (error) {
        console.error(`  Error processing task for user ${userId}:`, error);
        result = null;
      }
    } while (result !== null);
    
    console.log(`Finished processing ${processedCount} tasks for user ${userId}.\n`);
  }

  console.log("All pending tasks processed.");
}

main().catch(console.error);
