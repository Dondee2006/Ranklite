
import { supabaseAdmin } from "./src/lib/supabase/admin";
import { ArticleEngine } from "./src/lib/services/article-engine";
import { CMSEngine } from "./src/lib/services/cms-engine";

async function forcePublish() {
  const articleId = "a17738bf-ee73-43c0-873c-702275d2249c";
  
  console.log("Fetching article...");
  const { data: article } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("id", articleId)
    .single();

  if (!article) {
    console.error("Article not found");
    return;
  }

  console.log("Fetching site...");
  const { data: site } = await supabaseAdmin
    .from("sites")
    .select("*")
    .eq("id", article.site_id)
    .single();

  if (!site) {
    console.error("Site not found");
    return;
  }

  console.log("Generating article content...");
  const { data: artSettings } = await supabaseAdmin
    .from("article_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  const genResult = await ArticleEngine.generateCompleteArticle({
    site,
    settings: artSettings,
    article,
    existingArticles: []
  });

  console.log("Updating article in database...");
  const { data: updatedArticle } = await supabaseAdmin
    .from("articles")
    .update({
      content: genResult.content,
      html_content: genResult.htmlContent,
      markdown_content: genResult.markdownContent,
      meta_description: genResult.metaDescription,
      slug: genResult.slug,
      outline: genResult.outline,
      internal_links: genResult.internalLinks,
      external_links: genResult.externalLinks,
      images: genResult.images,
      featured_image: (genResult.images as any[])[0]?.url || null,
      cms_exports: genResult.cmsExports,
      word_count: genResult.wordCount,
      status: "generated",
      updated_at: new Date().toISOString()
    })
    .eq("id", article.id)
    .select()
    .single();

  console.log("Publishing to CMS...");
  const publishResult = await CMSEngine.publishArticleToCMS(site.user_id, updatedArticle);

  if (publishResult.success) {
    const now = new Date().toISOString();
    const cmsExports = updatedArticle.cms_exports || {};
    const platform = "notion";
    
    await supabaseAdmin
      .from("articles")
      .update({
        status: "published",
        published_at: now,
        updated_at: now,
        cms_exports: {
          ...cmsExports,
          [platform]: {
            ...cmsExports[platform],
            published_url: publishResult.publishedUrl,
            cms_post_id: publishResult.cmsPostId,
            published_at: now
          }
        }
      })
      .eq("id", updatedArticle.id);
    console.log("Success! Article published.");
  } else {
    console.error("Failed to publish:", publishResult.error);
  }
}

forcePublish();
