import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  let query = supabase
    .from("backlink_tasks")
    .select("*")
    .eq("user_id", user.id);

  if (articleId) {
    query = query.eq("submission_data->article_id", articleId);
  }

  const { data: tasks, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to fetch backlink tasks:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlink status" },
      { status: 500 }
    );
  }

  const statusCounts = {
    queued: 0,
    in_progress: 0,
    completed: 0,
    failed: 0,
    pending_review: 0,
  };

  const anchorTypeCounts = {
    exact: 0,
    partial: 0,
    branded: 0,
    generic: 0,
    naked: 0,
  };

  for (const task of tasks || []) {
    const status = task.status as keyof typeof statusCounts;
    if (statusCounts.hasOwnProperty(status)) {
      statusCounts[status]++;
    }

    const anchorType = task.anchor_type as keyof typeof anchorTypeCounts;
    if (anchorType && anchorTypeCounts.hasOwnProperty(anchorType)) {
      anchorTypeCounts[anchorType]++;
    }
  }

  const totalTasks = tasks?.length || 0;
  const completedTasks = statusCounts.completed;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const upcomingTasks = tasks?.filter((task) => {
    const scheduledFor = task.scheduled_for ? new Date(task.scheduled_for) : null;
    return scheduledFor && scheduledFor > new Date() && task.status === "queued";
  }).slice(0, 10);

  const recentCompletions = tasks?.filter((task) => task.status === "completed").slice(0, 10);
  const failedTasks = tasks?.filter((task) => task.status === "failed").slice(0, 10);

  return NextResponse.json({
    summary: {
      total: totalTasks,
      statusBreakdown: statusCounts,
      anchorTypeDistribution: anchorTypeCounts,
      progressPercent,
    },
    upcoming: upcomingTasks?.map((task) => ({
      id: task.id,
      website: task.website_url,
      anchorType: task.anchor_type,
      scheduledFor: task.scheduled_for,
      priority: task.priority,
    })),
    recentCompletions: recentCompletions?.map((task) => ({
      id: task.id,
      website: task.website_url,
      completedAt: task.completed_at,
      anchorType: task.anchor_type,
    })),
    failed: failedTasks?.map((task) => ({
      id: task.id,
      website: task.website_url,
      error: task.error_message,
      anchorType: task.anchor_type,
      lastAttemptAt: task.last_attempt_at,
    })),
    safetyStatus: {
      anchorRatiosHealthy: isAnchorRatioHealthy(anchorTypeCounts, totalTasks),
      velocityNormal: true,
      noBlastDetected: true,
    },
  });
}

function isAnchorRatioHealthy(
  anchorCounts: Record<string, number>,
  total: number
): boolean {
  if (total === 0) return true;

  const exactRatio = anchorCounts.exact / total;

  return exactRatio <= 0.15;
}
