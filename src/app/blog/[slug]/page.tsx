import { notFound } from "next/navigation";
import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import Link from "next/link";
import { ArrowLeft, Calendar, Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { getArticleBySlug } from "@/lib/cms/supabase-articles";

// Revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = await getArticleBySlug(params.slug);
    if (!post) {
        return {
            title: "Blog Post Not Found | Ranklite",
        };
    }

    return {
        title: post.seoTitle || `${post.title} | Ranklite Blog`,
        description: post.seoDescription || post.excerpt,
        openGraph: {
            title: post.seoTitle || post.title,
            description: post.seoDescription || post.excerpt,
            type: "article",
            images: post.coverImage ? [post.coverImage] : undefined,
        },
    };
}

// Helper to render HTML content safely
function HtmlRenderer({ html }: { html: string }) {
    if (!html) return null;

    return (
        <div 
            className="prose prose-lg prose-green max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
    const post = await getArticleBySlug(params.slug);

    if (!post) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto max-w-[900px] px-5 py-12 md:px-8 md:py-20">
                <div className="mb-8">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-[#22C55E]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>
                </div>

                <article>
                    <header className="mb-10 text-center">
                        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
                            <span className="rounded-full bg-[#F0FDF4] px-4 py-1.5 text-sm font-semibold text-[#16A34A]">
                                {post.category}
                            </span>
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {new Date(post.date).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </div>
                            <span className="text-sm font-medium text-muted-foreground">• {post.readTime}</span>
                        </div>

                        <h1 className="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                            {post.title}
                        </h1>

                        <p className="mx-auto max-w-2xl text-xl leading-relaxed text-muted-foreground">
                            {post.excerpt}
                        </p>
                    </header>

                    {post.coverImage && (
                        <div className="mb-12 overflow-hidden rounded-2xl shadow-lg">
                            <img
                                src={post.coverImage}
                                alt={post.title}
                                className="w-full object-cover max-h-[500px]"
                            />
                        </div>
                    )}

                    <div className="mx-auto max-w-3xl">
                        <HtmlRenderer html={post.content || ""} />
                    </div>

                    <div className="mt-16 border-t border-border pt-8">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                            <div className="text-center sm:text-left">
                                <p className="text-sm font-medium text-muted-foreground">Share this article</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-[#22C55E] hover:text-[#22C55E] hover:shadow-sm">
                                        <Twitter className="h-5 w-5" />
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-[#22C55E] hover:text-[#22C55E] hover:shadow-sm">
                                        <Linkedin className="h-5 w-5" />
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-[#22C55E] hover:text-[#22C55E] hover:shadow-sm">
                                        <Facebook className="h-5 w-5" />
                                    </button>
                                    <button className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-[#22C55E] hover:text-[#22C55E] hover:shadow-sm">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </main>
            <Footer />
        </div>
    );
}

