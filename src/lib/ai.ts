import { openai } from "@ai-sdk/openai";

export const ai = openai("gpt-4.1");

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
