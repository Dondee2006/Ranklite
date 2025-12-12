import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  let query = supabase
    .from("articles")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_date", { ascending: true });

  if (month !== null && year !== null) {
    const startDate = `${year}-${String(Number(month) + 1).padStart(2, "0")}-01`;
    const endDate = `${year}-${String(Number(month) + 2).padStart(2, "0")}-01`;
    query = query.gte("scheduled_date", startDate).lt("scheduled_date", endDate);
  }

  const { data } = await query;

  return NextResponse.json({ articles: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

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

  const article = {
    site_id: site.id,
    user_id: user.id,
    title: body.title,
    slug: body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    keyword: body.keyword,
    secondary_keywords: body.secondary_keywords || [],
    search_intent: body.search_intent || "informational",
    article_type: body.article_type || "guide",
    word_count: body.word_count || 1500,
    cta_placement: body.cta_placement || "end",
    status: body.status || "planned",
    scheduled_date: body.scheduled_date,
    volume: body.volume || null,
    difficulty: body.difficulty || null,
  };

  const { data, error } = await supabase
    .from("articles")
    .insert([article])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ article: data });
}