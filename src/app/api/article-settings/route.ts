import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, url")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ settings: null });
  }

  const { data } = await supabase
    .from("article_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  return NextResponse.json({
    settings: data,
    siteUrl: site.url
  });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const { data: existing } = await supabase
    .from("article_settings")
    .select("id")
    .eq("site_id", site.id)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("article_settings")
      .update({
        sitemap_url: body.sitemapUrl,
        blog_address: body.blogAddress,
        example_urls: body.articleExamples || [],
        auto_publish: body.autoPublish,
        article_style: body.articleStyle,
        internal_links: body.internalLinks,
        global_instructions: body.globalInstructions,
        brand_color: body.brandColor,
        image_style: body.imageStyle,
        title_based_image: body.titleBasedImage,
        youtube_video: body.youtubeVideo,
        call_to_action: body.callToAction,
        include_infographics: body.includeInfographics,
        include_emojis: body.includeEmojis,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("article_settings").insert({
      site_id: site.id,
      sitemap_url: body.sitemapUrl,
      blog_address: body.blogAddress,
      example_urls: body.articleExamples || [],
      auto_publish: body.autoPublish,
      article_style: body.articleStyle,
      internal_links: body.internalLinks,
      global_instructions: body.globalInstructions,
      brand_color: body.brandColor,
      image_style: body.imageStyle,
      title_based_image: body.titleBasedImage,
      youtube_video: body.youtubeVideo,
      call_to_action: body.callToAction,
      include_infographics: body.includeInfographics,
      include_emojis: body.includeEmojis,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}