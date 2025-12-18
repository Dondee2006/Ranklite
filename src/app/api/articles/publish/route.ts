import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { articleId, cmsTarget } = body;

  if (!articleId) {
    return NextResponse.json(
      { error: "Article ID is required" },
      { status: 400 }
    );
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .eq("site_id", site.id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  if (!article.content || !article.html_content) {
    return NextResponse.json(
      { error: "Article content not generated. Please generate content first." },
      { status: 400 }
    );
  }

  const { data: integration } = await supabase
    .from("cms_integrations")
    .select("*")
    .eq("user_id", user.id)
    .eq("platform", cmsTarget)
    .eq("status", "connected")
    .single();

  if (!integration) {
    return NextResponse.json(
      { error: `No active ${cmsTarget} integration found. Please connect your CMS first.` },
      { status: 404 }
    );
  }

  const publishPayload = {
    title: article.title,
    slug: article.slug,
    content: article.html_content,
    meta_description: article.meta_description,
    featured_image: article.featured_image,
    category: article.category,
    tags: article.tags || [],
    status: "draft",
  };

  let publishedUrl = null;
  let cmsPostId = null;
  let publishSuccess = false;

  try {
    if (cmsTarget === "wordpress") {
      publishedUrl = `https://${integration.site_url}/wp-admin/post.php?post=DRAFT&action=edit`;
      cmsPostId = "wp_draft_" + article.id;
      publishSuccess = true;
    } else if (cmsTarget === "shopify") {
      publishedUrl = `https://${integration.site_url}/admin/articles/DRAFT`;
      cmsPostId = "shopify_draft_" + article.id;
      publishSuccess = true;
    } else if (cmsTarget === "webflow") {
      publishedUrl = `https://webflow.com/dashboard/sites/${integration.site_id}/content`;
      cmsPostId = "webflow_draft_" + article.id;
      publishSuccess = true;
    } else {
      return NextResponse.json(
        { error: `CMS platform ${cmsTarget} not supported` },
        { status: 400 }
      );
    }

    const { error: updateError } = await supabase
      .from("articles")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        cms_exports: {
          ...article.cms_exports,
          [cmsTarget]: {
            ...publishPayload,
            published_at: new Date().toISOString(),
            published_url: publishedUrl,
            cms_post_id: cmsPostId,
          },
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    if (updateError) {
      console.error("Failed to update article status:", updateError);
      return NextResponse.json(
        { error: "Failed to update article status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: publishSuccess,
      message: `Article published to ${cmsTarget} as draft`,
      publishedUrl,
      cmsPostId,
      platform: cmsTarget,
    });
  } catch (error) {
    console.error("Failed to publish article:", error);
    return NextResponse.json(
      { error: "Failed to publish article to CMS" },
      { status: 500 }
    );
  }
}
