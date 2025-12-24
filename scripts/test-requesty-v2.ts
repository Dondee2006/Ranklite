import dotenv from "dotenv";
import path from "path";
import { generateText } from "ai";
import { requesty } from "../src/lib/ai";

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testAI() {
    console.log("Testing AI Generation...");
    console.log("REQUESTY_API_KEY present:", !!process.env.REQUESTY_API_KEY);
    console.log("OPENAI_API_KEY present:", !!process.env.OPENAI_API_KEY);

    try {
        const { text } = await generateText({
            model: requesty("openai/gpt-4o-mini"),
            prompt: "Say hello in JSON format: { \"message\": \"hello\" }",
        });

        console.log("AI Response:", text);
    } catch (error) {
        console.error("AI Generation Failed:", error);
    }
}

testAI();
