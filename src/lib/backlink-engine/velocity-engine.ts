import { supabaseAdmin } from "@/lib/supabase/admin";

export type AnchorType = "branded" | "partial_match" | "generic" | "exact_match";

export interface VelocityConfig {
  linksPerPost: number;
  monthlyBacklinkCap: number;
  dailyBacklinkCap: number;
}

export interface AnchorDistribution {
  branded: number;
  partial_match: number;
  generic: number;
  exact_match: number;
}

const ANCHOR_DISTRIBUTION: AnchorDistribution = {
  branded: 0.4,
  partial_match: 0.3,
  generic: 0.2,
  exact_match: 0.1,
};

export function generateAnchorTypes(totalBacklinks: number): AnchorType[] {
  const anchors: AnchorType[] = [];

  const counts = {
    branded: Math.floor(totalBacklinks * ANCHOR_DISTRIBUTION.branded),
    partial_match: Math.floor(totalBacklinks * ANCHOR_DISTRIBUTION.partial_match),
    generic: Math.floor(totalBacklinks * ANCHOR_DISTRIBUTION.generic),
    exact_match: Math.floor(totalBacklinks * ANCHOR_DISTRIBUTION.exact_match),
  };

  const remaining = totalBacklinks - Object.values(counts).reduce((a, b) => a + b, 0);
  counts.branded += remaining;

  for (let i = 0; i < counts.branded; i++) anchors.push("branded");
  for (let i = 0; i < counts.partial_match; i++) anchors.push("partial_match");
  for (let i = 0; i < counts.generic; i++) anchors.push("generic");
  for (let i = 0; i < counts.exact_match; i++) anchors.push("exact_match");

  return shuffleArray(anchors);
}

export function generateAnchorText(
  type: AnchorType,
  brandName: string,
  keyword: string,
  url: string
): string {
  switch (type) {
    case "branded":
      return Math.random() > 0.5 ? brandName : url;
    case "partial_match":
      return `${keyword} guide`;
    case "generic":
      const generics = ["click here", "learn more", "read more", "check this out", "visit site"];
      return generics[Math.floor(Math.random() * generics.length)];
    case "exact_match":
      return keyword;
    default:
      return brandName;
  }
}

export function calculateDripSchedule(
  totalBacklinks: number,
  startDate: Date = new Date()
): { dates: Date[]; dripDays: number } {
  const minDays = 7;
  const maxDays = 21;

  const dripDays = Math.min(maxDays, Math.max(minDays, Math.ceil(totalBacklinks / 3)));

  const dates: Date[] = [];
  const backlinksPerDay = Math.ceil(totalBacklinks / dripDays);

  for (let i = 0; i < totalBacklinks; i++) {
    const dayOffset = Math.floor(i / backlinksPerDay);
    const scheduledDate = new Date(startDate);
    scheduledDate.setDate(scheduledDate.getDate() + dayOffset);
    dates.push(scheduledDate);
  }

  return { dates, dripDays };
}

export async function checkDomainAge(url: string): Promise<{ isNew: boolean; ageInMonths: number }> {
  try {
    const domain = new URL(url).hostname;

    const { data: site } = await supabaseAdmin
      .from("sites")
      .select("created_at")
      .eq("url", url)
      .single();

    if (!site?.created_at) {
      return { isNew: false, ageInMonths: 12 };
    }

    const createdDate = new Date(site.created_at);
    const now = new Date();
    const ageInMonths = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    return {
      isNew: ageInMonths < 6,
      ageInMonths,
    };
  } catch (error) {
    console.error("Error checking domain age:", error);
    return { isNew: false, ageInMonths: 12 };
  }
}

export function applyDomainAgeSafety(backlinkCount: number, domainAgeMonths: number): number {
  if (domainAgeMonths < 6) {
    return Math.floor(backlinkCount * 0.7);
  }
  return backlinkCount;
}

export async function checkDailyBacklinkLimit(
  userId: string,
  dailyLimit: number
): Promise<{ allowed: boolean; used: number; remaining: number }> {
  const today = new Date().toISOString().split("T")[0];

  const { data: usage } = await supabaseAdmin
    .from("usage_tracking")
    .select("backlinks_today, last_backlink_date")
    .eq("user_id", userId)
    .single();

  if (!usage || usage.last_backlink_date !== today) {
    return { allowed: true, used: 0, remaining: dailyLimit };
  }

  const used = usage.backlinks_today || 0;
  const remaining = Math.max(0, dailyLimit - used);

  return {
    allowed: used < dailyLimit,
    used,
    remaining,
  };
}

export async function incrementDailyBacklinkUsage(userId: string, count: number = 1): Promise<void> {
  const today = new Date().toISOString().split("T")[0];

  const { data: usage } = await supabaseAdmin
    .from("usage_tracking")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!usage) {
    await supabaseAdmin.from("usage_tracking").insert({
      user_id: userId,
      period_start: new Date(),
      period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      backlinks_generated: count,
      backlinks_today: count,
      last_backlink_date: today,
    });
    return;
  }

  const needsReset = usage.last_backlink_date !== today;

  await supabaseAdmin
    .from("usage_tracking")
    .update({
      backlinks_generated: usage.backlinks_generated + count,
      backlinks_today: needsReset ? count : (usage.backlinks_today || 0) + count,
      last_backlink_date: today,
      updated_at: new Date(),
    })
    .eq("user_id", userId);
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function createBacklinkSchedule(
  userId: string,
  articleId: string,
  totalBacklinks: number
): Promise<string> {
  const { dates, dripDays } = calculateDripSchedule(totalBacklinks);

  const { data: schedule, error } = await supabaseAdmin
    .from("backlink_schedule")
    .insert({
      user_id: userId,
      article_id: articleId,
      total_backlinks: totalBacklinks,
      backlinks_created: 0,
      drip_start_date: dates[0],
      drip_end_date: dates[dates.length - 1],
      status: "active",
    })
    .select()
    .single();

  if (error) throw error;

  return schedule.id;
}

export async function getDueBacklinks(userId: string): Promise<unknown[]> {
  const today = new Date().toISOString().split("T")[0];

  const { data: tasks } = await supabaseAdmin
    .from("backlink_tasks")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "pending")
    .lte("scheduled_date", today)
    .order("scheduled_date", { ascending: true });

  return tasks || [];
}
