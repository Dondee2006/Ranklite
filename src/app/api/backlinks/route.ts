import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch tasks with platform details
    const { data: tasks, error } = await supabaseAdmin
      .from("backlink_tasks")
      .select("*, platform:backlink_platforms(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Map tasks to Backlink interface
    const backlinks = tasks.map((task: any) => ({
      id: task.id,
      source_name: task.platform?.site_name || task.submission_data?.business_name || "Unknown",
      source_domain: task.platform?.site_domain || task.website_url,
      linking_url: task.submission_data?.target_url || task.website_url, // fallback
      traffic: "N/A", // Not stored yet
      domain_rating: task.platform?.domain_rating || 0,
      date_added: task.created_at,
      status: task.status === "completed" ? "Live" :
        task.status === "processing" ? "Pending" :
          task.status === "require_manual" ? "Manual Review" :
            task.status.charAt(0).toUpperCase() + task.status.slice(1),
      verification_status: task.verification_status,
      is_dofollow: true // default/unknown
    }));

    // Fetch campaign stats (lightweight version for header if needed, but page fetches separate campaign endpoint anyway)
    // We can just return null campaign here as the page fetches /api/backlinks/campaign separately for full stats.
    // However, the page implementation (BacklinkGeneratorPage line 198) expects { backlinks: ..., campaign: ... } from this endpoint?
    // Line 196: const backlinksData = await backlinksRes.json();
    // Line 199: setCampaign(backlinksData.campaign || campaignData.campaign);
    // So distinct endpoints are used. We can return just backlinks here.

    return NextResponse.json({
      backlinks,
      // We don't need to return full campaign object here if the other endpoint handles it.
    });
  } catch (error) {
    console.error("Failed to fetch backlinks:", error);
    return NextResponse.json({ error: "Failed to fetch backlinks" }, { status: 500 });
  }
}
