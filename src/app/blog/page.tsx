import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "SEO & Content Marketing Blog",
    description: "Expert insights, strategies, and guides on AI-powered SEO, content automation, and growing your organic traffic.",
};

const blogPosts = [
    {
        id: 1,
        title: "How to Build High-Authority Backlinks in 2026",
        excerpt: "Discover the latest strategies for building authority signals that AI agents and search engines trust.",
        category: "Backlinks",
        date: "Dec 28, 2025",
        readTime: "6 min read",
        slug: "how-to-build-backlinks",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop"
    },
    {
        id: 2,
        title: "Automating Your Content Strategy with AI",
        excerpt: "Learn how to use Ranklite to automate your content calendar and keep your site fresh on autopilot.",
        category: "Automation",
        date: "Dec 15, 2025",
        readTime: "4 min read",
        slug: "automating-content-strategy",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop"
    },
    {
        id: 3,
        title: "SEO for Small Business: A Growth Guide",
        excerpt: "Simple, effective SEO tactics that small businesses can use to compete with the big players.",
        category: "Guide",
        date: "Dec 05, 2025",
        readTime: "8 min read",
        slug: "seo-for-small-business",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2340&auto=format&fit=crop"
    }
];

export default function BlogPage() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto max-w-[1320px] px-5 py-20 md:px-8">
                <div className="mb-16 text-center">
                    <h1 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
                        Ranklite <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">Blog</span>
                    </h1>
                    <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
                        Expert insights on AI-powered SEO, content automation, and organic growth strategies.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {blogPosts.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="h-48 overflow-hidden relative">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute top-4 right-4 rounded-full bg-white/95 px-3 py-1 text-[12px] font-semibold text-foreground backdrop-blur-sm shadow-sm">
                                    {post.category}
                                </div>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <div className="mb-3 flex items-center gap-4 text-[13px] text-muted-foreground">
                                    <div>{post.date}</div>
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
            </main>
            <Footer />
        </div>
    );
}
