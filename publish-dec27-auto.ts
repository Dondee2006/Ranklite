
import { supabaseAdmin } from "./src/lib/supabase/admin";
import { ArticleEngine } from "./src/lib/services/article-engine";
import { CMSEngine } from "./src/lib/services/cms-engine";

async function autoPublish() {
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

  if (article.status === 'published') {
    console.log("Article already published.");
    return;
  }

  console.log(`Processing article: ${article.title}`);

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

  console.log("Generating article content...");
  try {
    const genResult = await ArticleEngine.generateCompleteArticle({
      site,
      settings: artSettings,
      article,
      existingArticles: []
    });

    console.log("Updating article in database with generated content...");
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
        status: "generated",
        updated_at: new Date().toISOString()
      })
      .eq("id", article.id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    console.log("Publishing to CMS...");
    const publishResult = await CMSEngine.publishArticleToCMS(site.user_id, updatedArticle);

    if (publishResult.success) {
      const now = new Date().toISOString();
      const cmsExports = updatedArticle.cms_exports || {};
      const platform = publishResult.platform || "notion"; // Default or from result
      
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
      console.error("Failed to publish to CMS:", publishResult.error);
      // Even if CMS publish fails, we generated the content, so we keep it as 'generated'
      // But the user wants it published. If no CMS is connected, it might fail.
    }
  } catch (error) {
    console.error("Error during auto-publish:", error);
  }
}

autoPublish();
