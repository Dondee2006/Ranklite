import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's backlink campaign
    const { data: campaigns, error: campaignError } = await supabase
      .from("backlink_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (campaignError) {
      console.error("Error fetching campaign:", campaignError);
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    const campaign = campaigns?.[0] || {
      status: "idle",
      agent_status: "idle",
      current_step: null,
      total_backlinks: 0,
      unique_sources: 0,
      avg_domain_rating: 0,
      this_month_backlinks: 0,
      pending_tasks: 0,
      website_url: null,
      last_scan_at: null,
      next_scan_at: null,
    };

    // Fetch the user's backlinks
    const { data: backlinks, error: backlinksError } = await supabase
      .from("backlinks")
      .select("*")
      .eq("user_id", user.id)
      .order("date_added", { ascending: false });

    if (backlinksError) {
      console.error("Error fetching backlinks:", backlinksError);
      return NextResponse.json({ error: backlinksError.message }, { status: 500 });
    }

    // Fetch active tasks that aren't yet in the backlinks table but are being worked on
    const { data: activeTasks } = await supabase
      .from("backlink_tasks")
      .select("*, platform:backlink_platforms(*)")
      .eq("user_id", user.id)
      .in("status", ["processing", "require_manual"])
      .order("updated_at", { ascending: false });

    // Map active tasks to a similar format as backlinks
    const taskBacklinks = (activeTasks || []).map((task: any) => ({
      id: `task-${task.id}`,
      source_name: task.platform?.site_name || "Pending Platform",
      source_domain: task.platform?.site_domain || "",
      linking_url: task.backlink_url || "",
      anchor_text: task.submission_data?.business_name || "-",
      domain_rating: task.platform?.domain_rating || 0,
      status: task.status === "require_manual" ? "Failed" : "pending_verification",
      date_added: task.created_at,
      is_task: true,
    }));

    // Combine them
    const allBacklinks = [...(backlinks || []), ...taskBacklinks];

    // Get current pending tasks count if campaign exists
    let pendingTasksCount = campaign.pending_tasks || 0;
    if (campaign.id) {
      const { count } = await supabase
        .from("backlink_tasks")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "pending");
      pendingTasksCount = count || 0;
    }

    return NextResponse.json({
      backlinks: allBacklinks,
      campaign: {
        ...campaign,
        pending_tasks: pendingTasksCount
      },
    });
  } catch (error) {
    console.error("Failed to fetch backlinks:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
