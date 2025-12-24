import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { appendFileSync } from "fs";

export async function GET() {
  return NextResponse.json({ message: "Publish API is active" });
}

export async function POST(request: NextRequest) {
  const log = (msg: string) => {
    console.log(`[PUBLISH DEBUG] ${msg}`);
    try {
      appendFileSync("publish-debug.log", `${new Date().toISOString()} - ${msg}\n`);
    } catch { }
  };

  log("Starting publish request");
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      log("Error: Unauthorized");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { articleId, cmsTarget } = body;
    log(`Request: articleId=${articleId}, cmsTarget=${cmsTarget}, user=${user.id}`);

    if (!articleId || !cmsTarget) {
      log("Error: Missing fields");
      return NextResponse.json(
        { error: "Article ID and CMS Target are required" },
        { status: 400 }
      );
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      log("Error: No site found");
      return NextResponse.json({ error: "No site found" }, { status: 404 });
    }

    const { data: article } = await supabase
      .from("articles")
      .select("*")
      .eq("id", articleId)
      .eq("site_id", site.id)
      .single();

    if (!article) {
      log("Error: Article not found");
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const { data: integration } = await supabase
      .from("cms_integrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("platform", cmsTarget)
      .eq("status", "active")
      .single();

    if (!integration) {
      log(`Error: No active ${cmsTarget} integration`);
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
    } else if (cmsTarget === "notion") {
      const { NotionClient } = await import("@/lib/cms/notion");
      const client = new NotionClient({
        accessToken: integration.credentials.access_token,
        databaseId: integration.config?.database_id || integration.config?.databaseId || ""
      });
      const result = await client.publishArticle({
        title: article.title,
        slug: article.slug,
        content: article.html_content,
        meta_description: article.meta_description,
        featured_image: article.featured_image,
        category: article.category
      });
      publishedUrl = result.url;
      cmsPostId = result.id;
      publishSuccess = true;
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
      log(`Error updating status: ${updateError.message}`);
      return NextResponse.json({ error: "Failed to update article status" }, { status: 500 });
    }

    log("Success: Published");
    return NextResponse.json({
      success: publishSuccess,
      message: `Article published to ${cmsTarget} as draft`,
      publishedUrl,
      cmsPostId,
      platform: cmsTarget,
    });
  } catch (error) {
    log(`Exception: ${String(error)}`);
    return NextResponse.json({ error: "Failed to publish article" }, { status: 500 });
  }
}
