import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: articles } = await supabase
      .from("articles")
      .select("id, title, status, updated_at, site_id")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(10);

    const { data: backlinks } = await supabase
      .from("backlink_tasks")
      .select("id, platform, status, updated_at, site_id")
      .order("updated_at", { ascending: false })
      .limit(10);

    const { data: calendar } = await supabase
      .from("content_calendar")
      .select("id, title, status, updated_at, site_id")
      .order("updated_at", { ascending: false })
      .limit(10);

    const activities = [
      ...(articles || []).map((article) => ({
        id: article.id,
        name: article.title || "Untitled Article",
        type: "Content" as const,
        status: article.status === "published" ? "Published" : article.status === "draft" ? "Planned" : "Pending",
        cycle: "Content Creation",
        last_updated: new Date(article.updated_at).toLocaleDateString(),
      })),
      ...(backlinks || []).map((backlink) => ({
        id: backlink.id,
        name: backlink.platform || "Backlink Task",
        type: "Backlink" as const,
        status: backlink.status === "completed" ? "Verified" : backlink.status === "pending" ? "Pending" : "Planned",
        cycle: "Link Building",
        last_updated: new Date(backlink.updated_at).toLocaleDateString(),
      })),
      ...(calendar || []).map((item) => ({
        id: item.id,
        name: item.title || "Content Item",
        type: "Validation" as const,
        status: item.status === "published" ? "Verified" : item.status === "scheduled" ? "Planned" : "Pending",
        cycle: "Content Planning",
        last_updated: new Date(item.updated_at).toLocaleDateString(),
      })),
    ]
      .sort((a, b) => {
        const dateA = new Date(a.last_updated);
        const dateB = new Date(b.last_updated);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 15);

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to load activities" }, { status: 500 });
  }
}