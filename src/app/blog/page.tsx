import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

const blogPosts = [
  {
    id: "ai-content-seo-2025",
    title: "The Future of AI-Generated Content in SEO",
    excerpt: "Discover how AI is transforming content creation and what it means for your SEO strategy in 2025.",
    date: "December 10, 2025",
    category: "AI & SEO",
    readTime: "5 min read",
    image: "bg-gradient-to-br from-[#22C55E] to-[#16A34A]",
  },
  {
    id: "rank-first-page-google",
    title: "How to Rank on the First Page of Google in 2025",
    excerpt: "A comprehensive guide to ranking your content on Google's first page with proven strategies.",
    date: "December 8, 2025",
    category: "SEO Strategy",
    readTime: "8 min read",
    image: "bg-gradient-to-br from-[#3B82F6] to-[#2563EB]",
  },
  {
    id: "content-automation-guide",
    title: "Complete Guide to Content Automation",
    excerpt: "Learn how to automate your content creation workflow without sacrificing quality.",
    date: "December 5, 2025",
    category: "Automation",
    readTime: "6 min read",
    image: "bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]",
  },
  {
    id: "keyword-research-2025",
    title: "Modern Keyword Research: Beyond Search Volume",
    excerpt: "Discover advanced keyword research techniques that go beyond traditional metrics.",
    date: "December 3, 2025",
    category: "Keyword Research",
    readTime: "7 min read",
    image: "bg-gradient-to-br from-[#F59E0B] to-[#D97706]",
  },
  {
    id: "internal-linking-strategy",
    title: "Internal Linking Strategy That Actually Works",
    excerpt: "Master the art of internal linking to boost your SEO performance and user engagement.",
    date: "November 30, 2025",
    category: "SEO Strategy",
    readTime: "6 min read",
    image: "bg-gradient-to-br from-[#EC4899] to-[#DB2777]",
  },
  {
    id: "content-calendar-planning",
    title: "How to Build a Content Calendar That Converts",
    excerpt: "Plan your content strategy effectively with our proven content calendar framework.",
    date: "November 28, 2025",
    category: "Content Strategy",
    readTime: "5 min read",
    image: "bg-gradient-to-br from-[#06B6D4] to-[#0891B2]",
  },
];

export default function BlogPage() {
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
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`h-48 ${post.image} flex items-center justify-center`}>
                <div className="text-center text-white">
                  <div className="text-[14px] font-semibold opacity-90">{post.category}</div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="mb-3 flex items-center gap-4 text-[13px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {post.date}
                  </div>
                  <div>{post.readTime}</div>
                </div>
                <h3 className="mb-3 font-display text-[20px] font-semibold leading-snug text-foreground transition-colors group-hover:text-[#22C55E]">
                  {post.title}
                </h3>
                <p className="mb-4 flex-1 text-[15px] leading-relaxed text-muted-foreground">{post.excerpt}</p>
                <div className="flex items-center gap-2 text-[14px] font-semibold text-[#22C55E]">
                  Read more
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <button className="rounded-xl border border-border bg-white px-8 py-3 text-[15px] font-semibold text-foreground shadow-sm transition-all hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]">
            Load More Articles
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
