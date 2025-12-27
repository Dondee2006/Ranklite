import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { checkPostGenerationLimit, incrementPostUsage } from "@/lib/usage-limits";
import { createTasksForUser } from "@/lib/backlink-engine";
import { ArticleEngine } from "@/lib/services/article-engine";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limitCheck = await checkPostGenerationLimit(user.id);
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.message,
        usage: limitCheck.usage,
        limits: limitCheck.limits,
        percentUsed: limitCheck.percentUsed
      },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { articleId } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id, url, name, niche, target_audience, brand_voice, description")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: settings } = await supabase
    .from("article_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  const { data: article } = await supabase
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .eq("site_id", site.id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  const { data: existingArticles } = await supabase
    .from("articles")
    .select("id, title, slug, keyword")
    .eq("site_id", site.id)
    .neq("id", articleId)
    .not("content", "is", null);

  // Use the new ArticleEngine service
  const result = await ArticleEngine.generateCompleteArticle({
    site,
    settings,
    article,
    existingArticles: existingArticles || []
  });

  const { data: updatedArticle, error } = await supabase
    .from("articles")
    .update({
      content: result.content,
      html_content: result.htmlContent,
      markdown_content: result.markdownContent,
      meta_description: result.metaDescription,
      slug: result.slug,
      outline: result.outline,
      internal_links: result.internalLinks,
      external_links: result.externalLinks,
      images: result.images,
      featured_image: (result.images as any[])[0]?.url || null,
      cms_exports: result.cmsExports,
      word_count: result.wordCount,
      status: "generated",
      updated_at: new Date().toISOString(),
      volume: (article as any).volume || Math.floor(Math.random() * (5000 - 100 + 1) + 100),
      difficulty: (article as any).difficulty || Math.floor(Math.random() * (60 - 10 + 1) + 10),
    } as any)
    .eq("id", articleId)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await createTasksForUser(
    user.id,
    site.url ? new URL(site.url.startsWith('http') ? site.url : `https://${site.url}`).hostname : "",
    site.name,
    result.metaDescription || article.title,
    articleId
  );

  await incrementPostUsage(user.id);

  return NextResponse.json({
    article: updatedArticle,
    output: {
      title: article.title,
      meta_description: result.metaDescription,
      keyword_list: [article.keyword, ...(article.secondary_keywords || [])],
      outline: result.outline,
      full_article: result.content,
      image_set: result.images,
      internal_links: result.internalLinks,
      external_links: result.externalLinks,
      html_version: result.htmlContent,
      markdown_version: result.markdownContent,
      cms_export_package: result.cmsExports,
    },
  });
}
``