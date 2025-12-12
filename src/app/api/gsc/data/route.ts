import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGSCIntegration } from "@/lib/gsc/client";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const integration = await getGSCIntegration(site.id);

    if (!integration) {
      return NextResponse.json(
        { error: "GSC not connected" },
        { status: 404 }
      );
    }

    const { data: performanceData } = await supabase
      .from("gsc_performance_data")
      .select("*")
      .eq("site_id", site.id)
      .order("date", { ascending: false })
      .limit(1000);

    return NextResponse.json({
      connected: true,
      siteUrl: integration.site_url,
      metrics: integration.metrics,
      lastSync: integration.last_sync_at,
      autoRefreshEnabled: integration.auto_refresh_enabled,
      performanceData: performanceData || [],
    });
  } catch (error) {
    console.error("GSC data fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GSC data" },
      { status: 500 }
    );
  }
}
