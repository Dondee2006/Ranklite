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

    try {
        const { text } = await generateText({
            model: requesty("openai/gpt-4o-mini"),
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
    }
}

testRequesty();
