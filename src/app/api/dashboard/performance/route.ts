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

    const { data: site } = await supabase
      .from("sites")
      .select("id, site_url")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Fetch GSC data
    const { data: gscData } = await supabase
      .from("gsc_performance_data")
      .select("*")
      .eq("site_id", site.id)
      .order("date", { ascending: false })
      .limit(100);

    // Fetch Backlinks summary per page
    const { data: backlinks } = await supabase
      .from("backlinks")
      .select(`
        id,
        linking_url,
        domain_rating,
        article:articles(id, title, slug)
      `)
      .eq("status", "Live");

    // Process backlinks to group by article
    const backlinkStats = (backlinks || []).reduce((acc: any, b: any) => {
      if (b.article) {
        const articleId = b.article.id;
        if (!acc[articleId]) {
          acc[articleId] = {
            title: b.article.title,
            slug: b.article.slug,
            count: 0,
            totalDR: 0
          };
        }
        acc[articleId].count++;
        acc[articleId].totalDR += b.domain_rating || 0;
      }
      return acc;
    }, {});

    const processedBacklinks = Object.values(backlinkStats).map((s: any) => ({
      ...s,
      avgDR: s.count > 0 ? Math.round(s.totalDR / s.count) : 0
    }));

    return NextResponse.json({
      gsc: gscData || [],
      backlinks: processedBacklinks,
      siteUrl: site.site_url
    });
  } catch (error) {
    console.error("Error fetching performance data:", error);
    return NextResponse.json({ error: "Failed to load performance data" }, { status: 500 });
  }
}
