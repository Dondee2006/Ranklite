import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      websiteUrl,
      cmsType,
      postsPerMonth,
      backlinksPerPost,
      minDR,
      dailyLimit,
      integrations,
    } = body;

    if (!websiteUrl || !cmsType) {
      return NextResponse.json(
        { error: "Website URL and CMS type are required" },
        { status: 400 }
      );
    }

    const siteName = new URL(websiteUrl).hostname.replace("www.", "");
    
    const { data: site, error: siteError } = await supabase
      .from("sites")
      .insert({
        user_id: user.id,
        name: siteName,
        url: websiteUrl,
        language: "English",
        country: "United States",
      })
      .select()
      .single();

    if (siteError) {
      console.error("Site creation error:", siteError);
      return NextResponse.json(
        { error: "Failed to create site" },
        { status: 500 }
      );
    }

    const { data: cycle, error: cycleError } = await supabase
      .from("seo_cycles")
      .insert({
        user_id: user.id,
        site_id: site.id,
        name: "First SEO Cycle",
        status: "active",
        posts_per_month: postsPerMonth || 10,
        backlinks_per_post: backlinksPerPost || 20,
        max_backlinks_per_month: (postsPerMonth || 10) * (backlinksPerPost || 20),
        min_dr_for_backlinks: minDR || 30,
        daily_automation_limit: dailyLimit || 10,
        qa_validation_enabled: true,
        auto_publish: false,
        next_run_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
      })
      .select()
      .single();

    if (cycleError) {
      console.error("Cycle creation error:", cycleError);
      return NextResponse.json(
        { error: "Failed to create SEO cycle" },
        { status: 500 }
      );
    }

    if (cmsType) {
      await supabase.from("cms_connections").insert({
        user_id: user.id,
        site_id: site.id,
        cms_type: cmsType,
        connection_status: "pending",
      });
    }

    const plannedPosts = Array.from({ length: 5 }).map((_, i) => ({
      cycle_id: cycle.id,
      post_title: `Post ${i + 1} - AI Generated`,
      target_keyword: "Auto-detected",
      status: "planned",
      backlinks_count: 0,
      backlinks_target: backlinksPerPost || 20,
    }));

    await supabase.from("cycle_content").insert(plannedPosts);

    return NextResponse.json({
      success: true,
      cycle: {
        id: cycle.id,
        site_id: site.id,
        posts_per_month: cycle.posts_per_month,
        backlinks_per_post: cycle.backlinks_per_post,
      },
    });
  } catch (error) {
    console.error("Onboarding error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
