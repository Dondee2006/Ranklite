import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { getPublishedArticles } from "@/lib/cms/supabase-articles";
import BlogClient from "./blog-client";

export default async function BlogPage() {
  const articles = await getPublishedArticles();

  // Combine with hardcoded posts if needed, or just use generated ones
  const allPosts = articles.length > 0 ? articles : [
    {
      id: "ai-content-seo-2025",
      slug: "ai-content-seo-2025",
      title: "The Future of AI-Generated Content in SEO",
      excerpt: "Discover how AI is transforming content creation and what it means for your SEO strategy in 2025.",
      date: "December 10, 2025",
      category: "AI & SEO",
      readTime: "5 min read",
      image: "bg-gradient-to-br from-[#22C55E] to-[#16A34A]",
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            Ranklite{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Blog
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            Learn about SEO, AI content creation, and growth strategies from our experts.
          </p>
        </div>

        <BlogClient articles={allPosts} />
      </main>
      <Footer />
    </div>
  );
}

