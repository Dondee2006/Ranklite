import { supabaseAdmin as supabase } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";
import { requesty } from "@/lib/ai";
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
    .select("id, domain, name")
    .eq("id", job.site_id)
    .single();

  if (siteError || !site) {
    console.error("Site info missing:", siteError);
    return NextResponse.json({ error: "Site info not found" }, { status: 400 });
  }

  if (job.status !== "pending") {
    console.log("Job already processed or in progress:", job.status);
    return NextResponse.json({ success: true, message: "Job already processed" });
  }

  await supabase
    .from("generation_jobs")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", jobId);

  try {
    const startDate = new Date(year, month, 1);
    const today = new Date();
    const startDay = month === today.getMonth() && year === today.getFullYear()
      ? Math.max(today.getDate(), 1)
      : 1;
    startDate.setDate(startDay);
    const startDateStr = formatDate(startDate);

    // Initial clean up of old planned articles for this period
    await supabase
      .from("articles")
      .delete()
      .eq("site_id", site.id)
      .eq("status", "planned")
      .gte("scheduled_date", startDateStr);

    const { data: existingArticles } = await supabase
      .from("articles")
      .select("scheduled_date")
      .eq("site_id", site.id)
      .gte("scheduled_date", startDateStr);

    const usedDates = new Set<string>((existingArticles || []).map(a => a.scheduled_date));

    const keywordPool = generateKeywordsForNiche(site.name, 30);
    const currentDate = new Date(startDate);
    let progress = 0;

    // Generate in batches to avoid extreme long-running requests if possible
    for (let batch = 0; batch < 6; batch++) {
      const batchArticles = [];

      for (let i = 0; i < BATCH_SIZE && progress < 30; i++) {
        let dateStr = formatDate(currentDate);
        while (usedDates.has(dateStr)) {
          currentDate.setDate(currentDate.getDate() + 1);
          dateStr = formatDate(currentDate);
        }

        const keyword = keywordPool[progress % keywordPool.length];
        const articleType = selectArticleType();
        const searchIntent = determineSearchIntent(articleType);
        const title = generateTitle(keyword, articleType);

        const articleData: any = {
          site_id: site.id,
          title,
          slug: generateSlug(title),
          keyword,
          secondary_keywords: generateSecondaryKeywords(keyword),
          search_intent: searchIntent,
          article_type: articleType,
          word_count: 1500 + Math.floor(Math.random() * 1000),
          cta_placement: ["beginning", "middle", "end"][Math.floor(Math.random() * 3)],
          status: "planned",
          scheduled_date: dateStr,
        };

        try {
          const content = await generateArticleWithRetry({
            title: articleData.title,
            keyword: articleData.keyword,
            secondaryKeywords: articleData.secondary_keywords,
            articleType: articleData.article_type,
            wordCount: articleData.word_count,
            siteName: site.name,
            searchIntent: articleData.search_intent,
          });

          if (content) {
            articleData.content = content.content;
            articleData.html_content = content.htmlContent;
            articleData.markdown_content = content.markdownContent;
            articleData.meta_description = content.metaDescription;
            articleData.outline = content.outline;
            articleData.status = "generated";
            articleData.seo_score = content.seoScore || 85;
            articleData.readability_score = content.readabilityScore || 75;
          }
        } catch (error) {
          console.error(`Failed to generate content for article ${progress + 1}:`, error);
          // Keep as planned status if content generation fails
        }

        batchArticles.push(articleData);
        usedDates.add(dateStr);
        currentDate.setDate(currentDate.getDate() + 1);
        progress++;
      }

      if (batchArticles.length > 0) {
        const { error: insertError } = await supabase.from("articles").insert(batchArticles);
        if (insertError) {
          console.error("Batch insert error:", insertError);
        }

        await supabase
          .from("generation_jobs")
          .update({
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", jobId);
      }
    }

    await supabase
      .from("generation_jobs")
      .update({
        status: "completed",
        progress: 30,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Bulk generation process error:", error);
    await supabase
      .from("generation_jobs")
      .update({
        status: "failed",
        error: error.message,
        updated_at: new Date().toISOString(),
      })
      .eq("id", jobId);

    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function generateArticleWithRetry(params: any, retries = 2): Promise<any> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await generateArticleContent(params);
    } catch (error) {
      if (i === retries) throw error;
      console.log(`Retrying generation (${i + 1}/${retries})...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

async function generateArticleContent(params: {
  title: string;
  keyword: string;
  secondaryKeywords: string[];
  articleType: string;
  wordCount: number;
  siteName: string;
  searchIntent: string;
}): Promise<any> {
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
    `best ${niche}`, `${niche} guide`, `how to ${niche}`, `${niche} tips`,
    `${niche} for beginners`, `advanced ${niche}`, `${niche} strategies`,
    `${niche} tools`, `${niche} examples`, `${niche} best practices`,
    `${niche} tutorial`, `${niche} review`, `${niche} comparison`,
    `${niche} alternatives`, `${niche} mistakes`, `${niche} benefits`,
    `${niche} vs`, `free ${niche}`, `${niche} checklist`, `${niche} templates`,
    `${niche} case study`, `${niche} statistics`, `${niche} trends 2025`,
    `${niche} software`, `${niche} services`, `top ${niche}`,
    `${niche} pricing`, `${niche} features`, `${niche} solutions`, `${niche} workflow`,
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
    listicle: [`10 Best ${capitalizeFirst(keyword)} Tips for 2025`],
    "how-to": [`How to ${capitalizeFirst(keyword)}: Step-by-Step Guide`],
    guide: [`Ultimate Guide to ${capitalizeFirst(keyword)}`],
    comparison: [`${capitalizeFirst(keyword)}: Complete Comparison Guide`],
    review: [`${capitalizeFirst(keyword)} Review: Is It Worth It?`],
    "q-and-a": [`${capitalizeFirst(keyword)}: Your Questions Answered`],
    tutorial: [`${capitalizeFirst(keyword)} Tutorial for Beginners`],
    "problem-solution": [`${capitalizeFirst(keyword)} Problems? Here's How to Fix Them`],
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
