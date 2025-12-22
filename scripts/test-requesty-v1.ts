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

console.log("Testing Requesty with /v1 suffix...");
console.log("API Key found:", !!process.env.REQUESTY_API_KEY);

const requestyWithV1 = createOpenAI({
    apiKey: process.env.REQUESTY_API_KEY,
    baseURL: "https://router.requesty.ai/v1",
});

async function test() {
    try {
        const { text } = await generateText({
            model: requestyWithV1("gpt-4o"),
            prompt: "Say hello in 5 words",
            maxOutputTokens: 20,
        });

        console.log("✅ SUCCESS! Response:", text);
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        console.error("Status:", error.statusCode);
        console.error("Response:", error.responseBody);
    }
}

test();
