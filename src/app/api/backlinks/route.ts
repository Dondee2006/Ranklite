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
      backlinks: backlinks || [],
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
