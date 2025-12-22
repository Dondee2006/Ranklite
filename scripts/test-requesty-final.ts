import { generateText } from "ai";
import { ai } from "../src/lib/ai";

async function testRequesty() {
    console.log("Testing Requesty with corrected model names (openai/gpt-4o)...");

    try {
        const { text } = await generateText({
            model: ai,
            prompt: "Say hello in 5 words",
            maxOutputTokens: 20,
        });

        console.log("✅ SUCCESS! Response:", text);
        console.log("\nRequesty integration is working correctly!");
    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.statusCode) console.error("Status:", error.statusCode);
        if (error.responseBody) console.error("Response:", error.responseBody);
    }
}

testRequesty();
