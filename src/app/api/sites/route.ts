import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("sites")
    .select("*, target_audiences(*), competitors(*), article_settings(*)")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ site: data });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  const { data: existingSite } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existingSite) {
    const { data, error } = await supabase
      .from("sites")
      .update({
        name: body.name,
        url: body.url,
        language: body.language,
        country: body.country,
        description: body.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingSite.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ site: data });
  }

  const { data, error } = await supabase
    .from("sites")
    .insert({
      user_id: user.id,
      name: body.name,
      url: body.url,
      language: body.language,
      country: body.country,
      description: body.description,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ site: data });
}
