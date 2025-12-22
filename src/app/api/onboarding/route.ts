import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createTasksForUser, logAction } from "@/lib/backlink-engine";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  try {

    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({
        user_id: user.id,
        name: body.businessName || "My Site",
        url: body.websiteUrl,
        language: body.language || "en",
        country: body.country || "US",
        description: body.businessDescription,
      })
      .select()
      .single();

    if (siteError) {
      return NextResponse.json({ error: siteError.message }, { status: 500 });
    }

    if (body.targetAudience) {
      await supabase.from("target_audiences").insert({
        site_id: site.id,
        name: body.targetAudience,
        description: body.targetAudience,
      });
    }

    if (body.competitors && Array.isArray(body.competitors)) {
      const competitorInserts = body.competitors.map((url: string) => ({
        site_id: site.id,
        url,
      }));
      await supabase.from("competitors").insert(competitorInserts);
    }

    await supabase.from("article_settings").insert({
      site_id: site.id,
    });

    await supabase.from("autopilot_settings").upsert({
      site_id: site.id,
      enabled: true,
      publish_time_start: 7,
      publish_time_end: 9,
      timezone: "UTC",
      articles_per_day: 1,
      preferred_article_types: [],
      tone: "natural",
      style_preferences: {},
      cms_targets: [],
      updated_at: new Date().toISOString(),
    }, { onConflict: "site_id" });

    const { data: starterPlan } = await supabase
      .from("plans")
      .select("id")
      .eq("name", "Pro Tier")
      .single();

    if (starterPlan) {
      await supabase.from("user_plans").insert({
        user_id: user.id,
        plan_id: starterPlan.id,
        status: "active",
        start_date: new Date().toISOString(),
      });
    }

    const nextRunDate = new Date();
    nextRunDate.setDate(nextRunDate.getDate() + 1);

    await supabase.from("seo_cycles").insert({
      user_id: user.id,
      site_id: site.id,
      name: "SEO Cycle",
      status: "active",
      posts_per_month: 10,
      backlinks_per_post: 20,
      max_backlinks_per_month: 200,
      min_dr_for_backlinks: 30,
      daily_automation_limit: 10,
      qa_validation_enabled: true,
      auto_publish: false,
      next_run_at: nextRunDate.toISOString(),
    });

    await seedThirtyDayPlan(supabase, site, body);

    await supabase.from("backlink_campaigns").insert({
      user_id: user.id,
      website_url: body.websiteUrl,
      status: "active",
      agent_status: "scanning",
      current_step: "Creating submission tasks",
      total_backlinks: 0,
      unique_sources: 0,
      avg_domain_rating: 0,
      this_month_backlinks: 0,
      is_paused: false,
      daily_submission_count: 0,
      pending_tasks: 0,
      manual_review_count: 0,
      failed_tasks: 0,
      max_daily_submissions: 10,
      min_domain_rating: 30,
      last_scan_at: new Date().toISOString(),
      next_scan_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    const taskResults = await createTasksForUser(
      user.id,
      body.websiteUrl,
      body.businessName || "My Site",
      body.businessDescription || ""
    );

    await supabase
      .from("backlink_campaigns")
      .update({
        pending_tasks: taskResults.created,
        manual_review_count: taskResults.blocked,
        current_step: "Scanning directories",
        agent_status: "scanning",
      })
      .eq("user_id", user.id);

    await logAction(user.id, "onboarding_completed", {
      website_url: body.websiteUrl,
      tasks_created: taskResults.created,
      tasks_blocked: taskResults.blocked,
    });

    return NextResponse.json({ success: true, site }, { status: 200 });

  } catch (error) {
    console.error("Onboarding API Critical Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function seedThirtyDayPlan(supabase: any, site: { id: string; user_id: string; name?: string }, body: any) {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().split("T")[0]);
  }

  await supabase
    .from("articles")
    .delete()
    .eq("site_id", site.id)
    .in("scheduled_date", dates)
    .eq("status", "planned");

  const keywordPool = body?.keywords?.length
    ? body.keywords
    : generateKeywordsForNiche(body?.businessName || site.name || "your niche", 30);

  const articles = dates.map((dateStr, index) => {
    const keyword = keywordPool[index % keywordPool.length];
    const keywordText = typeof keyword === "string" ? keyword : keyword?.primary || "";
    const articleType = selectArticleType();
    const searchIntent = determineSearchIntent(articleType);
    const title = generateTitle(keywordText, articleType);
    return {
      site_id: site.id,
      user_id: site.user_id,
      title,
      slug: generateSlug(title),
      keyword: keywordText,
      secondary_keywords: typeof keyword === "string" ? generateSecondaryKeywords(keywordText) : keyword?.secondary || [],
      search_intent: searchIntent,
      article_type: articleType,
      word_count: 1500 + Math.floor(Math.random() * 1000),
      cta_placement: ["beginning", "middle", "end", "both"][Math.floor(Math.random() * 4)],
      status: "planned",
      scheduled_date: dateStr,
    };
  });

  if (articles.length) {
    await supabase.from("articles").insert(articles);
    const monthKeys = new Set(articles.map(a => a.scheduled_date.slice(0, 7)));
    const nowIso = new Date().toISOString();
    for (const key of monthKeys) {
      const [yearStr, monthStr] = key.split("-");
      await supabase.from("content_calendar").upsert({
        site_id: site.id,
        month: Number(monthStr) - 1,
        year: Number(yearStr),
        generated_at: nowIso,
        status: "active",
      }, { onConflict: "site_id,month,year" });
    }
  }
}

function selectArticleType(): string {
  const types = [
    { type: "listicle", weight: 20 },
    { type: "how-to", weight: 25 },
    { type: "guide", weight: 20 },
    { type: "comparison", weight: 10 },
    { type: "review", weight: 10 },
    { type: "q-and-a", weight: 5 },
    { type: "tutorial", weight: 5 },
    { type: "problem-solution", weight: 5 },
  ];

  const total = types.reduce((sum, t) => sum + t.weight, 0);
  let random = Math.random() * total;
  for (const t of types) {
    random -= t.weight;
    if (random <= 0) return t.type;
  }
  return "guide";
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

function generateSecondaryKeywords(primary: string): string[] {
  const variations = [
    `${primary} 2025`,
    `best ${primary}`,
    `${primary} tips`,
    `${primary} guide`,
    `how to ${primary}`,
  ];
  return variations.slice(0, 5);
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