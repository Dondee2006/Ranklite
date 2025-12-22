import { createRequesty } from "@requesty/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const requestyApiKey = process.env.REQUESTY_API_KEY;

export const requesty = requestyApiKey 
  ? createRequesty({ apiKey: requestyApiKey })
  : (model: string) => openai(model.replace("openai/", ""));

// Use openai/gpt-4o as default through Requesty gateway (provider prefix required)
const modelName = process.env.REQUESTY_MODEL_NAME || "openai/gpt-4o";

export const ai = requesty(modelName);

export async function generateTopics() {
  const prompt = "Generate 30 SEO-optimized blog article topics for a new website. Return JSON array only.";
  const { text } = await generateText({
    model: ai,
    prompt,
  });
  return JSON.parse(text);
}

export async function generateArticle(topic: string) {
  const prompt = `Write a 1200+ word SEO article in clean HTML. Topic: ${topic}. Include intro, h2 sections, conclusion.`;
  const { text } = await generateText({
    model: ai,
    prompt,
  });
  return text;
}
