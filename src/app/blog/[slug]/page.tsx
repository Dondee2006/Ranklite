import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Share2, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";

const blogPosts = [
    {
        slug: "how-to-build-backlinks",
        title: "How to Build High-Authority Backlinks in 2026",
        category: "Backlinks",
        date: "Dec 28, 2025",
        readTime: "6 min read",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
        content: `
            <p className="text-lg leading-relaxed mb-6">Building high-authority backlinks remains one of the most critical aspects of SEO in 2026. However, the game has changed. AI agents and search engines now look for "authority signals" that go beyond simple link juice.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Quality Over Quantity</h2>
            <p className="mb-6">The era of mass-producing low-quality guest posts is over. Today, a single link from a high-DR, relevant site is worth more than a thousand spammy forum links. Google's latest algorithms are designed to detect collaborative link-sharing networks that mimic natural authority growth.</p>
            
            <div className="bg-[#F0FDF4] border-l-4 border-[#22C55E] p-6 my-10 rounded-r-xl">
                <h4 className="font-bold text-[#16A34A] mb-2 font-display">Ranklite Tip</h4>
                <p className="text-[#15803D]">Our <strong>Autopilot Publishing</strong> system ensures that every article we generate for you is designed to be link-worthy. <a href="/#autopilot" className="underline font-semibold">Learn how we automate this process</a>.</p>
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-4">AI-Driven Relevance</h2>
            <p className="mb-6">Relevance is the new DR. If you're running a tech blog, a backlink from a high-authority cooking site does very little for you. You need contextual links from sites within your niche. This is where automation tools become invaluable, helping you identify and secure placements that actually move the needle.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Automating Your Strategy</h2>
            <p className="mb-6">Manually reaching out to hundreds of sites is a full-time job. To scale effectively, you need a system that handles the discovery, vetting, and placement of backlinks. Ranklite's community-driven exchange allows you to earn credits by hosting relevant content and spend them to get high-authority links back to your own articles.</p>
        `
    },
    {
        slug: "automating-content-strategy",
        title: "Automating Your Content Strategy with AI",
        category: "Automation",
        date: "Dec 15, 2025",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2532&auto=format&fit=crop",
        content: `
            <p className="text-lg leading-relaxed mb-6">Consistency is the secret sauce of SEO. But consistently creating high-quality, research-backed content is exhausting. In this guide, we'll explore how to automate your content strategy using AI without sacrificing quality.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">The 30-Day Content Plan</h2>
            <p className="mb-6">The first step to automation is planning. Instead of deciding what to write about every morning, you should have a roadmap of keywords and topics that align with your business goals. Our <a href="/#content-planner" className="text-[#22C55E] font-semibold hover:underline">Content Planner</a> can generate this 30-day roadmap in minutes.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">From Idea to Publication</h2>
            <p className="mb-6">Once you have your plan, the next hurdle is execution. Modern AI tools can now draft articles that sound human, follow your brand voice, and include all the necessary SEO metadata. When integrated directly with your CMS, the process becomes truly "set and forget".</p>

            <div className="rounded-3xl bg-gray-900 p-8 my-12 text-white overflow-hidden relative">
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-4 font-display">Ready to rank on autopilot?</h3>
                    <p className="text-gray-300 mb-6">Join 2,400+ businesses using Ranklite to automate their SEO growth.</p>
                    <a href="https://whop.com/checkout/plan_hwMsQBSgnZtPO" className="inline-flex items-center gap-2 bg-[#22C55E] px-6 py-3 rounded-full font-semibold hover:bg-[#16A34A] transition-all">
                        Get Started for Free
                        <ArrowRight className="h-4 w-4" />
                    </a>
                </div>
                <div className="absolute -right-20 -bottom-20 h-64 w-64 bg-[#22C55E] opacity-10 rounded-full blur-3xl"></div>
            </div>
        `
    },
    {
        slug: "seo-for-small-business",
        title: "SEO for Small Business: A Growth Guide",
        category: "Guide",
        date: "Dec 05, 2025",
        readTime: "8 min read",
        image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?q=80&w=2340&auto=format&fit=crop",
        content: `
            <p className="text-lg leading-relaxed mb-6">Small businesses often feel like they're fighting a losing battle against giant corporations with infinite SEO budgets. But small sites have one major advantage: agility. You can target long-tail keywords and niche topics faster than any corporate behemoth.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Focus on Long-Tail Keywords</h2>
            <p className="mb-6">Don't try to rank for "shoes". Instead, target "best ergonomic walking shoes for nurses in Chicago". These long-tail keywords have lower competition and higher intent, meaning the traffic you get is much more likely to convert into customers.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">The Importance of Freshness</h2>
            <p className="mb-6">Search engines love fresh content. By publishing regularly, you signal to Google that your site is active and authoritative in your niche. If you don't have time to write every day, using an <a href="/#autopilot" className="text-[#22C55E] font-semibold hover:underline">automated publishing system</a> can keep your site fresh without you lifting a finger.</p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Build Local Authority</h2>
            <p className="mb-6">If your business serves a specific area, local SEO is your best friend. Optimize your Google Business Profile and ensure your contact information is consistent across all directories. This, combined with niche-relevant backlinks, will help you dominate local search results.</p>
        `
    }
];

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                {/* Hero Section */}
                <div className="relative h-[400px] w-full overflow-hidden lg:h-[600px]">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="container mx-auto max-w-[900px] px-5 text-center">
                            <Link
                                href="/blog"
                                className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/80 hover:text-white transition-colors"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Blog
                            </Link>
                            <div className="mb-4 inline-flex rounded-full bg-[#22C55E] px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
                                {post.category}
                            </div>
                            <h1 className="font-display text-[36px] font-bold leading-[1.1] text-white sm:text-[48px] lg:text-[64px]">
                                {post.title}
                            </h1>
                            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-white/80">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-[#22C55E]" />
                                    {post.date}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#22C55E]" />
                                    {post.readTime}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="container mx-auto max-w-[800px] px-5 py-16 lg:py-24">
                    <div
                        className="prose prose-lg max-w-none prose-headings:font-display prose-headings:font-bold prose-a:text-[#22C55E] prose-a:no-underline hover:prose-a:underline"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    <div className="mt-16 border-t border-border pt-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 overflow-hidden rounded-full bg-muted">
                                    <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face" alt="Author" />
                                </div>
                                <div>
                                    <div className="font-semibold">Ranklite Team</div>
                                    <div className="text-sm text-muted-foreground">AI SEO Specialists</div>
                                </div>
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border hover:bg-muted transition-colors">
                                <Share2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
