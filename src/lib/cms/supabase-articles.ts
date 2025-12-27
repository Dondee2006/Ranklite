import { createClient } from "@/lib/supabase/server";

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
}

export async function getPublishedArticles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    console.error("Error fetching articles from Supabase:", error);
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error) {
    console.error("Error fetching article by slug from Supabase:", error);
    return null;
  }

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt || data.meta_description || "",
    content: data.html_content || data.content,
    date: data.published_at || data.created_at,
    category: data.article_type || "General",
    coverImage: data.featured_image_url || "",
    seoTitle: data.title,
    seoDescription: data.meta_description || data.excerpt || "",
    readTime: `${Math.ceil((data.word_count || 1000) / 200)} min read`,
  };
}
