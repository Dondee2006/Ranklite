import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import * as fs from "fs";
import * as path from "path";

// Manual env loader
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

// Intercept fetch to see what URL is being called
const originalFetch = global.fetch;
global.fetch = async (input: any, init?: any) => {
    console.log("🔍 Fetch called with:");
    console.log("  URL:", typeof input === 'string' ? input : input.url);
    console.log("  Method:", init?.method || 'GET');
    const result = await originalFetch(input, init);
    console.log("  Status:", result.status);
    return result;
} as any;

const requesty = createOpenAI({
    apiKey: process.env.REQUESTY_API_KEY,
    baseURL: "https://router.requesty.ai/v1",
});

async function test() {
    console.log("\nTesting with debug logging...\n");

    try {
        const { text } = await generateText({
            model: requesty("openai/gpt-4o"),
            prompt: "Say hello",
            maxOutputTokens: 10,
        });

        console.log("\n✅ SUCCESS! Response:", text);
    } catch (error: any) {
        console.log("\n❌ Error:", error.message);
    }
}

test();
