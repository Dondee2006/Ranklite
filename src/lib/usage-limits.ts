import { createServerClient } from "@/lib/supabase/server";

export interface PlanLimits {
  posts_per_month: number;
  backlinks_per_post: number;
  qa_validation: boolean;
  integrations_limit: number;
}

export interface UsageData {
  posts_generated: number;
  backlinks_generated: number;
  period_start: string;
  period_end: string;
}

export interface UsageStatus {
  allowed: boolean;
  usage: UsageData;
  limits: PlanLimits;
  percentUsed: {
    posts: number;
    backlinks: number;
  };
  message?: string;
}

export async function getUserPlanAndUsage(userId: string): Promise<{
  plan: PlanLimits | null;
  usage: UsageData | null;
  status: string;
  periodEnd: string | null;
}> {
  const supabase = await createServerClient();

  const { data: userPlan } = await supabase
    .from("user_plans")
    .select("*, plans(*)")
    .eq("user_id", userId)
    .eq("status", "active")
    .single();

  if (!userPlan || !userPlan.plans) {
    return { plan: null, usage: null, status: "no_plan", periodEnd: null };
  }

  const periodStart = userPlan.current_period_start || new Date().toISOString();
  const periodEnd =
    userPlan.current_period_end ||
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .gte("period_start", periodStart)
    .lte("period_end", periodEnd)
    .single();

  const usageData: UsageData = usage || {
    posts_generated: 0,
    backlinks_generated: 0,
    period_start: periodStart,
    period_end: periodEnd,
  };

  return {
    plan: {
      posts_per_month: userPlan.plans.posts_per_month,
      backlinks_per_post: userPlan.plans.backlinks_per_post,
      qa_validation: userPlan.plans.qa_validation,
      integrations_limit: userPlan.plans.integrations_limit,
    },
    usage: usageData,
    status: userPlan.status,
    periodEnd: periodEnd,
  };
}

export async function checkPostGenerationLimit(
  userId: string
): Promise<UsageStatus> {
  const { plan, usage, status } = await getUserPlanAndUsage(userId);

  if (!plan || !usage) {
    return {
      allowed: false,
      usage: usage || {
        posts_generated: 0,
        backlinks_generated: 0,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
      },
      limits: plan || {
        posts_per_month: 0,
        backlinks_per_post: 0,
        qa_validation: false,
        integrations_limit: 0,
      },
      percentUsed: { posts: 0, backlinks: 0 },
      message: "No active plan found. Please subscribe to a plan.",
    };
  }

  if (status !== "active") {
    return {
      allowed: false,
      usage,
      limits: plan,
      percentUsed: {
        posts: (usage.posts_generated / plan.posts_per_month) * 100,
        backlinks: 0,
      },
      message: `Plan status is ${status}. Please update your subscription.`,
    };
  }

  const postsUsedPercent =
    (usage.posts_generated / plan.posts_per_month) * 100;

  if (usage.posts_generated >= plan.posts_per_month) {
    return {
      allowed: false,
      usage,
      limits: plan,
      percentUsed: {
        posts: postsUsedPercent,
        backlinks: 0,
      },
      message: `Monthly post limit reached (${usage.posts_generated}/${plan.posts_per_month}). Upgrade your plan or wait for next cycle.`,
    };
  }

  return {
    allowed: true,
    usage,
    limits: plan,
    percentUsed: {
      posts: postsUsedPercent,
      backlinks: 0,
    },
  };
}

export async function checkBacklinkGenerationLimit(
  userId: string,
  requestedBacklinks: number
): Promise<UsageStatus> {
  const { plan, usage } = await getUserPlanAndUsage(userId);

  if (!plan || !usage) {
    return {
      allowed: false,
      usage: usage || {
        posts_generated: 0,
        backlinks_generated: 0,
        period_start: new Date().toISOString(),
        period_end: new Date().toISOString(),
      },
      limits: plan || {
        posts_per_month: 0,
        backlinks_per_post: 0,
        qa_validation: false,
        integrations_limit: 0,
      },
      percentUsed: { posts: 0, backlinks: 0 },
      message: "No active plan found.",
    };
  }

  if (requestedBacklinks > plan.backlinks_per_post) {
    return {
      allowed: false,
      usage,
      limits: plan,
      percentUsed: {
        posts: (usage.posts_generated / plan.posts_per_month) * 100,
        backlinks: 0,
      },
      message: `Requested backlinks (${requestedBacklinks}) exceeds plan limit (${plan.backlinks_per_post} per post).`,
    };
  }

  return {
    allowed: true,
    usage,
    limits: plan,
    percentUsed: {
      posts: (usage.posts_generated / plan.posts_per_month) * 100,
      backlinks: 0,
    },
  };
}

export async function checkIntegrationLimit(
  userId: string
): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  const { plan } = await getUserPlanAndUsage(userId);
  const supabase = await createServerClient();

  if (!plan) {
    return { allowed: false, current: 0, limit: 0, message: "No active plan found." };
  }

  const { count } = await supabase
    .from("integrations")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const currentIntegrations = count || 0;

  if (plan.integrations_limit === -1) {
    return { allowed: true, current: currentIntegrations, limit: -1 };
  }

  if (currentIntegrations >= plan.integrations_limit) {
    return {
      allowed: false,
      current: currentIntegrations,
      limit: plan.integrations_limit,
      message: `Integration limit reached (${currentIntegrations}/${plan.integrations_limit}).`,
    };
  }

  return { allowed: true, current: currentIntegrations, limit: plan.integrations_limit };
}

export async function incrementPostUsage(userId: string): Promise<void> {
  const supabase = await createServerClient();
  const { usage } = await getUserPlanAndUsage(userId);

  if (!usage) {
    const periodStart = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await supabase.from("usage_tracking").insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      posts_generated: 1,
      backlinks_generated: 0,
    });
  } else {
    await supabase
      .from("usage_tracking")
      .update({
        posts_generated: usage.posts_generated + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .gte("period_start", usage.period_start)
      .lte("period_end", usage.period_end);
  }
}

export async function incrementBacklinkUsage(
  userId: string,
  count: number
): Promise<void> {
  const supabase = await createServerClient();
  const { usage } = await getUserPlanAndUsage(userId);

  if (!usage) {
    const periodStart = new Date();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await supabase.from("usage_tracking").insert({
      user_id: userId,
      period_start: periodStart.toISOString(),
      period_end: periodEnd.toISOString(),
      posts_generated: 0,
      backlinks_generated: count,
    });
  } else {
    await supabase
      .from("usage_tracking")
      .update({
        backlinks_generated: usage.backlinks_generated + count,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .gte("period_start", usage.period_start)
      .lte("period_end", usage.period_end);
  }
}

export async function shouldNotifyUsage(userId: string): Promise<{
  notify80: boolean;
  notify100: boolean;
  notifyExpired: boolean;
}> {
  const { plan, usage, periodEnd } = await getUserPlanAndUsage(userId);

  if (!plan || !usage) {
    return { notify80: false, notify100: false, notifyExpired: false };
  }

  const postsPercent = (usage.posts_generated / plan.posts_per_month) * 100;
  const periodEndDate = periodEnd ? new Date(periodEnd) : null;
  const now = new Date();

  return {
    notify80: postsPercent >= 80 && postsPercent < 100,
    notify100: postsPercent >= 100,
    notifyExpired: periodEndDate ? periodEndDate < now : false,
  };
}
