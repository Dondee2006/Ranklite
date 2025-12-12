import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getQueueStats } from "@/lib/backlink-engine";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query = supabaseAdmin
      .from("backlink_tasks")
      .select("*, platform:backlink_platforms(site_name, site_domain, domain_rating, submission_url)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (filter && filter !== "all") {
      query = query.eq("status", filter);
    }

    const { data: tasks, error } = await query;

    if (error) throw error;

    const stats = await getQueueStats(user.id);

    return NextResponse.json({
      tasks: tasks || [],
      stats,
      manual_review_tasks: tasks || [],
    });
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}