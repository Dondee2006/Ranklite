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

    articles.push({
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