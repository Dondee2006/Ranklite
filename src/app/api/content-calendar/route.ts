import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const ARTICLE_TYPES = [
  "listicle",
  "comparison",
  "how-to",
  "guide",
  "review",
  "q-and-a",
  "tutorial",
  "problem-solution",
];

const SEARCH_INTENTS = ["informational", "transactional", "commercial", "navigational"];

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth()));
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));

  const { data: sites } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .order("id", { ascending: true })
    .limit(1);

  const site = sites?.[0];

  if (!site) {
    return NextResponse.json({ calendar: null, articles: [] });
  }

  const { data: calendar } = await supabase
    .from("content_calendar")
    .select("*")
    .eq("site_id", site.id)
    .eq("month", month)
    .eq("year", year)
    .single();

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .eq("site_id", site.id)
    .gte("scheduled_date", startDate.toISOString().split("T")[0])
    .lte("scheduled_date", endDate.toISOString().split("T")[0])
    .order("scheduled_date", { ascending: true });

  return NextResponse.json({ calendar, articles: articles || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, year, keywords } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id, domain, name")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: existingCalendar } = await supabase
    .from("content_calendar")
    .select("id")
    .eq("site_id", site.id)
    .eq("month", month)
    .eq("year", year)
    .single();

  if (!existingCalendar) {
    await supabase.from("content_calendar").insert({
      site_id: site.id,
      month,
      year,
    });
  }

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const startDay = month === today.getMonth() && year === today.getFullYear()
    ? today.getDate()
    : 1;

  const plannedArticles = [];
  const keywordsToUse = keywords || generateDefaultKeywords(site.name);

  for (let day = startDay; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const keywordIndex = (day - startDay) % keywordsToUse.length;
    const keyword = keywordsToUse[keywordIndex];
    const articleType = ARTICLE_TYPES[day % ARTICLE_TYPES.length];
    const searchIntent = SEARCH_INTENTS[day % SEARCH_INTENTS.length];

    plannedArticles.push({
      site_id: site.id,
      title: generateTitle(keyword.primary, articleType),
      keyword: keyword.primary,
      secondary_keywords: keyword.secondary || [],
      search_intent: searchIntent,
      article_type: articleType,
      word_count: 1500 + Math.floor(Math.random() * 500),
      cta_placement: day % 3 === 0 ? "middle" : day % 3 === 1 ? "end" : "both",
      status: "planned",
      scheduled_date: dateStr,
    });
  }

  const { data: articles, error } = await supabase
    .from("articles")
    .upsert(plannedArticles, { onConflict: "id" })
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, articles });
}

function generateDefaultKeywords(siteName: string) {
  const baseKeywords = [
    { primary: `best ${siteName} tips`, secondary: ["strategies", "techniques", "methods"] },
    { primary: `how to use ${siteName}`, secondary: ["guide", "tutorial", "walkthrough"] },
    { primary: `${siteName} vs competitors`, secondary: ["comparison", "alternatives", "review"] },
    { primary: `${siteName} for beginners`, secondary: ["getting started", "basics", "introduction"] },
    { primary: `advanced ${siteName} features`, secondary: ["pro tips", "expert guide", "power user"] },
  ];
  return baseKeywords;
}

function generateTitle(keyword: string, articleType: string): string {
  const templates: Record<string, string[]> = {
    listicle: [`10 Best ${keyword} Tips for 2025`, `7 ${keyword} Strategies That Work`, `15 Ways to Master ${keyword}`],
    comparison: [`${keyword}: Complete Comparison Guide`, `${keyword} vs Alternatives: Which is Best?`],
    "how-to": [`How to ${keyword}: Step-by-Step Guide`, `Complete Guide: How to ${keyword} Effectively`],
    guide: [`Ultimate Guide to ${keyword}`, `The Complete ${keyword} Guide for 2025`],
    review: [`${keyword} Review: Everything You Need to Know`, `Honest ${keyword} Review 2025`],
    "q-and-a": [`${keyword}: Your Questions Answered`, `FAQ: Everything About ${keyword}`],
    tutorial: [`${keyword} Tutorial for Beginners`, `Master ${keyword}: Complete Tutorial`],
    "problem-solution": [`${keyword} Problems? Here's How to Fix Them`, `Solving Common ${keyword} Issues`],
  };
  const options = templates[articleType] || templates.guide;
  return options[Math.floor(Math.random() * options.length)];
}
