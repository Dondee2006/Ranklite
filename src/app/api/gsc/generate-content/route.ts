import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createArticlesFromGSCInsights, suggestMetaUpdates } from "@/lib/gsc/autopilot";

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const action = body.action || "create_articles";

    if (action === "create_articles") {
      const created = await createArticlesFromGSCInsights(site.id);
      return NextResponse.json({
        success: true,
        message: `Created ${created} article briefs from GSC insights`,
        created,
      });
    }

    if (action === "suggest_meta_updates") {
      const suggestions = await suggestMetaUpdates(site.id);
      return NextResponse.json({
        success: true,
        suggestions,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("GSC content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content from GSC data" },
      { status: 500 }
    );
  }
}
