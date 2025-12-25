
import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";

// Load dotenv FIRST
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// Then import modules that rely on env vars
const { createTasksForUser } = require("../src/lib/backlink-engine/task-queue");

const userId = "b925e3df-f92e-4fa2-b5b2-cae26a599e4d"; // Used from previous check
const websiteUrl = "https://example.com";
const siteName = "Example Site";
const description = "Test Description";

async function testCreation() {
    console.log("Testing Task Creation directly...");

    try {
        const fs = require('fs');
        const result = await createTasksForUser(userId, websiteUrl, siteName, description);
        console.log("Result:", result);
        fs.writeFileSync('task-creation-result.log', JSON.stringify(result, null, 2));
    } catch (e: any) {
        const fs = require('fs');
        console.error("Error creating tasks:", e);
        fs.writeFileSync('task-creation-result.log', `Error: ${e.message}\n${JSON.stringify(e)}`);
    }
}

testCreation();
