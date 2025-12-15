import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const { data: campaign, error: campaignError } = await supabase
      .from("backlink_campaigns")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (campaignError) {
      console.error("Campaign error:", campaignError);
    }

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("status, site_id")
      .eq("user_id", userId);

    if (articlesError) {
      console.error("Articles error:", articlesError);
    }

    const { data: backlinkTasks, error: tasksError } = await supabase
      .from("backlink_tasks")
      .select("status, outreach_status");

    if (tasksError) {
      console.error("Tasks error:", tasksError);
    }

    const stageMapping: Record<string, string> = {
      draft: "PLAN",
      planned: "PLAN",
      generating: "CREATE",
      scheduled: "CREATE",
      published: "PUBLISH",
      pending: "PROMOTE",
      completed: "VALIDATE",
      verified: "COMPLETE",
    };

    const stageCounts: Record<string, number> = {
      PLAN: 0,
      CREATE: 0,
      PUBLISH: 0,
      PROMOTE: 0,
      VALIDATE: 0,
      COMPLETE: 0,
    };

    (articles || []).forEach((article) => {
      const stage = stageMapping[article.status] || "PLAN";
      stageCounts[stage]++;
    });

    (backlinkTasks || []).forEach((task) => {
      if (task.status === "pending") {
        stageCounts.PROMOTE++;
      } else if (task.status === "completed" && task.outreach_status !== "verified") {
        stageCounts.VALIDATE++;
      } else if (task.outreach_status === "verified") {
        stageCounts.COMPLETE++;
      }
    });

    const today = new Date().toISOString().split("T")[0];
    const { count: submissionsToday } = await supabase
      .from("backlink_tasks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${today}T00:00:00Z`)
      .lte("created_at", `${today}T23:59:59Z`);

    const currentMonth = new Date().toISOString().slice(0, 7);
    const { count: submissionsThisMonth } = await supabase
      .from("backlink_tasks")
      .select("*", { count: "exact", head: true })
      .gte("created_at", `${currentMonth}-01T00:00:00Z`);

    return NextResponse.json({
      stageCounts,
      metrics: {
        totalBacklinks: campaign?.total_backlinks || 0,
        uniqueSources: campaign?.unique_sources || 0,
        avgDomainRating: parseFloat(campaign?.avg_domain_rating || "0"),
        thisMonthBacklinks: submissionsThisMonth || 0,
        dailySubmissionCount: submissionsToday || 0,
        maxDailySubmissions: campaign?.max_daily_submissions || 10,
      },
      agent: {
        status: campaign?.agent_status || "idle",
        currentStep: campaign?.current_step || "Waiting to start",
        isPaused: campaign?.is_paused || false,
      },
    });
  } catch (error) {
    console.error("SEO cycle error:", error);
    return NextResponse.json(
      { error: "Failed to fetch SEO cycle data" },
      { status: 500 }
    );
  }
}