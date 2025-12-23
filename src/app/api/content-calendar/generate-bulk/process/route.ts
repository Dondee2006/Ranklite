import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

const ARTICLE_TYPES = [
  { type: "listicle", weight: 20 },
  { type: "how-to", weight: 25 },
  { type: "guide", weight: 20 },
  { type: "comparison", weight: 10 },
  { type: "review", weight: 10 },
  { type: "q-and-a", weight: 5 },
  { type: "tutorial", weight: 5 },
  { type: "problem-solution", weight: 5 },
];

const BATCH_SIZE = 5;

function selectArticleType(): string {
  const total = ARTICLE_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * total;
  for (const t of ARTICLE_TYPES) {
    random -= t.weight;
    if (random <= 0) return t.type;
  }
  return "guide";
}

export const maxDuration = 300;

export async function POST(request: Request) {
  const authHeader = request.headers.get("Authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId, month, year } = await request.json();

  // Fetch job and site separately to avoid join issues with RLS or complex schemas
  const { data: job, error: jobError } = await supabase
    .from("generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    console.error("Job not found:", jobError);
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  const { data: site, error: siteError } = await supabase
    .from("sites")
    .select("id, url, name")
    .eq("id", job.site_id)
    .single();

  if (siteError || !site) {
    console.error("Site info missing:", siteError);
    return NextResponse.json({ error: "Site info not found" }, { status: 400 });
  }

  // Allow processing if status is 'pending' OR 'processing' (since we are chaining)
  if (job.status === "completed" || job.status === "failed") {
    console.log("Job already finished with status:", job.status);
    return NextResponse.json({ success: true, message: "Job already finished" });
  }

  // Mark as processing if just started
  if (job.status === "pending") {
    await supabase
      .from("generation_jobs")
      .update({ status: "processing", updated_at: new Date().toISOString() })
      .eq("id", jobId);
  }

  try {
    const startDate = new Date(year, month, 1);
    const today = new Date();
    const startDay = month === today.getMonth() && year === today.getFullYear()
      ? Math.max(today.getDate(), 1)
      : 1;
    startDate.setDate(startDay);
    const startDateStr = formatDate(startDate);

    // Initial clean up of old planned articles for this period - ONLY ON FIRST CALL
    if (job.progress === 0) {
      console.log("First batch call: Cleaning up old planned articles...");
      await supabase
        .from("articles")
        .delete()
        .eq("site_id", site.id)
        .eq("status", "planned")
        .gte("scheduled_date", startDateStr);
    }

    const { data: existingArticles } = await supabase
      .from("articles")
      .select("scheduled_date")
      .eq("site_id", site.id)
      .gte("scheduled_date", startDateStr);

    const usedDates = new Set<string>((existingArticles || []).map(a => a.scheduled_date));
    const keywordPool = generateKeywordsForNiche(site.name, 30);
    const articlesToInsert = [];
    const currentDate = new Date(startDate);

    const totalToGenerate = job.total || 30;

    while (articlesToInsert.length < totalToGenerate) {
      const dateStr = formatDate(currentDate);
      if (usedDates.has(dateStr)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const keywordItem: any = keywordPool[articlesToInsert.length % keywordPool.length];
      const articleType = selectArticleType();
      const searchIntent = determineSearchIntent(articleType);
      const title = generateTitle(keywordItem, articleType);

      articlesToInsert.push({
        site_id: site.id,
        user_id: job.user_id,
        title,
        slug: generateSlug(title),
        keyword: keywordItem,
        secondary_keywords: generateSecondaryKeywords(keywordItem),
        search_intent: searchIntent,
        article_type: articleType,
        word_count: 3000 + Math.floor(Math.random() * 500),
        cta_placement: ["beginning", "middle", "end", "both"][Math.floor(Math.random() * 4)],
        status: "planned",
        scheduled_date: dateStr,
      });

      usedDates.add(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (articlesToInsert.length > 0) {
      console.log(`Inserting ${articlesToInsert.length} planned articles...`);
      await supabase.from("articles").insert(articlesToInsert);
    }

    await supabase
      .from("generation_jobs")
      .update({
        progress: totalToGenerate,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ success: true, count: articlesToInsert.length });

    return NextResponse.json({ success: true, progress: job.progress + 1 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Bulk generation process error:", error);
    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error: errorMessage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

async function generateArticleWithRetry(params: {
  title: string;
  keyword: string;
  secondaryKeywords: string[];
  articleType: string;
  wordCount: number;
  siteName: string;
  searchIntent: string;
}, retries = 2): Promise<Record<string, unknown> | null> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await generateArticleContent(params);
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Retrying generation (${i + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

async function generateArticleContent(params: {
  title: string;
  keyword: string;
  secondaryKeywords: string[];
  articleType: string;
  wordCount: number;
  siteName: string;
  searchIntent: string;
}): Promise<Record<string, unknown> | null> {
  const prompt = `Write a comprehensive, SEO-optimized article with the following specifications:

Title: ${params.title}
Primary Keyword: ${params.keyword}
Secondary Keywords: ${params.secondaryKeywords.join(", ")}
Article Type: ${params.articleType}
Target Word Count: ${params.wordCount}
Search Intent: ${params.searchIntent}
Site Name: ${params.siteName}

Requirements:
1. Write in a natural, engaging, human tone
2. Include proper heading structure (H2, H3)
3. Use the primary keyword naturally throughout
4. Incorporate secondary keywords where relevant
5. Include a compelling introduction and conclusion
6. Add specific examples and actionable advice
7. Write in markdown format

Return a JSON object with:
{
  "content": "full article content in plain text",
  "htmlContent": "article in HTML format",
  "markdownContent": "article in markdown format",
  "metaDescription": "160 character SEO meta description",
  "outline": { "sections": ["section titles"] },
  "seoScore": 85,
  "readabilityScore": 75
}`;

  const { text } = await generateText({
    model: requesty("openai/gpt-4o"),
    system: "You are an expert SEO content writer. You MUST return ONLY valid JSON. No markdown backticks, no text before or after the JSON.",
    prompt,
    temperature: 0.7,
    maxOutputTokens: 4096,
  });

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error("AI Response was not JSON:", text);
    throw new Error("AI did not return a JSON object");
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON parse error:", e, "Raw match:", jsonMatch[0]);
    throw new Error("Failed to parse AI JSON response");
  }
}

function generateKeywordsForNiche(niche: string, count: number) {
  const templates = [
    `best ${niche} for small business`,
    `${niche} guide for 2025`,
    `how to automate ${niche} for growth`,
    `${niche} strategies for high rankings`,
    `${niche} for beginners: complete roadmap`,
    `advanced ${niche} for experts`,
    `${niche} tools to boost productivity`,
    `${niche} examples from successful sites`,
    `${niche} best practices for 10x growth`,
    `${niche} tutorial for non-technical owners`,
    `${niche} vs manual SEO: which is better?`,
    `${niche} alternatives for better results`,
    `common ${niche} mistakes to avoid`,
    `${niche} benefits for organic traffic`,
    `${niche} vs content marketing`,
    `free ${niche} resources and tools`,
    `${niche} checklist for perfect execution`,
    `${niche} templates for faster results`,
    `${niche} case study: $0 to $10k`,
    `${niche} statistics you must know`,
    `${niche} trends for the next generation`,
    `${niche} software: what to look for`,
    `${niche} services vs in-house teams`,
    `top 15 ${niche} hacks for 2025`,
    `${niche} pricing: is it worth the investment?`,
    `${niche} features for maximal authority`,
    `${niche} solutions for enterprise scale`,
    `${niche} workflow for maximum efficiency`,
    `${niche} for local business SEO`,
    `${niche} secrets the pros use`,
  ];
  return templates.slice(0, Math.min(count, templates.length));
}

function generateSecondaryKeywords(primary: string): string[] {
  return [
    `${primary} 2025`,
    `best ${primary}`,
    `${primary} tips`,
    `${primary} guide`,
    `how to ${primary}`,
  ].slice(0, 5);
}

function determineSearchIntent(articleType: string): string {
  const intents: Record<string, string> = {
    listicle: "informational",
    comparison: "commercial",
    "how-to": "informational",
    guide: "informational",
    review: "commercial",
    "q-and-a": "informational",
    tutorial: "informational",
    "problem-solution": "transactional",
  };
  return intents[articleType] || "informational";
}

function generateTitle(keyword: string, articleType: string): string {
  const templates: Record<string, string[]> = {
    listicle: [
      `15 Best ${capitalizeFirst(keyword)} Tips for Exponential Growth in 2025`,
      `7 ${capitalizeFirst(keyword)} Strategies the Pros Don't Want You to Know`,
      `The Ultimate ${capitalizeFirst(keyword)} Masterclass: 15 Proven Tactics`,
      `12 Creative ${capitalizeFirst(keyword)} Ideas to Dominate Your Niche`,
    ],
    comparison: [
      `${capitalizeFirst(keyword)} vs The Competition: An Unfiltered 2025 Comparison`,
      `Is ${capitalizeFirst(keyword)} Still the Best? A Head-to-Head Deep Dive`,
      `Comparing the Top-Rated ${capitalizeFirst(keyword)} Solutions of 2025`,
    ],
    "how-to": [
      `The Definitive Guide on How to ${capitalizeFirst(keyword)} from Scratch`,
      `Mastering ${capitalizeFirst(keyword)}: A Step-by-Step Roadmap to Success`,
      `The Efficient Way to ${capitalizeFirst(keyword)} (Tested and Validated)`,
    ],
    guide: [
      `The 2025 Ultimate Guide to ${capitalizeFirst(keyword)} Mastery`,
      `Everything You Ever Wanted to Know About ${capitalizeFirst(keyword)}`,
      `${capitalizeFirst(keyword)} Demystified: The Comprehensive Handbook`,
    ],
    review: [
      `${capitalizeFirst(keyword)} Review: Is It the Game-Changer You Need?`,
      `Testing ${capitalizeFirst(keyword)}: An Honest, In-Depth Performance Review`,
      `${capitalizeFirst(keyword)}: The Good, The Bad, and The Verdict`,
    ],
    "q-and-a": [
      `${capitalizeFirst(keyword)} Insider Secrets: Your Toughest Questions Answered`,
      `The ${capitalizeFirst(keyword)} FAQ: Expert Insights for 2025`,
      `Everything You Need to Ask About ${capitalizeFirst(keyword)} (Answered)`,
    ],
    tutorial: [
      `${capitalizeFirst(keyword)} Masterclass: From Beginner to Pro in 30 Minutes`,
      `A Complete, Practical Tutorial on ${capitalizeFirst(keyword)} Mastery`,
      `Learn ${capitalizeFirst(keyword)} the Smart Way: A Detailed Step-by-Step`,
    ],
    "problem-solution": [
      `Struggling with ${capitalizeFirst(keyword)}? Here's the Permanent Fix`,
      `Solving the Most Frustrating ${capitalizeFirst(keyword)} Challenges`,
      `${capitalizeFirst(keyword)} Not Working for You? Try This Proven Solution`,
    ],
  };

  const options = templates[articleType] || templates.guide;
  return options[Math.floor(Math.random() * options.length)];
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
