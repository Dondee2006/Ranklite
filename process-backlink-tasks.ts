
import { runWorkerCycle } from "./src/lib/backlink-engine";

async function finishBacklinkTodos() {
  const userId = "2e893c56-66e4-44c5-bf00-7a50787fc09d";
  console.log(`Processing backlink tasks for user: ${userId}`);

  let processedCount = 0;
  let hasMore = true;

  while (hasMore && processedCount < 20) {
    console.log(`\n--- Cycle ${processedCount + 1} ---`);
    try {
      const result = await runWorkerCycle(userId);
      if (!result) {
        console.log("No more pending tasks for this user.");
        hasMore = false;
      } else {
        processedCount++;
        console.log(`Task ${result.task_id} processed: ${result.status}`);
        if (result.error_message) {
          console.log(`Error: ${result.error_message}`);
        }
        if (result.requires_manual_review) {
          console.log(`⚠️ Manual review required: ${result.manual_review_reason}`);
        }
      }
    } catch (error) {
      console.error("Worker cycle error:", error);
      hasMore = false;
    }
  }

  console.log(`\nFinished processing ${processedCount} tasks.`);
}

finishBacklinkTodos();
