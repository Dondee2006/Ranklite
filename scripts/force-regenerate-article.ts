
import { supabaseAdmin } from "./src/lib/supabase/admin";
import { ArticleEngine } from "./src/lib/services/article-engine";
import { CMSEngine } from "./src/lib/services/cms-engine";

async function forceRegenerate() {
  const articleId = "4e9378b1-a1b3-4d13-9544-971263810da7";
  
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

  console.log(`Regenerating article: ${article.title}`);

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

  console.log("Fetching article settings...");
  const { data: artSettings } = await supabaseAdmin
    .from("article_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  console.log("Generating fresh article content with working API key...");
  try {
    const genResult = await ArticleEngine.generateCompleteArticle({
      site,
      settings: artSettings,
      article,
      existingArticles: []
    });

    console.log("Updating article in database with fresh content...");
    const { data: updatedArticle, error: updateError } = await supabaseAdmin
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
        status: "generated", // Temporarily set to generated
        updated_at: new Date().toISOString()
      })
      .eq("id", article.id)
      .select()
      .single();

    if (updateError) throw updateError;

    console.log("Attempting to re-publish to CMS...");
    // We try to publish to all connected platforms
    const publishResult = await CMSEngine.publishArticleToCMS(site.user_id, updatedArticle);

    if (publishResult.success) {
      const now = new Date().toISOString();
      const platform = publishResult.platform || "cms";
      
      await supabaseAdmin
        .from("articles")
        .update({
          status: "published",
          published_at: now,
          cms_exports: {
            ...updatedArticle.cms_exports,
            [platform]: {
              ...updatedArticle.cms_exports[platform],
              published_url: publishResult.publishedUrl,
              cms_post_id: publishResult.cmsPostId,
              published_at: now
            }
          }
        })
        .eq("id", updatedArticle.id);
      console.log("✅ Success! Article regenerated and re-published.");
    } else {
      console.log("⚠️ Content regenerated but CMS publish skipped or failed:", publishResult.error);
      // Still update to 'published' status because the content is now good
      await supabaseAdmin
        .from("articles")
        .update({ status: "published" })
        .eq("id", updatedArticle.id);
    }
  } catch (error) {
    console.error("❌ Error during regeneration:", error);
  }
}

forceRegenerate();
