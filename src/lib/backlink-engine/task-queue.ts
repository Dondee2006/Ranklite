import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BacklinkTask, Platform, SubmissionData, TaskStatus } from "./types";
import { runPolicyCheck, shouldRequireManualReview } from "./policy-engine";
import { checkBacklinkGenerationLimit, incrementBacklinkUsage } from "@/lib/usage-limits";

const FOUNDATION_CATEGORIES = ["Business Directory", "Local Directory", "Review Platform"];
const MAX_DAILY_SUBMISSIONS = 50;
const MIN_DELAY_BETWEEN_SUBMISSIONS_MS = 5 * 60 * 1000; // 5 minutes
const EXPONENTIAL_BACKOFF_BASE = 2;

export async function createTasksForUser(
  userId: string,
  websiteUrl: string,
  siteName: string,
  description: string,
  articleId?: string
): Promise<{ created: number; skipped: number; blocked: number }> {
  const { data: platforms } = await supabaseAdmin
    .from("backlink_platforms")
    .select("*")
    .eq("automation_allowed", true)
    .gte("domain_rating", 40)
    .order("domain_rating", { ascending: false });

  if (!platforms?.length) {
    return { created: 0, skipped: 0, blocked: 0 };
  }

  const limitCheck = await checkBacklinkGenerationLimit(userId, platforms.length);
  if (!limitCheck.allowed) {
    console.error(`Backlink limit exceeded for user ${userId}: ${limitCheck.message}`);
    return { created: 0, skipped: 0, blocked: 0 };
  }

  // Fetch all existing tasks for this user to check for duplicates
  const { data: existingTasks } = await supabaseAdmin
    .from("backlink_tasks")
    .select("platform_id, article_id")
    .eq("user_id", userId);

  const existingPlatformIds = new Set(existingTasks?.map((t) => t.platform_id) || []);
  const articlePlatformIds = new Set(
    existingTasks?.filter(t => t.article_id === articleId).map(t => t.platform_id) || []
  );

  let created = 0;
  let skipped = 0;
  let blocked = 0;
  const now = new Date();

  // Sort platforms: Prioritize Growth for fast-start if articleId is provided
  const sortedPlatforms = [...platforms].sort((a, b) => {
    const aIsFoundation = FOUNDATION_CATEGORIES.includes(a.category || "");
    const bIsFoundation = FOUNDATION_CATEGORIES.includes(b.category || "");
    if (aIsFoundation && !bIsFoundation) return 1;
    if (!aIsFoundation && bIsFoundation) return -1;
    return (b.domain_rating || 0) - (a.domain_rating || 0);
  });

  for (let i = 0; i < sortedPlatforms.length; i++) {
    const platform = sortedPlatforms[i] as Platform;
    const isFoundation = FOUNDATION_CATEGORIES.includes(platform.category || "");

    // Logic:
    // 1. If Foundation: Skip if site already has this platform.
    // 2. If Growth: Skip only if this SPECIFIC ARTICLE already has this platform.
    if (isFoundation) {
      if (existingPlatformIds.has(platform.id)) {
        skipped++;
        continue;
      }
    } else {
      if (articlePlatformIds.has(platform.id)) {
        skipped++;
        continue;
      }
      // For growth links on an article, we might want to cap it to 10 per article if not specifically requested
      if (articleId && created >= 15 && !isFoundation) {
        skipped++;
        continue;
      }
    }

    const policyResult = await runPolicyCheck(platform, platform.submission_url || undefined);
    const manualReviewCheck = shouldRequireManualReview(policyResult);

    // Fast-Start Scheduling:
    // First 5 tasks: 15 mins apart (for instant feedback)
    // Next 10 tasks: 2 hours apart
    // Rest: 6 hours apart
    let delay = i * MIN_DELAY_BETWEEN_SUBMISSIONS_MS;
    if (i < 5) {
      delay = i * (15 * 60 * 1000);
    } else if (i < 15) {
      delay = 5 * (15 * 60 * 1000) + (i - 5) * (120 * 60 * 1000);
    } else {
      delay = 5 * (15 * 60 * 1000) + 10 * (120 * 60 * 1000) + (i - 15) * (360 * 60 * 1000);
    }

    const scheduledFor = new Date(now.getTime() + delay);

    const submissionData: SubmissionData = {
      business_name: siteName,
      website_url: websiteUrl,
      description: description,
      article_id: articleId,
    };

    const task: Partial<BacklinkTask> = {
      user_id: userId,
      platform_id: platform.id,
      article_id: articleId,
      website_url: websiteUrl,
      status: manualReviewCheck.required ? "require_manual" : "pending",
      priority: Math.ceil((platform.domain_rating || 50) / 10),
      submission_type: platform.submission_type,
      submission_data: submissionData,
      policy_check_result: policyResult,
      requires_manual_review: manualReviewCheck.required,
      manual_review_reason: manualReviewCheck.reason,
      scheduled_for: scheduledFor.toISOString(),
    };

    const { error } = await supabaseAdmin.from("backlink_tasks").insert(task);

    if (!error) {
      if (manualReviewCheck.required) {
        blocked++;
      } else {
        created++;
      }
    }
  }

  await supabaseAdmin
    .from("backlink_campaigns")
    .update({
      pending_tasks: created,
      manual_review_count: blocked,
    })
    .eq("user_id", userId);

  return { created, skipped, blocked };
}

export async function getNextPendingTask(userId: string): Promise<BacklinkTask | null> {
  const { data: campaign } = await supabaseAdmin
    .from("backlink_campaigns")
    .select("is_paused, daily_submission_count, max_daily_submissions")
    .eq("user_id", userId)
    .single();

  if (campaign?.is_paused) {
    return null;
  }

  const maxDaily = campaign?.max_daily_submissions || MAX_DAILY_SUBMISSIONS;
  if ((campaign?.daily_submission_count || 0) >= maxDaily) {
    return null;
  }

  const now = new Date().toISOString();

  const { data: task } = await supabaseAdmin
    .from("backlink_tasks")
    .select("*, platform:backlink_platforms(*)")
    .eq("user_id", userId)
    .eq("status", "pending")
    .lte("scheduled_for", now)
    .order("priority", { ascending: false })
    .order("scheduled_for", { ascending: true })
    .limit(1)
    .single();

  return task as BacklinkTask | null;
}

export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
  updates?: Partial<BacklinkTask>
): Promise<void> {
  await supabaseAdmin
    .from("backlink_tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...updates,
    })
    .eq("id", taskId);
}

export async function scheduleRetry(task: BacklinkTask, lastError?: string): Promise<void> {
  const newAttemptCount = task.attempt_count + 1;

  if (newAttemptCount >= task.max_attempts) {
    await updateTaskStatus(task.id, "failed", {
      attempt_count: newAttemptCount,
      error_message: lastError || "Max retry attempts exceeded",
    });
    return;
  }

  const backoffMs =
    Math.pow(EXPONENTIAL_BACKOFF_BASE, newAttemptCount) * 60 * 1000;
  const nextAttempt = new Date(Date.now() + backoffMs);

  await updateTaskStatus(task.id, "pending", {
    attempt_count: newAttemptCount,
    next_attempt_at: nextAttempt.toISOString(),
    scheduled_for: nextAttempt.toISOString(),
    last_attempt_at: new Date().toISOString(),
    error_message: lastError || task.error_message,
  });
}

export async function markForManualReview(
  taskId: string,
  reason: string,
  screenshotUrl?: string
): Promise<void> {
  await updateTaskStatus(taskId, "require_manual", {
    requires_manual_review: true,
    manual_review_reason: reason,
    screenshot_url: screenshotUrl,
  });

  const { data: task } = await supabaseAdmin
    .from("backlink_tasks")
    .select("user_id")
    .eq("id", taskId)
    .single();

  if (task) {
    await supabaseAdmin.rpc("increment_manual_review_count", {
      p_user_id: task.user_id,
    });
  }
}

export async function getQueueStats(userId: string): Promise<{
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  require_manual: number;
  blocked: number;
}> {
  const { data: tasks } = await supabaseAdmin
    .from("backlink_tasks")
    .select("status")
    .eq("user_id", userId);

  const stats = {
    pending: 0,
    processing: 0,
    completed: 0,
    failed: 0,
    require_manual: 0,
    blocked: 0,
  };

  tasks?.forEach((task) => {
    if (task.status in stats) {
      stats[task.status as keyof typeof stats]++;
    }
  });

  return stats;
}

export async function getTasksForManualReview(
  userId: string,
  limit = 20
): Promise<BacklinkTask[]> {
  const { data } = await supabaseAdmin
    .from("backlink_tasks")
    .select("*, platform:backlink_platforms(*)")
    .eq("user_id", userId)
    .eq("requires_manual_review", true)
    .in("status", ["require_manual", "blocked"])
    .order("priority", { ascending: false })
    .limit(limit);

  return (data as BacklinkTask[]) || [];
}

export async function resetDailySubmissionCounts(): Promise<void> {
  await supabaseAdmin
    .from("backlink_campaigns")
    .update({ daily_submission_count: 0 })
    .neq("daily_submission_count", 0);
}