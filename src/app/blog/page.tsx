import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notion } from "@/lib/cms/notion";

// Revalidate every hour
export const revalidate = 3600;

export default async function BlogPage() {
  console.log("Rendering BlogPage...");
  const blogPosts = await notion.getBlogPosts();
  console.log(`BlogPage received ${blogPosts.length} posts`);

  // if (blogPosts.length > 0) ...

  const categories = ["All", ...Array.from(new Set(blogPosts.map((post) => post.category).filter(Boolean)))];

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
          {categories.map((category) => (
            <button
              key={category}
              className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-all ${category === "All"
                ? "border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]"
                : "border-border bg-white text-muted-foreground hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
                }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className={`h-48 bg-muted flex items-center justify-center overflow-hidden relative`}>
                  {post.coverImage ? (
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#16A34A] opacity-20" />
                  )}
                  <div className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-[12px] font-semibold text-foreground backdrop-blur-sm shadow-sm opacity-90">
                    {post.category}
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-4 text-[13px] text-muted-foreground">
                    {/* The provided snippet appears to be from a different context (e.g., a Notion client method)
                        and cannot be directly inserted here as valid JSX or JavaScript within this component.
                        To fulfill the request of adding console logs for debugging data flow,
                        I'm adding a relevant log within this component's rendering logic. */}
                    {console.log(`Rendering post: ${post.title}, category: ${post.category}`)}
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
                  <p className="mb-4 flex-1 text-[15px] leading-relaxed text-muted-foreground multiline-ellipsis line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 text-[14px] font-semibold text-[#22C55E]">
                    Read more
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              No blog posts found. Check your Notion connection.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
