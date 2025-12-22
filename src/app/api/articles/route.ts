import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: sites } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .limit(1);

    const site = sites?.[0];

    if (!site) {
      return NextResponse.json({ articles: [] });
    }

    let query = supabase
      .from("articles")
      .select("*")
      .eq("site_id", site.id)
      .order("scheduled_date", { ascending: true });

    if (month && year) {
      const startDate = `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-01`;
      const endDate = `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-31`;
      query = query.gte("scheduled_date", startDate).lte("scheduled_date", endDate);
    }

    const { data: articles, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ articles: articles || [] });
  } catch (error) {
    console.error("Failed to fetch articles:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Get user's site
    const { data: sites } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .order("id", { ascending: true })
      .limit(1);

    const site = sites?.[0];

    if (!site) {
      return NextResponse.json({ error: "No site found" }, { status: 404 });
    }

    const { data: article, error } = await supabase
      .from("articles")
      .insert({
        ...body,
        site_id: site.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
