import { generateText } from "ai";
import { ai } from "../src/lib/ai";

async function testRequesty() {
    console.log("Testing Ranklite Requesty Integration via lib/ai.ts...");

    try {
        const { text } = await generateText({
            model: ai,
            prompt: "Hello, this is a test. Please respond with 'Ranklite Requesty Integration Successful'.",
            maxOutputTokens: 20,
        });

        console.log("Response:", text);
        if (text.includes("Successful")) {
            console.log("✅ Verification Passed!");
        } else {
            console.log("⚠️ Verification Failed: Unexpected response.");
        }
    } catch (error) {
        console.error("❌ Verification Failed Error:", error);
    }
}

testRequesty();
