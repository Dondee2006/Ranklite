import { supabaseAdmin } from "@/lib/supabase/admin";
import { createCMSClient, WordPressClient } from "@/lib/cms";

export interface SupabaseArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  published_at: string;
  status: string;
  article_type: string;
  featured_image_url?: string;
  meta_description?: string;
  html_content?: string;
  word_count?: number;
  cms_post_id?: string;
  cms_target?: string;
  integration_id?: string;
}

async function syncFromCMS(article: any): Promise<any> {
  if (!article.cms_post_id || !article.integration_id) {
    return article;
  }

  try {
    const { data: integration } = await supabaseAdmin
      .from("cms_integrations")
      .select("*")
      .eq("id", article.integration_id)
      .single();

    if (!integration) return article;

    const cmsIntegration = {
      id: integration.id,
      cms_type: integration.platform as any,
      access_token: integration.credentials?.access_token,
      site_url: integration.site_url,
      settings: integration.config || {},
    };

    const client = createCMSClient(cmsIntegration);

    if (integration.platform === 'wordpress') {
      const wpPost = await (client as WordPressClient).getPost(article.cms_post_id);
      if (wpPost) {
        const updatedContent = {
          title: wpPost.title.rendered,
          html_content: wpPost.content.rendered,
          excerpt: wpPost.excerpt.rendered.replace(/<[^>]*>?/gm, ''), // Strip tags for excerpt
        };

        // Background update cache in DB to keep list view fresh
        supabaseAdmin
          .from("articles")
          .update(updatedContent)
          .eq("id", article.id)
          .then(({ error }) => {
            if (error) console.warn(`[CMS-Sync] Cache update failed for ${article.id}:`, error);
          });

        return {
          ...article,
          ...updatedContent,
        };
      }
    } else if (integration.platform === 'notion') {
      const notionPost = await (client as any).getPageWithContent(article.cms_post_id);
      if (notionPost) {
        const updatedContent = {
          title: notionPost.title,
          html_content: notionPost.content,
          excerpt: notionPost.excerpt,
          featured_image_url: notionPost.coverImage,
        };

        // Background update cache in DB
        supabaseAdmin
          .from("articles")
          .update(updatedContent)
          .eq("id", article.id)
          .then(({ error }) => {
            if (error) console.warn(`[CMS-Sync] Cache update failed for ${article.id}:`, error);
          });

        return {
          ...article,
          ...updatedContent,
          rawCMSData: notionPost,
        };
      }
    }
  } catch (err) {
    console.error(`[CMS-Sync] Failed to fetch fresh content for article ${article.id}:`, err);
  }
  return article;
}

export async function getPublishedArticles() {
  // Heuristic: Find all published articles and identify which site has the most recent one.
  // This is the most reliable way to find the "active" site on the public blog.
  const { data: allPublished, error } = await supabaseAdmin
    .from("articles")
    .select("site_id, published_at, created_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error || !allPublished?.length) {
    return [];
  }

  // Pick the site_id of the most recently published article
  const mainSiteId = allPublished[0].site_id;

  if (!mainSiteId) return [];

  const { data, error: fetchError } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("status", "published")
    .eq("site_id", mainSiteId)
    .order("published_at", { ascending: false });

  if (fetchError) {
    console.error("Error fetching articles from Supabase:", fetchError);
    return [];
  }

  return data.map((article: any) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    excerpt: article.excerpt || article.meta_description || "",
    date: article.published_at || article.created_at,
    category: article.article_type || "General",
    image: article.featured_image_url || "",
    readTime: `${Math.ceil((article.word_count || 1000) / 200)} min read`,
  }));
}

export async function getArticleBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching article by slug from Supabase:", error);
    return null;
  }

  // SYNC: Fetch fresh content from CMS if integrated
  const syncedData = await syncFromCMS(data);

  return {
    id: syncedData.id,
    slug: syncedData.slug,
    title: syncedData.title,
    excerpt: syncedData.excerpt || syncedData.meta_description || "",
    content: syncedData.html_content || syncedData.content,
    date: syncedData.published_at || syncedData.created_at,
    category: syncedData.article_type || "General",
    coverImage: syncedData.featured_image_url || "",
    seoTitle: syncedData.title,
    seoDescription: syncedData.meta_description || syncedData.excerpt || "",
    readTime: `${Math.ceil((syncedData.word_count || 1000) / 200)} min read`,
  };
}
