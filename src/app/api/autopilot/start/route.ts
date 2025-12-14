import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserPlanAndUsage } from "@/lib/usage-limits";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { plan, usage, status } = await getUserPlanAndUsage(user.id);

  if (!plan) {
    return NextResponse.json(
      { error: "No active plan found. Please subscribe to a plan before using autopilot." },
      { status: 403 }
    );
  }

  if (status !== "active") {
    return NextResponse.json(
      { error: `Plan status is ${status}. Please ensure your subscription is active.` },
      { status: 403 }
    );
  }

  const postsRemaining = plan.posts_per_month - (usage?.posts_generated || 0);
  if (postsRemaining <= 0) {
    return NextResponse.json(
      { 
        error: "Monthly post limit reached. Autopilot cannot be started.",
        usage: {
          posts_generated: usage?.posts_generated,
          posts_per_month: plan.posts_per_month,
        },
      },
      { status: 403 }
    );
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, url")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json(
      { error: "No site found. Please create a site first." },
      { status: 404 }
    );
  }

  const { data: existingSettings } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  if (existingSettings && existingSettings.enabled) {
    return NextResponse.json(
      { 
        message: "Autopilot is already running",
        settings: existingSettings,
      },
      { status: 200 }
    );
  }

  const body = await request.json();
  const {
    articlesPerDay = 1,
    publishTimeStart = 9,
    publishTimeEnd = 17,
    timezone = "UTC",
    preferredArticleTypes = ["guide", "how-to", "listicle"],
    tone = "professional",
  } = body;

  if (articlesPerDay < 1 || articlesPerDay > 10) {
    return NextResponse.json(
      { error: "Articles per day must be between 1 and 10" },
      { status: 400 }
    );
  }

  const settingsData = {
    site_id: site.id,
    enabled: true,
    articles_per_day: articlesPerDay,
    publish_time_start: publishTimeStart,
    publish_time_end: publishTimeEnd,
    timezone,
    preferred_article_types: preferredArticleTypes,
    tone,
    updated_at: new Date().toISOString(),
  };

  let savedSettings;
  if (existingSettings) {
    const { data, error } = await supabase
      .from("autopilot_settings")
      .update(settingsData)
      .eq("id", existingSettings.id)
      .select()
      .single();

    if (error) {
      console.error("Failed to update autopilot settings:", error);
      return NextResponse.json(
        { error: "Failed to start autopilot" },
        { status: 500 }
      );
    }
    savedSettings = data;
  } else {
    const { data, error } = await supabase
      .from("autopilot_settings")
      .insert({
        ...settingsData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Failed to create autopilot settings:", error);
      return NextResponse.json(
        { error: "Failed to start autopilot" },
        { status: 500 }
      );
    }
    savedSettings = data;
  }

  return NextResponse.json({
    success: true,
    message: "Autopilot started successfully",
    settings: savedSettings,
    planLimits: {
      posts_per_month: plan.posts_per_month,
      posts_remaining: postsRemaining,
      backlinks_per_post: plan.backlinks_per_post,
    },
    estimatedOutput: {
      dailyArticles: articlesPerDay,
      monthlyArticles: Math.min(articlesPerDay * 30, postsRemaining),
      daysUntilLimitReached: Math.ceil(postsRemaining / articlesPerDay),
    },
  });
}
