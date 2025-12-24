import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserPlanAndUsage } from "@/lib/usage-limits";

interface AnchorTypeDistribution {
  exact: number;
  partial: number;
  branded: number;
  generic: number;
  naked: number;
}

const SAFE_ANCHOR_RATIOS: AnchorTypeDistribution = {
  exact: 0.1,
  partial: 0.25,
  branded: 0.35,
  generic: 0.2,
  naked: 0.1,
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { articleId, targetUrl, quantity } = body;

  if (!articleId || !targetUrl || !quantity) {
    return NextResponse.json(
      { error: "Article ID, target URL, and quantity are required" },
      { status: 400 }
    );
  }

  const { plan, usage } = await getUserPlanAndUsage(user.id);

  if (!plan) {
    return NextResponse.json(
      { error: "No active plan found. Please subscribe to a plan." },
      { status: 403 }
    );
  }

  if (quantity > plan.backlinks_per_post) {
    return NextResponse.json(
      {
        error: `Requested quantity (${quantity}) exceeds plan limit of ${plan.backlinks_per_post} backlinks per post.`,
        limit: plan.backlinks_per_post,
        requested: quantity,
      },
      { status: 403 }
    );
  }

  const { data: planDetails } = await supabase
    .from("user_plans")
    .select("*, plans(*)")
    .eq("user_id", user.id)
    .single();

  const dailyBacklinkCap = planDetails?.plans?.daily_backlink_cap || 5;
  const monthlyBacklinkCap = planDetails?.plans?.monthly_backlink_cap || 150;

  const today = new Date().toISOString().split("T")[0];
  const { data: usageTracking } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", user.id)
    .gte("period_start", usage?.period_start || new Date().toISOString())
    .lte("period_end", usage?.period_end || new Date().toISOString())
    .single();

  const backlinksToday = usageTracking?.backlinks_today || 0;
  const backlinksThisMonth = usageTracking?.backlinks_generated || 0;
  const lastBacklinkDate = usageTracking?.last_backlink_date || null;

  if (backlinksThisMonth + quantity > monthlyBacklinkCap) {
    return NextResponse.json(
      {
        error: `Monthly backlink limit would be exceeded. Current: ${backlinksThisMonth}, Cap: ${monthlyBacklinkCap}, Requested: ${quantity}`,
        monthlyUsed: backlinksThisMonth,
        monthlyCap: monthlyBacklinkCap,
        available: Math.max(0, monthlyBacklinkCap - backlinksThisMonth),
      },
      { status: 403 }
    );
  }

  const todayBacklinksUsed = lastBacklinkDate === today ? backlinksToday : 0;
  if (todayBacklinksUsed + quantity > dailyBacklinkCap) {
    return NextResponse.json(
      {
        error: `Daily backlink limit would be exceeded. Use daily drip scheduling to stay safe.`,
        dailyUsed: todayBacklinksUsed,
        dailyCap: dailyBacklinkCap,
        available: Math.max(0, dailyBacklinkCap - todayBacklinksUsed),
        suggestion: "Use scheduled distribution over multiple days to avoid Google penalties",
      },
      { status: 403 }
    );
  }

  const { data: article } = await supabase
    .from("articles")
    .select("*, sites!inner(user_id)")
    .eq("id", articleId)
    .eq("sites.user_id", user.id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const existingBacklinksQuery = await supabase
    .from("backlink_tasks")
    .select("anchor_type")
    .eq("user_id", user.id)
    .eq("website_url", targetUrl);

  const existingBacklinks = existingBacklinksQuery.data || [];
  const currentDistribution = calculateAnchorDistribution(existingBacklinks);

  const anchorDistribution = distributeAnchors(quantity, currentDistribution);

  const daysToDistribute = Math.ceil(quantity / dailyBacklinkCap);
  const baseDate = new Date();
  const { data: platforms } = await supabase
    .from("backlink_platforms")
    .select("id, site_name, site_domain, automation_allowed, submission_type, domain_rating")
    .eq("automation_allowed", true);

  const tasks: Array<{
    user_id: string;
    site_id: string;
    article_id: string;
    platform_id: string | null;
    website_url: string;
    status: string;
    priority: number;
    submission_type: string;
    anchor_type: string;
    scheduled_date: string;
    scheduled_for: string;
    submission_data: object;
  }> = [];

  let dayIndex = 0;
  let dailyCount = 0;

  for (const [anchorType, count] of Object.entries(anchorDistribution)) {
    for (let i = 0; i < count; i++) {
      if (dailyCount >= dailyBacklinkCap) {
        dayIndex++;
        dailyCount = 0;
      }

      const scheduledDate = new Date(baseDate);
      scheduledDate.setDate(scheduledDate.getDate() + dayIndex);

      const randomHour = Math.floor(Math.random() * 8) + 9;
      const randomMinute = Math.floor(Math.random() * 60);
      scheduledDate.setHours(randomHour, randomMinute, 0, 0);

      const platformIdx = tasks.length % (platforms?.length || 1);
      const platform = platforms?.[platformIdx];

      tasks.push({
        user_id: user.id,
        site_id: article.site_id,
        article_id: articleId,
        platform_id: platform?.id || null,
        website_url: targetUrl,
        status: (platform?.automation_allowed) ? "pending" : "require_manual",
        priority: platform?.domain_rating ? Math.ceil(platform.domain_rating / 10) : 5,
        submission_type: platform?.submission_type || "automated",
        anchor_type: anchorType,
        scheduled_date: scheduledDate.toISOString().split("T")[0],
        scheduled_for: scheduledDate.toISOString(),
        submission_data: {
          article_id: articleId,
          article_title: article.title,
          article_keyword: article.keyword,
          target_url: targetUrl,
          anchor_text: generateAnchorText(anchorType, article.keyword, article.title),
        },
      });

      dailyCount++;
    }
  }

  const { data: createdTasks, error: insertError } = await supabase
    .from("backlink_tasks")
    .insert(tasks)
    .select();

  if (insertError) {
    console.error("Failed to queue backlinks:", insertError);
    return NextResponse.json(
      { error: "Failed to queue backlinks" },
      { status: 500 }
    );
  }

  await supabase
    .from("articles")
    .update({
      backlinks_status: "queued",
      backlinks_count: (article.backlinks_count || 0) + quantity,
      updated_at: new Date().toISOString(),
    })
    .eq("id", articleId);

  return NextResponse.json({
    success: true,
    message: `Successfully queued ${quantity} backlinks with daily drip scheduling`,
    tasksCreated: createdTasks?.length || 0,
    distribution: anchorDistribution,
    schedule: {
      daysToDistribute,
      dailyCap: dailyBacklinkCap,
      startDate: baseDate.toISOString().split("T")[0],
      endDate: tasks[tasks.length - 1].scheduled_date,
    },
    safetyChecks: {
      dailyLimitRespected: true,
      monthlyLimitRespected: true,
      anchorRatiosOptimized: true,
    },
  });
}

function calculateAnchorDistribution(existingBacklinks: Array<{ anchor_type: string }>): AnchorTypeDistribution {
  const distribution: AnchorTypeDistribution = {
    exact: 0,
    partial: 0,
    branded: 0,
    generic: 0,
    naked: 0,
  };

  const total = existingBacklinks.length;
  if (total === 0) return distribution;

  for (const backlink of existingBacklinks) {
    const type = backlink.anchor_type as keyof AnchorTypeDistribution;
    if (distribution.hasOwnProperty(type)) {
      distribution[type]++;
    }
  }

  for (const key in distribution) {
    distribution[key as keyof AnchorTypeDistribution] /= total;
  }

  return distribution;
}

function distributeAnchors(quantity: number, currentDistribution: AnchorTypeDistribution): Record<string, number> {
  const result: Record<string, number> = {
    exact: 0,
    partial: 0,
    branded: 0,
    generic: 0,
    naked: 0,
  };

  for (const [type, safeRatio] of Object.entries(SAFE_ANCHOR_RATIOS)) {
    const targetCount = Math.floor(quantity * safeRatio);
    result[type] = targetCount;
  }

  const distributed = Object.values(result).reduce((a, b) => a + b, 0);
  const remaining = quantity - distributed;

  if (remaining > 0) {
    result.partial += remaining;
  }

  return result;
}

function generateAnchorText(anchorType: string, keyword: string, title: string): string {
  switch (anchorType) {
    case "exact":
      return keyword;
    case "partial":
      return `${keyword} guide`;
    case "branded":
      return title;
    case "generic":
      return "click here";
    case "naked":
      return "URL";
    default:
      return keyword;
  }
}
