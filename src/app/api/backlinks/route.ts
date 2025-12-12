import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: backlinks, error: backlinksError } = await supabase
      .from("backlinks")
      .select("*")
      .eq("user_id", user.id)
      .order("date_added", { ascending: false });

    if (backlinksError) throw backlinksError;

    const { data: campaign, error: campaignError } = await supabase
      .from("backlink_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (campaignError && campaignError.code !== "PGRST116") throw campaignError;

    return NextResponse.json({
      backlinks: backlinks || [],
      campaign: campaign || {
        status: "active",
        agent_status: "idle",
        current_step: null,
        total_backlinks: 0,
        unique_sources: 0,
        avg_domain_rating: 0,
        this_month_backlinks: 0,
        website_url: null,
        last_scan_at: null,
        next_scan_at: null,
      },
    });
  } catch (error) {
    console.error("Failed to fetch backlinks:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlinks" },
      { status: 500 }
    );
  }
}