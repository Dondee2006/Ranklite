import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BacklinkTask, Platform, SubmissionData, TaskStatus } from "./types";
import { runPolicyCheck, shouldRequireManualReview } from "./policy-engine";
import { checkBacklinkGenerationLimit, incrementBacklinkUsage } from "@/lib/usage-limits";

const MAX_DAILY_SUBMISSIONS = 10;
const MIN_DELAY_BETWEEN_SUBMISSIONS_MS = 5 * 60 * 1000;
const EXPONENTIAL_BACKOFF_BASE = 2;

export async function createTasksForUser(
  userId: string,
  websiteUrl: string,
  siteName: string,
  description: string
): Promise<{ created: number; skipped: number; blocked: number }> {
  const { data: platforms } = await supabaseAdmin
    .from("backlink_platforms")
    .select("*")
    .eq("automation_allowed", true)
    .order("domain_rating", { ascending: false });

  if (!platforms?.length) {
    return { created: 0, skipped: 0, blocked: 0 };
  }

  const limitCheck = await checkBacklinkGenerationLimit(userId, platforms.length);
  if (!limitCheck.allowed) {
    console.error(`Backlink limit exceeded for user ${userId}: ${limitCheck.message}`);
    return { created: 0, skipped: 0, blocked: 0 };
  }

  const { data: existingTasks } = await supabaseAdmin
    .from("backlink_tasks")
    .select("platform_id")
    .eq("user_id", userId);

  const existingPlatformIds = new Set(existingTasks?.map((t) => t.platform_id) || []);

  let created = 0;
  let skipped = 0;
  let blocked = 0;
  const now = new Date();

  for (let i = 0; i < platforms.length; i++) {
    const platform = platforms[i] as Platform;

    if (existingPlatformIds.has(platform.id)) {
      skipped++;
      continue;
    }

    const policyResult = await runPolicyCheck(platform, platform.submission_url || undefined);
    const manualReviewCheck = shouldRequireManualReview(policyResult);

    const scheduledFor = new Date(now.getTime() + i * MIN_DELAY_BETWEEN_SUBMISSIONS_MS);

    const submissionData: SubmissionData = {
      business_name: siteName,
      website_url: websiteUrl,
      description: description,
    };

    const task: Partial<BacklinkTask> = {
      user_id: userId,
      platform_id: platform.id,
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

export async function scheduleRetry(task: BacklinkTask): Promise<void> {
  const newAttemptCount = task.attempt_count + 1;

  if (newAttemptCount >= task.max_attempts) {
    await updateTaskStatus(task.id, "failed", {
      attempt_count: newAttemptCount,
      error_message: "Max retry attempts exceeded",
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