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
  console.log("Process received Auth Header:", authHeader);
  console.log("Server Expects Secret:", process.env.CRON_SECRET);

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("Authorization mismatch!");
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
    // Phase 1: AI-Powered Topic Clustering
    console.log(`Generating clusters for niche: "${site.niche || site.name}"`);
    const clustersData = await generateTopicClusters(site.niche || site.name, 30);
    console.log("AI Cluster Data received");

    const currentDate = new Date(startDate);
    const totalToGenerate = job.total || 30;

    // Flatten clusters into a sequence of slots
    // We want to distribute Pillars first, then Spokes
    const planSlots: any[] = new Array(totalToGenerate).fill(null);

    // Assign Pillars to Mondays (or first available day of week)
    let pillarIndex = 0;
    for (let i = 0; i < totalToGenerate && pillarIndex < clustersData.length; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      if (d.getDay() === 1) { // Monday
        const cluster = clustersData[pillarIndex];
        planSlots[i] = {
          keyword: cluster.pillar.keyword,
          title: cluster.pillar.title,
          volume: cluster.pillar.volume || 1000 + Math.floor(Math.random() * 5000),
          difficulty: cluster.pillar.difficulty || 20 + Math.floor(Math.random() * 40),
          cluster_name: cluster.topic,
          is_pillar: true,
          article_type: "guide"
        };
        pillarIndex++;
      }
    }

    // Fill remaining slots with Spokes
    let currentClusterIdx = 0;
    let currentSpokeIdx = 0;
    for (let i = 0; i < totalToGenerate; i++) {
      if (planSlots[i]) continue;

      // Find next available spoke
      while (currentClusterIdx < clustersData.length) {
        const cluster = clustersData[currentClusterIdx];
        if (cluster.spokes && currentSpokeIdx < cluster.spokes.length) {
          const spoke = cluster.spokes[currentSpokeIdx];
          planSlots[i] = {
            keyword: spoke.keyword,
            title: spoke.title,
            volume: spoke.volume || 100 + Math.floor(Math.random() * 900),
            difficulty: spoke.difficulty || 5 + Math.floor(Math.random() * 25),
            cluster_name: cluster.topic,
            is_pillar: false,
            article_type: selectArticleType()
          };
          currentSpokeIdx++;
          break;
        } else {
          currentClusterIdx++;
          currentSpokeIdx = 0;
        }
      }

      // Safety fallback if AI didn't give enough spokes
      if (!planSlots[i]) {
        planSlots[i] = {
          keyword: `${site.niche || site.name} article ${i}`,
          title: null,
          volume: 200 + Math.floor(Math.random() * 500),
          difficulty: 10 + Math.floor(Math.random() * 20),
          cluster_name: "General",
          is_pillar: false,
          article_type: selectArticleType()
        };
      }
    }

    const articlesToInsert = [];

    for (let i = 0; i < totalToGenerate; i++) {
      const dateStr = formatDate(currentDate);
      if (usedDates.has(dateStr)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }

      const slot = planSlots[i];
      const { keyword, cluster_name, is_pillar, article_type, title: aiTitle, volume, difficulty } = slot;
      const searchIntent = determineSearchIntent(article_type);
      const title = aiTitle || generateTitle(keyword, article_type);

      const articleData: Record<string, unknown> = {
        site_id: site.id,
        title,
        slug: generateSlug(title),
        keyword: keyword,
        secondary_keywords: generateSecondaryKeywords(keyword),
        search_intent: searchIntent,
        article_type,
        word_count: is_pillar ? 2500 + Math.floor(Math.random() * 500) : 1500 + Math.floor(Math.random() * 500),
        cta_placement: ["beginning", "middle", "end", "both"][Math.floor(Math.random() * 4)],
        status: "planned",
        scheduled_date: dateStr,
        cluster_name,
        is_pillar,
        volume,
        difficulty
      });

      try {
        const content = await generateArticleWithRetry({
          title: articleData.title as string,
          keyword: articleData.keyword as string,
          secondaryKeywords: articleData.secondary_keywords as string[],
          articleType: articleData.article_type as string,
          wordCount: articleData.word_count as number,
          siteName: site.name,
          searchIntent: articleData.search_intent as string,
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
        console.error(`Failed to generate content for article ${currentProgress + 1}:`, error);
        // Keep as planned status if content generation fails
      }

      await supabase.from("articles").insert(articleData);

      const nextProgress = currentProgress + 1;
      const isFinished = nextProgress >= totalToGenerate;

      await supabase
        .from("generation_jobs")
        .update({
          progress: nextProgress,
          status: isFinished ? "completed" : "processing",
          completed_at: isFinished ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", jobId);

      // Trigger next batch if not finished
      if (!isFinished) {
        let origin = new URL(request.url).origin;
        if (process.env.NODE_ENV === "development" && !origin.includes("localhost")) {
          origin = "http://localhost:3000";
        }
        const processUrl = `${origin}/api/content-calendar/generate-bulk/process`;

        console.log(`Triggering next batch hit: ${nextProgress + 1}`);

        // Fire and forget (self-chain)
        (async () => {
          try {
            await fetch(processUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CRON_SECRET}`
              },
              body: JSON.stringify({ jobId, month, year }),
            });
          } catch (err) {
            console.error("Self-chain trigger error:", err);
          }
        })();
      }
    }

    if (articlesToInsert.length > 0) {
      console.log(`Inserting ${articlesToInsert.length} planned articles...`);
      const { error: insertError } = await supabase.from("articles").insert(articlesToInsert);

      if (insertError) {
        console.error("Failed to insert planned articles:", insertError);
        throw new Error(`Database Insert Failed: ${insertError.message}`);
      }
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

async function generateTopicClusters(niche: string, targetCount: number): Promise<any[]> {
  const prompt = `Act as a senior SEO Strategist. Create a detailed "Hub and Spoke" topic cluster map for a website in the "${niche}" niche.
  
  TARGET: Total of ${targetCount} articles.
  STRUCTURE:
  1. Identify 3-4 major semantic topics (Clusters).
  2. For each Cluster, define 1 "Pillar" article (comprehensive, broad authority).
  3. For each Cluster, define 8-9 "Spoke" articles (specific, long-tail keywords that support the Pillar).
  
  OUTPUT: Return a JSON array of clusters:
  [
    {
      "topic": "Cluster Category Name",
      "pillar": { 
        "keyword": "Primary Authority Keyword", 
        "title": "Engaging, Click-Worthy Title",
        "volume": 2500,
        "difficulty": 45
      },
      "spokes": [
        { 
          "keyword": "Long-tail Keyword 1", 
          "title": "Natural Title for Spoke 1",
          "volume": 450,
          "difficulty": 12
        },
        ...
      ]
    }
  ]
  
  Quality Requirements:
  - Generate realistic estimated monthly search volume and keyword difficulty (0-100).
  - Keywords must be high-volume/low-competition style.
  - The Spokes must logically connect to their Cluster Pillar.
  - NON-REPETITIVE TITLES: Do NOT start every title with the same words. Varied phrasing is required.
  - Do NOT spam the niche name in every title. Use synonyms or imply the topic.
  - RETURN ONLY VALID JSON.`;

  try {
    const { text } = await generateText({
      model: requesty("openai/gpt-4o-mini"),
      system: "You are a world-class SEO strategist. You only speak JSON.",
      prompt,
      temperature: 0.8,
    });

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("Could not parse AI cluster JSON");
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Failed to generate AI clusters:", error);
    // Fallback static clusters
    return [
      {
        topic: "Fundamentals",
        pillar: { keyword: `${niche} guide`, title: `The Combined Guide to ${niche} for Beginners`, volume: 1500, difficulty: 30 },
        spokes: [
          { keyword: `best ${niche} tips`, title: `10 Best ${niche} Tips You Need to Know`, volume: 800, difficulty: 15 },
          { keyword: `how to ${niche}`, title: `How to Master ${niche} in 2025`, volume: 1200, difficulty: 25 },
          { keyword: `${niche} for beginners`, title: `Getting Started with ${niche}: A complete Roadmap`, volume: 2000, difficulty: 20 },
          { keyword: `${niche} tools`, title: `Top 5 ${niche} Tools for Better Results`, volume: 600, difficulty: 12 },
          { keyword: `${niche} benefits`, title: `Why ${niche} Matters for Your Business`, volume: 400, difficulty: 10 },
          { keyword: `${niche} myths`, title: `Common ${niche} Myths Debunked`, volume: 300, difficulty: 8 },
          { keyword: `${niche} history`, title: `The History and Evolution of ${niche}`, volume: 200, difficulty: 5 },
          { keyword: `${niche} checklist`, title: `Your Ultimate ${niche} Success Checklist`, volume: 500, difficulty: 14 },
          { keyword: `${niche} tutorial`, title: `A Step-by-Step ${niche} Tutorial`, volume: 900, difficulty: 18 }
        ]
      },
      {
        topic: "Advanced",
        pillar: { keyword: `advanced ${niche}`, title: `Advanced ${niche} Strategies for Experts`, volume: 2200, difficulty: 55 },
        spokes: [
          { keyword: `${niche} strategies`, title: `Proven ${niche} Strategies that Work`, volume: 1100, difficulty: 40 },
          { keyword: `${niche} automation`, title: `Automating ${niche} for Scale`, volume: 500, difficulty: 35 },
          { keyword: `${niche} scaling`, title: `How to Scale Your ${niche} Efforts`, volume: 400, difficulty: 30 },
          { keyword: `${niche} psychology`, title: `The Psychology Behind Effective ${niche}`, volume: 300, difficulty: 25 },
          { keyword: `${niche} future`, title: `The Future of ${niche}: What to Expect`, volume: 700, difficulty: 45 },
          { keyword: `${niche} expert tips`, title: `Insider ${niche} Tips from Industry Leaders`, volume: 600, difficulty: 50 },
          { keyword: `${niche} case studies`, title: `Real World ${niche} Case Studies`, volume: 450, difficulty: 20 },
          { keyword: `${niche} ROI`, title: `Measuring the ROI of your ${niche} Campaigns`, volume: 350, difficulty: 28 },
          { keyword: `${niche} methodology`, title: `A Deep Dive into ${niche} Methodology`, volume: 250, difficulty: 32 }
        ]
      },
      {
        topic: "Commercial",
        pillar: { keyword: `best ${niche} solutions`, title: `The Best ${niche} Solutions Rated & Reviewed`, volume: 1800, difficulty: 48 },
        spokes: [
          { keyword: `${niche} reviews`, title: `In-Depth ${niche} Software Reviews`, volume: 950, difficulty: 38 },
          { keyword: `${niche} comparison`, title: `${niche} Tools Comparison: Which is Best?`, volume: 1100, difficulty: 42 },
          { keyword: `${niche} vs alternatives`, title: `${niche} vs The Competition`, volume: 1300, difficulty: 45 },
          { keyword: `top ${niche} software`, title: `Top Rated ${niche} Software`, volume: 850, difficulty: 35 },
          { keyword: `${niche} pricing`, title: `Understanding ${niche} Pricing Models`, volume: 400, difficulty: 25 },
          { keyword: `${niche} features`, title: `Essential ${niche} Features to Look For`, volume: 300, difficulty: 20 },
          { keyword: `${niche} services`, title: `Hiring ${niche} Services vs In-House`, volume: 250, difficulty: 15 },
          { keyword: `${niche} ROI analysis`, title: `Is ${niche} Worth the Investment?`, volume: 350, difficulty: 22 },
          { keyword: `${niche} testimonials`, title: `What Users Say About Top ${niche} Tools`, volume: 200, difficulty: 12 }
        ]
      }
    ];
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
