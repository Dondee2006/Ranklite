import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
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

const requesty = createOpenAI({
    apiKey: process.env.REQUESTY_API_KEY,
    baseURL: "https://router.requesty.ai", // Removed /v1
});

async function testRequesty() {
    console.log("Testing Requesty Integration (BaseURL without /v1)...");
    console.log("API Key found:", !!process.env.REQUESTY_API_KEY);

    try {
        const { text } = await generateText({
            model: requesty("gpt-4o"), // Trying without prefix first
            prompt: "Hello, this is a test. Please respond with 'Ranklite Requesty Integration Successful'.",
            maxOutputTokens: 20,
        });

        console.log("Response:", text);
        if (text.length > 5) {
            console.log("✅ Verification Passed!");
        } else {
            console.log("⚠️ Verification Failed: Unexpected response.");
        }
    } catch (error: any) {
        console.error("❌ Verification Failed Error:", error.message);
        if (error.responseBody) console.error("Response Body:", error.responseBody);

        console.log("\nTrying with optional model prefix 'openai/gpt-4o'...");
        try {
            const { text } = await generateText({
                model: requesty("openai/gpt-4o"),
                prompt: "Hello",
                maxOutputTokens: 20,
            });
            console.log("Response with prefix:", text);
            console.log("✅ Verification Passed with prefix!");
        } catch (err: any) {
            console.error("❌ Failed with prefix as well:", err.message);
        }
    }
}

testRequesty();
