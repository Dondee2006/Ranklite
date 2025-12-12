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
        style: body.style,
        length: body.length,
        ai_images: body.ai_images,
        image_style: body.image_style,
        internal_links: body.internal_links,
        cta_enabled: body.cta_enabled,
        cta_text: body.cta_text,
        cta_url: body.cta_url,
        custom_instructions: body.custom_instructions,
        sitemap_url: body.sitemap_url,
        blog_address: body.blog_address,
        example_urls: body.example_urls,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    const { error } = await supabase.from("article_settings").insert({
      site_id: site.id,
      style: body.style,
      length: body.length,
      ai_images: body.ai_images,
      image_style: body.image_style,
      internal_links: body.internal_links,
      cta_enabled: body.cta_enabled,
      cta_text: body.cta_text,
      cta_url: body.cta_url,
      custom_instructions: body.custom_instructions,
      sitemap_url: body.sitemap_url,
      blog_address: body.blog_address,
      example_urls: body.example_urls,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}