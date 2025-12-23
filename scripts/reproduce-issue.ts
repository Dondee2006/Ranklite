import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { generateText } from "ai";
import { createRequesty } from "@requesty/ai-sdk";

dotenv.config({ path: '.env.local' });

const requestyApiKey = process.env.REQUESTY_API_KEY;
const requesty = createRequesty({ apiKey: requestyApiKey || "" });

async function testGeneration() {
    const site = {
        name: "Ranklite",
        niche: "SEO Automation",
        target_audience: "Small Business Owners and Bloggers",
        brand_voice: "Helpful, authoritative, yet friendly and clear.",
        description: "Ranklite is an AI-powered SEO automation platform that helps businesses grow organic traffic through automated Article planning, publishing, Backlinks and Free Tools while you sleep."
    };

    const articleTitle = "Best Ranklite: Pros, Cons & Verdict";
    const sectionTitle = "Unbiased Review Introduction";
    const keyword = "best Ranklite";
    const secondaryKeywords = ["best Ranklite 2025", "best best Ranklite"];
    const wordCount = 300;

    console.log("Starting test generation...");

    try {
        const { text } = await generateText({
            model: requesty("openai/gpt-4o"),
            prompt: `Write a "Smart Content" section for an SEO article that readers actually enjoy.

ARTICLE TITLE: ${articleTitle}
SECTION TITLE: ${sectionTitle}
PRIMARY KEYWORD: ${keyword}
SECONDARY KEYWORDS: ${secondaryKeywords.join(", ")}
TARGET LENGTH: ~${wordCount} words

WEBSITE CONTEXT:
- Site Name: ${site.name}
- Niche: ${site.niche || "General"}
- Target Audience: ${site.target_audience || "General readers"}
- Brand Voice: ${site.brand_voice || "Empathetic, expert, and actionable"}
- Description: ${site.description || ""}

REQUIREMENTS:
1. "SMART CONTENT" STYLE: Use a conversational yet authoritative tone. Use metaphors, analogies, or practical examples to make points clear. Speak directly to the reader ("you").
2. EMPATHETIC & ACTIONABLE: Acknowledge the reader's pain points and provide specific, high-value advice. Avoid generic fluff or surface-level "professional" filler.
3. KEYWORD INTEGRATION: Naturally weave the primary and secondary keywords into the narrative.
4. STRUCTURE: Use short paragraphs (2-3 sentences), bold key terms for scannability, and use bullet points or numbered lists if it adds value.
5. FLOW: Ensure the section transitions logically and maintains high engagement.
6. NO TITLE: Do NOT include the section title or the article title in the output.

Generate the section content now:`,
            maxOutputTokens: Math.ceil(wordCount * 2),
        });

        console.log("SUCCESS!");
        console.log("Text:", text);
    } catch (error: any) {
        console.error("FAILURE!");
        console.error("Error message:", error.message);
        console.error("Full error:", JSON.stringify(error, null, 2));
    }
}

testGeneration();
