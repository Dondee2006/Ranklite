import { createRequesty } from "@requesty/ai-sdk";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const requestyApiKey = process.env.REQUESTY_API_KEY;

export const requesty = requestyApiKey
  ? createRequesty({ apiKey: requestyApiKey })
  : (model: string) => openai(model.replace("openai/", ""));

// Use openai/gpt-4o-mini as default through Requesty gateway (cheaper, higher quota)
const modelName = process.env.REQUESTY_MODEL_NAME || "openai/gpt-4o-mini";

export const ai = requesty(modelName);

export async function generateTopics() {
  const prompt = "Generate 30 SEO-optimized blog article topics for a new website. Return JSON array only.";
  const response = await ai.generate({ prompt });
  return JSON.parse(response.text());
}

export async function generateArticle(topic: string) {
  const prompt = `Write a 1200+ word SEO article in clean HTML. Topic: ${topic}. Include intro, h2 sections, conclusion.`;
  const response = await ai.generate({ prompt });
  return response.text();
}
