import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const activities = [];

    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (articles) {
      activities.push(...articles.map(article => ({
        id: article.id,
        name: article.title,
        type: "Content" as const,
        status: article.status === "published" ? "Published" as const : "Planned" as const,
        cycle: "December 2025",
        last_updated: new Date(article.created_at).toLocaleDateString()
      })));
    }

    const { data: backlinks } = await supabase
      .from("backlinks")
      .select("id, source_name, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (backlinks) {
      activities.push(...backlinks.map(backlink => ({
        id: backlink.id,
        name: backlink.source_name,
        type: "Backlink" as const,
        status: backlink.status === "indexed" ? "Verified" as const : "Pending" as const,
        cycle: "December 2025",
        last_updated: new Date(backlink.created_at).toLocaleDateString()
      })));
    }

    activities.sort((a, b) => 
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error loading activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
