import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { data: exchangeLinks } = await supabase
      .from("exchange_links")
      .select("id, source_domain, status, updated_at, target_user_id")
      .eq("target_user_id", user.id)
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
      ...(exchangeLinks || []).map((link) => ({
        id: link.id,
        name: link.source_domain || "Link Request",
        type: "Backlink" as const,
        status: link.status === "verified" ? "Verified" : (link.status === "pending" || link.status === "requested") ? "Pending" : "Placed",
        cycle: "Authority Exchange",
        last_updated: new Date(link.updated_at).toLocaleDateString(),
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