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
    .select("*, target_audiences(*), competitors(*)")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ settings: null });
  }

  return NextResponse.json({ settings: site });
}

export async function PATCH(request: Request) {
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

  const { error } = await supabase
    .from("sites")
    .update({
      name: body.name,
      url: body.url,
      niche: body.niche,
      language: body.language,
      country: body.country,
      description: body.description,
      updated_at: new Date().toISOString(),
    })
    .eq("id", site.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.targetAudience) {
    await supabase.from("target_audiences").delete().eq("site_id", site.id);
    await supabase.from("target_audiences").insert({
      site_id: site.id,
      name: body.targetAudience,
      description: body.targetAudience,
    });
  }

  if (body.competitors && Array.isArray(body.competitors)) {
    await supabase.from("competitors").delete().eq("site_id", site.id);
    if (body.competitors.length > 0) {
      const competitorInserts = body.competitors.map((url: string) => ({
        site_id: site.id,
        url,
      }));
      await supabase.from("competitors").insert(competitorInserts);
    }
  }

  return NextResponse.json({ success: true });
}
