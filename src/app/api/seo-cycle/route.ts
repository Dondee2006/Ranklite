import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await retryWithBackoff(() => supabase.auth.getUser());

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;

    const fallback = {
      stageCounts: {
        PLAN: 0,
        CREATE: 0,
        PUBLISH: 0,
        PROMOTE: 0,
        VALIDATE: 0,
        COMPLETE: 0,
      },
      metrics: {
        totalBacklinks: 0,
        uniqueSources: 0,
        avgDomainRating: 0,
        thisMonthBacklinks: 0,
        dailySubmissionCount: 0,
        maxDailySubmissions: 10,
      },
      agent: {
        status: "idle",
        currentStep: "Waiting to start",
        isPaused: true,
      },
    };

    const [campaignRes, articlesRes, tasksRes, submissionsTodayRes, submissionsThisMonthRes] =
      await retryWithBackoff(() =>
        Promise.all([
          supabase.from("backlink_campaigns").select("*").eq("user_id", userId).maybeSingle(),
          supabase.from("articles").select("status, site_id").eq("user_id", userId),
          supabase.from("backlink_tasks").select("status, outreach_status, platform:backlink_platforms(category)").eq("user_id", userId),
          supabase
            .from("backlink_tasks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", `${new Date().toISOString().split("T")[0]}T00:00:00Z`)
            .lte("created_at", `${new Date().toISOString().split("T")[0]}T23:59:59Z`),
          supabase
            .from("backlink_tasks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", `${new Date().toISOString().slice(0, 7)}-01T00:00:00Z`),
        ])
      );

    if (campaignRes.error || articlesRes.error || tasksRes.error || submissionsTodayRes.error || submissionsThisMonthRes.error) {
      console.error("SEO cycle query errors:", {
        campaign: campaignRes.error,
        articles: articlesRes.error,
        tasks: tasksRes.error,
        today: submissionsTodayRes.error,
        month: submissionsThisMonthRes.error,
      });
      return NextResponse.json(fallback, { status: 200 });
    }

    const stageMapping: Record<string, string> = {
      draft: "PLAN",
      planned: "PLAN",
      generating: "CREATE",
      generated: "CREATE",
      scheduled: "CREATE",
      published: "PUBLISH",
      pending: "PROMOTE",
      queued: "PROMOTE",
      require_manual: "PROMOTE",
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

    (articlesRes.data || []).forEach((row) => {
      const stage = stageMapping[row.status] || "PLAN";
      stageCounts[stage] = (stageCounts[stage] || 0) + 1;
    });

    let foundationLinks = 0;
    let growthLinks = 0;
    const FOUNDATION_CATEGORIES = ["Business Directory", "Local Directory", "Review Platform"];

    (tasksRes.data || []).forEach((row) => {
      const isFoundation = FOUNDATION_CATEGORIES.includes((row as any).platform?.category || "");
      if (row.status === "pending" || row.status === "queued" || row.status === "require_manual") {
        stageCounts.PROMOTE += 1;
      } else if (row.status === "completed" && row.outreach_status !== "verified") {
        stageCounts.VALIDATE += 1;
      } else if (row.outreach_status === "verified") {
        stageCounts.COMPLETE += 1;
        if (isFoundation) foundationLinks++;
        else growthLinks++;
      }
    });

    const campaign = campaignRes.data;

    return NextResponse.json({
      stageCounts,
      metrics: {
        totalBacklinks: campaign?.total_backlinks || 0,
        foundationLinks,
        growthLinks,
        uniqueSources: campaign?.unique_sources || 0,
        avgDomainRating: parseFloat(campaign?.avg_domain_rating || "0"),
        thisMonthBacklinks: submissionsThisMonthRes.count || 0,
        dailySubmissionCount: submissionsTodayRes.count || 0,
        maxDailySubmissions: campaign?.max_daily_submissions || 10,
        isAggressive: (campaign?.max_daily_submissions || 10) > 10
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
      {
        stageCounts: {
          PLAN: 0,
          CREATE: 0,
          PUBLISH: 0,
          PROMOTE: 0,
          VALIDATE: 0,
          COMPLETE: 0,
        },
        metrics: {
          totalBacklinks: 0,
          uniqueSources: 0,
          avgDomainRating: 0,
          thisMonthBacklinks: 0,
          dailySubmissionCount: 0,
          maxDailySubmissions: 10,
        },
        agent: {
          status: "idle",
          currentStep: "Awaiting data",
          isPaused: true,
        },
        error: "Failed to fetch SEO cycle data",
      },
      { status: 200 }
    );
  }
}
