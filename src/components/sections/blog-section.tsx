import { Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { notion } from "@/lib/cms/notion";

export default async function BlogSection() {
    const allPosts = await notion.getBlogPosts();
    // Get the latest 3 published posts
    const latestPosts = allPosts.slice(0, 3);

    if (latestPosts.length === 0) {
        return null; // Don't render section if no posts
    }

    return (
        <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50" id="blog">
            <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
                {/* Header */}
                <div className="mb-12 text-center">
                    <span className="text-xs font-semibold text-[#22C55E] uppercase tracking-[1.44px] mb-4 block">
                        LATEST FROM OUR BLOG
                    </span>
                    <h2 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[56px]">
                        Learn from{" "}
                        <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                            SEO Experts
                        </span>
                    </h2>
                    <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
                        Discover actionable insights, growth strategies, and the latest in AI-powered SEO.
                    </p>
                </div>

                {/* Blog Posts Grid */}
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
                    {latestPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="h-48 bg-muted flex items-center justify-center overflow-hidden relative">
                                {post.coverImage ? (
                                    <img
                                        src={post.coverImage}
                                        alt={post.title}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E] to-[#16A34A] opacity-20" />
                                )}
                                <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground backdrop-blur-sm shadow-sm">
                                    {post.category}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-3 flex items-center gap-4 text-[13px] text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {new Date(post.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div>{post.readTime}</div>
                                </div>
                                <h3 className="mb-3 font-display text-[20px] font-semibold leading-snug text-foreground transition-colors group-hover:text-[#22C55E] line-clamp-2">
                                    {post.title}
                                </h3>
                                <p className="mb-4 flex-1 text-[15px] leading-relaxed text-muted-foreground line-clamp-3">
                                    {post.excerpt}
                                </p>
                                <div className="flex items-center gap-2 text-[14px] font-semibold text-[#22C55E]">
                                    Read more
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* View All Posts CTA */}
                <div className="flex justify-center">
                    <Link
                        href="/blog"
                        className="inline-flex items-center justify-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-base px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                        View All Posts
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
}
