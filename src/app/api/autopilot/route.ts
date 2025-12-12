import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ settings: null });
  }

  const { data: settings } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  return NextResponse.json({ settings });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data, error } = await supabase
    .from("autopilot_settings")
    .upsert({
      site_id: site.id,
      enabled: body.enabled ?? false,
      publish_time_start: body.publish_time_start ?? 7,
      publish_time_end: body.publish_time_end ?? 9,
      timezone: body.timezone ?? "UTC",
      articles_per_day: body.articles_per_day ?? 1,
      preferred_article_types: body.preferred_article_types ?? [],
      tone: body.tone ?? "natural",
      style_preferences: body.style_preferences ?? {},
      cms_targets: body.cms_targets ?? [],
      updated_at: new Date().toISOString(),
    }, { onConflict: "site_id" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ settings: data });
}
