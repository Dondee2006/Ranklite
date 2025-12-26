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
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ settings: null });
  }

  const [
    { data: articleSettings },
    { data: audiences },
    { data: competitors }
  ] = await Promise.all([
    supabase.from("article_settings").select("*").eq("site_id", site.id).single(),
    supabase.from("target_audiences").select("*").eq("site_id", site.id),
    supabase.from("competitors").select("*").eq("site_id", site.id)
  ]);

  return NextResponse.json({ 
    site,
    articleSettings,
    audiences,
    competitors
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

  // Update site info
  if (body.site) {
    await supabase
      .from("sites")
      .update({
        name: body.site.name,
        url: body.site.url,
        website_url: body.site.url,
        language: body.site.language,
        country: body.site.country,
        description: body.site.description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", site.id);
  }

  // Update audiences
  if (body.audiences && Array.isArray(body.audiences)) {
    // Delete existing and insert new for simplicity
    await supabase.from("target_audiences").delete().eq("site_id", site.id);
    if (body.audiences.length > 0) {
      await supabase.from("target_audiences").insert(
        body.audiences.map((a: any) => ({
          site_id: site.id,
          name: typeof a === "string" ? a : a.name,
          description: typeof a === "string" ? a : a.description,
        }))
      );
    }
  }

  // Update competitors
  if (body.competitors && Array.isArray(body.competitors)) {
    await supabase.from("competitors").delete().eq("site_id", site.id);
    if (body.competitors.length > 0) {
      await supabase.from("competitors").insert(
        body.competitors.map((c: any) => ({
          site_id: site.id,
          url: typeof c === "string" ? c : c.url,
        }))
      );
    }
  }

  // Update article settings
  if (body.articleSettings) {
    const { data: existing } = await supabase
      .from("article_settings")
      .select("id")
      .eq("site_id", site.id)
      .single();

    const settingsData = {
      site_id: site.id,
      article_style: body.articleSettings.article_style,
      internal_links: body.articleSettings.internal_links,
      global_instructions: body.articleSettings.global_instructions,
      brand_color: body.articleSettings.brand_color,
      image_style: body.articleSettings.image_style,
      title_based_image: body.articleSettings.title_based_image,
      youtube_video: body.articleSettings.youtube_video,
      call_to_action: body.articleSettings.call_to_action,
      include_infographics: body.articleSettings.include_infographics,
      include_emojis: body.articleSettings.include_emojis,
      auto_publish: body.articleSettings.auto_publish,
      sitemap_url: body.articleSettings.sitemap_url,
      blog_address: body.articleSettings.blog_address,
      example_urls: body.articleSettings.example_urls,
      updated_at: new Date().toISOString(),
    };

    if (existing) {
      await supabase
        .from("article_settings")
        .update(settingsData)
        .eq("id", existing.id);
    } else {
      await supabase.from("article_settings").insert(settingsData);
    }
  }

  return NextResponse.json({ success: true });
}
