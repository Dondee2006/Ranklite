import { supabaseAdmin } from "@/lib/supabase/admin";

export async function logAction(
  userId: string,
  action: string,
  details?: Record<string, unknown>,
  options?: {
    taskId?: string;
    platformId?: string;
    robotsTxtChecked?: boolean;
    tosCompliant?: boolean;
    screenshotUrl?: string;
  }
): Promise<void> {
  try {
    await supabaseAdmin.from("backlink_logs").insert({
      user_id: userId,
      task_id: options?.taskId,
      platform_id: options?.platformId,
      action,
      status: "logged",
      details,
      robots_txt_checked: options?.robotsTxtChecked ?? false,
      tos_compliant: options?.tosCompliant ?? true,
      screenshot_url: options?.screenshotUrl,
    });
  } catch (error) {
    console.error("Failed to log action:", error);
  }
}

export async function getRecentLogs(
  userId: string,
  limit = 50
): Promise<Array<{
  id: string;
  action: string;
  status: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}>> {
  const { data } = await supabaseAdmin
    .from("backlink_logs")
    .select("id, action, status, details, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  return data || [];
}

export async function getTaskLogs(
  taskId: string
): Promise<Array<{
  id: string;
  action: string;
  status: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}>> {
  const { data } = await supabaseAdmin
    .from("backlink_logs")
    .select("id, action, status, details, created_at")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  return data || [];
}
