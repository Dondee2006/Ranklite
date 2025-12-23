import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  const { month, year, niche, keywords } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id, url, name, niche, description")
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
    : generateKeywordsForNiche(niche || site.niche || site.description || site.name, TARGET_ARTICLE_COUNT);

  const articles = [];
  const currentDate = new Date(startDate);
  while (articles.length < TARGET_ARTICLE_COUNT) {
    const dateStr = formatDate(currentDate);
    if (usedDates.has(dateStr)) {
      currentDate.setDate(currentDate.getDate() + 1);
      continue;
    }

    const keywordItem: any = keywordPool[articles.length % keywordPool.length];
    const articleType = selectArticleType();
    const searchIntent = determineSearchIntent(articleType);

    const title = generateTitle(
      typeof keywordItem === "string" ? keywordItem : keywordItem.primary,
      articleType
    );

    articles.push({
      site_id: site.id,
      title,
      slug: generateSlug(title),
      keyword: typeof keywordItem === "string" ? keywordItem : keywordItem.primary,
      secondary_keywords: typeof keywordItem === "string"
        ? generateSecondaryKeywords(keywordItem)
        : keywordItem.secondary || [],
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

  const { data, error } = await supabase
    .from("articles")
    .insert(articles)
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase
    .from("content_calendar")
    .upsert({
      site_id: site.id,
      month,
      year,
      generated_at: new Date().toISOString(),
      status: "active",
    }, { onConflict: "site_id,month,year" });

  return NextResponse.json({ success: true, articles: data, count: data?.length || 0 });
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