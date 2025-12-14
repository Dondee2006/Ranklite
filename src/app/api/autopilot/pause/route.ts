import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, name")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json(
      { error: "No site found" },
      { status: 404 }
    );
  }

  const { data: existingSettings } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  if (!existingSettings) {
    return NextResponse.json(
      { error: "No autopilot settings found" },
      { status: 404 }
    );
  }

  if (!existingSettings.enabled) {
    return NextResponse.json(
      { 
        message: "Autopilot is already paused",
        settings: existingSettings,
      },
      { status: 200 }
    );
  }

  const { data: updatedSettings, error } = await supabase
    .from("autopilot_settings")
    .update({
      enabled: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", existingSettings.id)
    .select()
    .single();

  if (error) {
    console.error("Failed to pause autopilot:", error);
    return NextResponse.json(
      { error: "Failed to pause autopilot" },
      { status: 500 }
    );
  }

  const { data: queuedArticles } = await supabase
    .from("articles")
    .select("id")
    .eq("site_id", site.id)
    .eq("status", "queued")
    .order("scheduled_date", { ascending: true });

  return NextResponse.json({
    success: true,
    message: "Autopilot paused successfully",
    settings: updatedSettings,
    impact: {
      queuedArticlesCount: queuedArticles?.length || 0,
      note: "Queued articles will not be automatically generated. You can manually generate them or restart autopilot.",
    },
  });
}
