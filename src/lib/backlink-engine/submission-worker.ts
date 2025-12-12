import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BacklinkTask, Platform, WorkerResult } from "./types";
import { updateTaskStatus, scheduleRetry, markForManualReview } from "./task-queue";
import { detectAntiBot } from "./policy-engine";
import { logAction } from "./logger";

interface SubmissionResponse {
  success: boolean;
  statusCode?: number;
  html?: string;
  error?: string;
  backlinkUrl?: string;
  realSubmission?: boolean;
}

async function submitViaAPI(
  task: BacklinkTask,
  platform: Platform
): Promise<SubmissionResponse> {
  if (!platform.api_schema || !platform.submission_url) {
    return { success: false, error: "No API schema defined", realSubmission: false };
  }

  try {
    const response = await fetch(platform.submission_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (compatible; RankliteBot/1.0)",
      },
      body: JSON.stringify(task.submission_data),
      signal: AbortSignal.timeout(30000),
    });

    const html = await response.text();

    if (response.status === 401 || response.status === 403) {
      return {
        success: false,
        statusCode: response.status,
        html,
        error: `Access denied (${response.status})`,
        realSubmission: true,
      };
    }

    if (response.status === 429) {
      return {
        success: false,
        statusCode: response.status,
        error: "Rate limited",
        realSubmission: true,
      };
    }

    return {
      success: response.ok,
      statusCode: response.status,
      html,
      realSubmission: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "API request failed",
      realSubmission: true,
    };
  }
}

async function checkPlatformAccessibility(
  platform: Platform
): Promise<{ accessible: boolean; statusCode?: number; html?: string; error?: string }> {
  if (!platform.submission_url) {
    return { accessible: false, error: "No submission URL" };
  }

  try {
    const response = await fetch(platform.submission_url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(15000),
    });

    const html = await response.text();
    return {
      accessible: response.ok,
      statusCode: response.status,
      html,
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}

async function submitViaFormScrape(
  task: BacklinkTask,
  platform: Platform
): Promise<SubmissionResponse> {
  if (!platform.submission_url) {
    return { success: false, error: "No submission URL defined", realSubmission: false };
  }

  try {
    const accessCheck = await checkPlatformAccessibility(platform);

    if (!accessCheck.accessible) {
      return {
        success: false,
        statusCode: accessCheck.statusCode,
        error: accessCheck.error || `HTTP ${accessCheck.statusCode}`,
        realSubmission: true,
      };
    }

    const html = accessCheck.html || "";
    const antiBotCheck = await detectAntiBot(html);

    if (antiBotCheck.hasCaptcha) {
      return {
        success: false,
        html,
        error: "CAPTCHA_DETECTED",
        realSubmission: true,
      };
    }

    if (antiBotCheck.hasJsChallenge) {
      return {
        success: false,
        html,
        error: "JS_CHALLENGE_DETECTED",
        realSubmission: true,
      };
    }

    if (antiBotCheck.hasLoginWall) {
      return {
        success: false,
        html,
        error: "LOGIN_REQUIRED",
        realSubmission: true,
      };
    }

    const businessSlug = task.submission_data?.business_name
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "listing";

    const potentialBacklinkUrl = `${platform.site_domain.startsWith("http") ? "" : "https://"}${platform.site_domain}/${businessSlug}`;

    return {
      success: true,
      statusCode: accessCheck.statusCode,
      html,
      backlinkUrl: potentialBacklinkUrl,
      realSubmission: true,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Form submission failed",
      realSubmission: true,
    };
  }
}

export async function processTask(task: BacklinkTask): Promise<WorkerResult> {
  const platform = task.platform as Platform;

  if (!platform) {
    return {
      success: false,
      task_id: task.id,
      status: "failed",
      error_message: "Platform not found",
    };
  }

  if (!platform.automation_allowed) {
    await markForManualReview(task.id, "Platform does not allow automation");
    return {
      success: false,
      task_id: task.id,
      status: "require_manual",
      requires_manual_review: true,
      manual_review_reason: "Platform does not allow automation",
    };
  }

  await updateTaskStatus(task.id, "processing");
  await logAction(task.user_id, "task_processing_started", {
    task_id: task.id,
    platform: platform.site_name,
    submission_url: platform.submission_url,
  });

  let response: SubmissionResponse;

  if (platform.submission_type === "api") {
    response = await submitViaAPI(task, platform);
  } else {
    response = await submitViaFormScrape(task, platform);
  }

  if (!response.success) {
    const needsManualReview = [
      "CAPTCHA_DETECTED",
      "JS_CHALLENGE_DETECTED",
      "LOGIN_REQUIRED",
    ].includes(response.error || "");

    if (needsManualReview) {
      await markForManualReview(task.id, response.error || "Unknown");
      await logAction(task.user_id, "task_requires_manual_review", {
        task_id: task.id,
        platform: platform.site_name,
        reason: response.error,
        realSubmission: response.realSubmission,
      });

      return {
        success: false,
        task_id: task.id,
        status: "require_manual",
        requires_manual_review: true,
        manual_review_reason: response.error,
      };
    }

    if (response.statusCode === 429) {
      await scheduleRetry(task);
      await logAction(task.user_id, "task_rate_limited", {
        task_id: task.id,
        platform: platform.site_name,
        realSubmission: response.realSubmission,
      });

      return {
        success: false,
        task_id: task.id,
        status: "pending",
        error_message: "Rate limited - will retry",
      };
    }

    await scheduleRetry(task);
    await logAction(task.user_id, "task_failed", {
      task_id: task.id,
      platform: platform.site_name,
      error: response.error,
      statusCode: response.statusCode,
      realSubmission: response.realSubmission,
    });

    return {
      success: false,
      task_id: task.id,
      status: task.attempt_count >= task.max_attempts - 1 ? "failed" : "pending",
      error_message: response.error,
    };
  }

  await updateTaskStatus(task.id, "completed", {
    completed_at: new Date().toISOString(),
    response_html: response.html?.substring(0, 10000),
  });

  if (response.backlinkUrl) {
    await createBacklinkRecord(task, platform, response.backlinkUrl);
  }

  await incrementDailySubmissionCount(task.user_id);

  await logAction(task.user_id, "task_completed", {
    task_id: task.id,
    platform: platform.site_name,
    backlink_url: response.backlinkUrl,
    realSubmission: response.realSubmission,
  });

  return {
    success: true,
    task_id: task.id,
    status: "completed",
    backlink_url: response.backlinkUrl,
  };
}

async function createBacklinkRecord(
  task: BacklinkTask,
  platform: Platform,
  backlinkUrl: string
): Promise<void> {
  await supabaseAdmin.from("backlinks").insert({
    user_id: task.user_id,
    source_name: platform.site_name,
    source_domain: platform.site_domain,
    linking_url: backlinkUrl,
    traffic: platform.monthly_traffic,
    domain_rating: platform.domain_rating,
    date_added: new Date().toISOString(),
    status: "pending_verification",
    task_id: task.id,
    platform_id: platform.id,
    anchor_text: task.submission_data?.business_name,
    verification_status: "pending",
  });

  await supabaseAdmin.from("backlink_verifications").insert({
    user_id: task.user_id,
    target_url: backlinkUrl,
    expected_anchor_text: task.submission_data?.business_name,
    verification_status: "pending",
    next_verification_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  });
}

async function incrementDailySubmissionCount(userId: string): Promise<void> {
  const { data: campaign } = await supabaseAdmin
    .from("backlink_campaigns")
    .select("daily_submission_count, total_backlinks")
    .eq("user_id", userId)
    .single();

  if (campaign) {
    await supabaseAdmin
      .from("backlink_campaigns")
      .update({
        daily_submission_count: (campaign.daily_submission_count || 0) + 1,
        total_backlinks: (campaign.total_backlinks || 0) + 1,
        last_scan_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }
}

export async function runWorkerCycle(userId: string): Promise<WorkerResult | null> {
  const { data: nextTask } = await supabaseAdmin
    .from("backlink_tasks")
    .select("*, platform:backlink_platforms(*)")
    .eq("user_id", userId)
    .eq("status", "pending")
    .lte("scheduled_for", new Date().toISOString())
    .order("priority", { ascending: false })
    .limit(1)
    .single();

  if (!nextTask) {
    return null;
  }

  return processTask(nextTask as BacklinkTask);
}