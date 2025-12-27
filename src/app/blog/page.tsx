import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPublishedArticles } from "@/lib/cms/supabase-articles";

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

        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {["All", "AI & SEO", "SEO Strategy", "Automation", "Keyword Research", "Content Strategy"].map((category) => (
            <button
              key={category}
              className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-all ${
                category === "All"
                  ? "border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]"
                  : "border-border bg-white text-muted-foreground hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {allPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="h-48 overflow-hidden bg-muted flex items-center justify-center">
                {post.image?.startsWith('bg-') ? (
                  <div className={`w-full h-full ${post.image} flex items-center justify-center text-white`}>
                    <div className="text-[14px] font-semibold opacity-90">{post.category}</div>
                  </div>
                ) : post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#22C55E] to-[#10B981] flex items-center justify-center text-white">
                    <div className="text-[14px] font-semibold opacity-90">{post.category}</div>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-4 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div>{post.readTime}</div>
                </div>
                <h3 className="mb-3 font-display text-[20px] font-semibold leading-snug text-foreground transition-colors group-hover:text-[#22C55E]">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-[15px] leading-relaxed text-muted-foreground line-clamp-3">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[#22C55E]">
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {allPosts.length > 9 && (
          <div className="mt-16 text-center">
            <button className="rounded-xl border border-border bg-white px-8 py-3 text-[15px] font-semibold text-foreground shadow-sm transition-all hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]">
              Load More Articles
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

