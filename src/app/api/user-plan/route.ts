import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanAndUsage } from "@/lib/usage-limits";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { plan, usage, status, periodEnd } = await getUserPlanAndUsage(user.id);

    if (!plan) {
      return NextResponse.json({
        plan: null,
        usage: null,
        status: null,
        message: "No active plan found. Please subscribe to a plan."
      });
    }

    const postsUsedPercent = plan.posts_per_month > 0 
      ? Math.round((usage!.posts_generated / plan.posts_per_month) * 100)
      : 0;

    const backlinksUsedPercent = plan.backlinks_per_post > 0
      ? Math.round((usage!.backlinks_generated / (plan.posts_per_month * plan.backlinks_per_post)) * 100)
      : 0;

    const approachingLimit = postsUsedPercent >= 80 || backlinksUsedPercent >= 80;

    return NextResponse.json({
      plan: {
        name: plan,
        limits: {
          posts_per_month: plan.posts_per_month,
          backlinks_per_post: plan.backlinks_per_post,
          qa_validation: plan.qa_validation,
          integrations_limit: plan.integrations_limit,
        },
      },
      usage: {
        posts_generated: usage!.posts_generated,
        backlinks_generated: usage!.backlinks_generated,
        posts_remaining: Math.max(0, plan.posts_per_month - usage!.posts_generated),
        period_start: usage!.period_start,
        period_end: usage!.period_end,
      },
      status,
      periodEnd,
      percentUsed: {
        posts: postsUsedPercent,
        backlinks: backlinksUsedPercent,
      },
      notifications: {
        approachingLimit,
        limitReached: postsUsedPercent >= 100 || backlinksUsedPercent >= 100,
      },
    });
  } catch (error) {
    console.error("Failed to get user plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
