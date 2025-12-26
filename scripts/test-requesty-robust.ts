import { createRequesty } from "@requesty/ai-sdk";
import { generateText } from "ai";
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

const requesty = createRequesty({
    apiKey: process.env.REQUESTY_API_KEY,
});

async function testRequesty() {
    console.log("Testing Requesty Integration with @requesty/ai-sdk...");
    console.log("API Key found:", !!process.env.REQUESTY_API_KEY);

    const models = ["openai/gpt-4o-mini", "anthropic/claude-3-5-haiku-20241022", "google/gemini-1.5-flash"];

    for (const modelId of models) {
        console.log(`\nTesting with model: ${modelId}`);
        try {
            const { text } = await generateText({
                model: requesty(modelId),
                prompt: "Hello, this is a test. Please respond with 'OK'.",
                maxOutputTokens: 10,
            });

            console.log(`Response from ${modelId}:`, text);
            console.log(`✅ Verification Passed for ${modelId}!`);
        } catch (error: any) {
            console.error(`❌ Verification Failed for ${modelId}:`, error.message);
        }
    }
}

testRequesty();
