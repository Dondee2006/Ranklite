import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
<<<<<<< HEAD
import { openai } from "@ai-sdk/openai";
=======
import { requesty } from "@/lib/ai";
>>>>>>> fc887e15397d1fac37f6e9ee1a57a550e2f70dbb
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

const TARGET_ARTICLE_COUNT = 30;

function selectArticleType(): string {
  const total = ARTICLE_TYPES.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * total;
  for (const t of ARTICLE_TYPES) {
    random -= t.weight;
    if (random <= 0) return t.type;
  }
  return "guide";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, year, niche, keywords, generateContent = true } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, name")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const startDate = new Date(year, month, 1);
  const today = new Date();
  const startDay = month === today.getMonth() && year === today.getFullYear()
    ? Math.max(today.getDate(), 1)
    : 1;
  startDate.setDate(startDay);
  const startDateStr = formatDate(startDate);

  await supabase
    .from("articles")
    .delete()
    .eq("site_id", site.id)
    .eq("status", "planned")
    .gte("scheduled_date", startDateStr);

  const { data: existingArticles, error: existingError } = await supabase
    .from("articles")
    .select("scheduled_date")
    .eq("site_id", site.id)
    .gte("scheduled_date", startDateStr);

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 });
  }

  const usedDates = new Set<string>((existingArticles || []).map(a => a.scheduled_date));

  const keywordPool = keywords?.length > 0
    ? keywords
    : generateKeywordsForNiche(niche || site.name, TARGET_ARTICLE_COUNT);

  const articles = [];
  const currentDate = new Date(startDate);
  while (articles.length < TARGET_ARTICLE_COUNT) {
    const dateStr = formatDate(currentDate);
    if (usedDates.has(dateStr)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const keyword = keywordPool[articles.length % keywordPool.length];
    const articleType = selectArticleType();
    const searchIntent = determineSearchIntent(articleType);

    const title = generateTitle(
      typeof keyword === "string" ? keyword : keyword.primary,
      articleType
    );

    const articleData: Record<string, unknown> = {
      site_id: site.id,
      title,
      slug: generateSlug(title),
      keyword: typeof keyword === "string" ? keyword : keyword.primary,
      secondary_keywords: typeof keyword === "string"
        ? generateSecondaryKeywords(keyword)
        : keyword.secondary || [],
      search_intent: searchIntent,
      article_type: articleType,
      word_count: 1500 + Math.floor(Math.random() * 1000),
      cta_placement: ["beginning", "middle", "end", "both"][Math.floor(Math.random() * 4)],
      status: "planned",
      scheduled_date: dateStr,
    };

    if (generateContent) {
      try {
        const content = await generateArticleContent({
          title: articleData.title,
          keyword: articleData.keyword,
          secondaryKeywords: articleData.secondary_keywords,
          articleType: articleData.article_type,
          wordCount: articleData.word_count,
          siteName: site.name,
          searchIntent: articleData.search_intent,
        });

        articleData.content = content.content;
        articleData.html_content = content.htmlContent;
        articleData.markdown_content = content.markdownContent;
        articleData.meta_description = content.metaDescription;
        articleData.outline = content.outline;
        articleData.status = "generated";
        articleData.seo_score = content.seoScore || 85;
        articleData.readability_score = content.readabilityScore || 75;
      } catch (error) {
        console.error(`Failed to generate content for article ${articles.length + 1}:`, error);
      }
    }

    articles.push(articleData);
    usedDates.add(dateStr);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  const { data, error } = await supabase
    .from("articles")
    .insert(articles)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

<<<<<<< HEAD
    return NextResponse.json({ success: true, articles: data, count: data?.length || 0 });
=======
  return NextResponse.json({ success: true, articles: data, count: data?.length || 0 });
>>>>>>> fc887e15397d1fac37f6e9ee1a57a550e2f70dbb
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
1. Write in a natural, engaging, human tone (avoid AI patterns)
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
      model: openai("gpt-4o"),
      system:
        "You are an expert SEO content writer. Return ONLY valid JSON (no markdown fences, no extra commentary).",
      prompt,
      temperature: 0.8,
      maxTokens: 4096,
    });

<<<<<<< HEAD
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("AI did not return a JSON object");
    }
=======
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return a JSON object");
  }
>>>>>>> fc887e15397d1fac37f6e9ee1a57a550e2f70dbb

    return JSON.parse(jsonMatch[0]);
}

function generateKeywordsForNiche(niche: string, count: number) {
  const templates = [
    `best ${niche}`,
    `${niche} guide`,
    `how to ${niche}`,
    `${niche} tips`,
    `${niche} for beginners`,
    `advanced ${niche}`,
    `${niche} strategies`,
    `${niche} tools`,
    `${niche} examples`,
    `${niche} best practices`,
    `${niche} tutorial`,
    `${niche} review`,
    `${niche} comparison`,
    `${niche} alternatives`,
    `${niche} mistakes`,
    `${niche} benefits`,
    `${niche} vs`,
    `free ${niche}`,
    `${niche} checklist`,
    `${niche} templates`,
    `${niche} case study`,
    `${niche} statistics`,
    `${niche} trends 2025`,
    `${niche} software`,
    `${niche} services`,
    `top ${niche}`,
    `${niche} pricing`,
    `${niche} features`,
    `${niche} solutions`,
    `${niche} workflow`,
  ];

  return templates.slice(0, Math.min(count, templates.length));
}

function generateSecondaryKeywords(primary: string): string[] {
  const words = primary.split(" ");
  const variations = [
    `${primary} 2025`,
    `best ${primary}`,
    `${primary} tips`,
    `${primary} guide`,
    `how to ${primary}`,
  ];
  return variations.slice(0, 5);
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
      `10 Best ${capitalizeFirst(keyword)} Tips for 2025`,
      `7 ${capitalizeFirst(keyword)} Strategies That Actually Work`,
      `15 Proven Ways to Master ${capitalizeFirst(keyword)}`,
      `12 ${capitalizeFirst(keyword)} Ideas You Haven't Tried`,
    ],
    comparison: [
      `${capitalizeFirst(keyword)}: Complete Comparison Guide`,
      `${capitalizeFirst(keyword)} vs Alternatives: Honest Review`,
      `Comparing the Best ${capitalizeFirst(keyword)} Options`,
    ],
    "how-to": [
      `How to ${capitalizeFirst(keyword)}: Step-by-Step Guide`,
      `How to ${capitalizeFirst(keyword)} (Complete 2025 Guide)`,
      `The Right Way to ${capitalizeFirst(keyword)}`,
    ],
    guide: [
      `Ultimate Guide to ${capitalizeFirst(keyword)}`,
      `The Complete ${capitalizeFirst(keyword)} Guide for 2025`,
      `${capitalizeFirst(keyword)}: Everything You Need to Know`,
    ],
    review: [
      `${capitalizeFirst(keyword)} Review: Is It Worth It?`,
      `Honest ${capitalizeFirst(keyword)} Review 2025`,
      `${capitalizeFirst(keyword)}: Pros, Cons & Verdict`,
    ],
    "q-and-a": [
      `${capitalizeFirst(keyword)}: Your Questions Answered`,
      `FAQ: Everything About ${capitalizeFirst(keyword)}`,
      `${capitalizeFirst(keyword)} Q&A: Expert Answers`,
    ],
    tutorial: [
      `${capitalizeFirst(keyword)} Tutorial for Beginners`,
      `Master ${capitalizeFirst(keyword)}: Complete Tutorial`,
      `Learn ${capitalizeFirst(keyword)} in 30 Minutes`,
    ],
    "problem-solution": [
      `${capitalizeFirst(keyword)} Problems? Here's How to Fix Them`,
      `Solving Common ${capitalizeFirst(keyword)} Issues`,
      `${capitalizeFirst(keyword)} Not Working? Try This`,
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
