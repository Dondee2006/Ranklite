import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/gsc/client";
import { syncGSCData } from "@/lib/gsc/sync";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret";
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: integrations } = await supabaseAdmin
      .from("gsc_integrations")
      .select("site_id, auto_refresh_enabled")
      .eq("auto_refresh_enabled", true);

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ 
        message: "No active integrations to sync",
        synced: 0 
      });
    }

    const results = await Promise.allSettled(
      integrations.map((integration) => syncGSCData(integration.site_id))
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      success: true,
      message: `GSC daily sync completed`,
      synced: successful,
      failed,
      total: integrations.length,
    });
  } catch (error) {
    console.error("GSC cron sync error:", error);
    return NextResponse.json(
      { error: "Failed to run GSC daily sync" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: "GSC daily sync endpoint",
    method: "Use POST with Authorization header" 
  });
}
