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
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    const siteId = sites?.[0]?.id;

    if (!siteId) {
      return NextResponse.json({ posts: [] });
    }

    const { data: articles } = await supabase
      .from("articles")
      .select("*")
      .eq("site_id", siteId)
      .order("created_at", { ascending: false })
      .limit(50);

    const posts = (articles || []).map(article => ({
      id: article.id,
      title: article.title,
      target_keyword: article.keyword || "N/A",
      status: article.status === "published" ? "Published" : article.status === "generating" ? "Generated" : "Planned",
      backlinks_assigned: 0,
      indexing_status: "Pending",
      published_date: article.published_at 
        ? new Date(article.published_at).toLocaleDateString() 
        : "Not published",
    }));

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Error loading posts:", error);
    return NextResponse.json({ posts: [] });
  }
}