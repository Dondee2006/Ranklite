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

    const { data: sites } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    const siteId = sites?.[0]?.id;

    if (siteId) {
      const { data: articles } = await supabase
        .from("articles")
        .select("id, title, status, created_at")
        .eq("site_id", siteId)
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

    const { data: verifications } = await supabase
      .from("backlink_verification")
      .select("id, verification_status, last_verified_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (verifications) {
      activities.push(...verifications.map(verification => ({
        id: verification.id,
        name: `Validation Check`,
        type: "Validation" as const,
        status: verification.verification_status === "verified" ? "Verified" as const : 
                verification.verification_status === "failed" ? "Failed" as const : 
                "Pending" as const,
        cycle: "December 2025",
        last_updated: verification.last_verified_at 
          ? new Date(verification.last_verified_at).toLocaleDateString()
          : new Date(verification.created_at).toLocaleDateString()
      })));
    }

    activities.sort((a, b) => 
      new Date(b.last_updated).getTime() - new Date(a.last_updated).getTime()
    );

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error loading activities:", error);
    return NextResponse.json({ activities: [] });
  }
}