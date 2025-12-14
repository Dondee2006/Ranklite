import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sites } = await supabase
      .from("sites")
      .select("id, website_url, business_name, business_description, target_audience, competitors")
      .eq("user_id", user.id)
      .limit(1)
      .single();

    const hasSettings = !!(sites?.business_name && sites?.business_description);

    const { data: contentCalendar } = await supabase
      .from("content_calendar")
      .select("id")
      .eq("site_id", sites?.id)
      .limit(1);

    const hasContentCalendar = (contentCalendar && contentCalendar.length > 0);

    const { data: autopilotSettings } = await supabase
      .from("autopilot_settings")
      .select("enabled")
      .eq("site_id", sites?.id)
      .limit(1)
      .single();

    const hasAutopilot = autopilotSettings?.enabled === true;

    const { data: backlinkTasks } = await supabase
      .from("backlink_tasks")
      .select("id")
      .eq("site_id", sites?.id)
      .limit(1);

    const hasBacklinks = (backlinkTasks && backlinkTasks.length > 0);

    const { data: gscIntegration } = await supabase
      .from("gsc_integrations")
      .select("id")
      .eq("site_id", sites?.id)
      .limit(1);

    const hasPerformance = (gscIntegration && gscIntegration.length > 0);

    return NextResponse.json({
      steps: {
        settings: hasSettings,
        planner: hasContentCalendar,
        content: hasAutopilot,
        backlinks: hasBacklinks,
        qa: hasBacklinks,
        performance: hasPerformance,
      },
    });
  } catch (error) {
    console.error("Error fetching workflow status:", error);
    return NextResponse.json(
      { error: "Failed to fetch workflow status" },
      { status: 500 }
    );
  }
}
