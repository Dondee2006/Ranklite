"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    category: string;
    readTime: string;
    image?: string;
}

interface BlogClientProps {
    articles: BlogPost[];
}

export default function BlogClient({ articles }: BlogClientProps) {
    const [activeCategory, setActiveCategory] = useState("All");
    const [visibleCount, setVisibleCount] = useState(9);

    // Extract unique categories from articles
    const categories = useMemo(() => {
        const cats = new Set(articles.map((a) => a.category));
        return ["All", ...Array.from(cats)].sort();
    }, [articles]);

    const filteredArticles = useMemo(() => {
        if (activeCategory === "All") return articles;
        return articles.filter((a) => a.category === activeCategory);
    }, [articles, activeCategory]);

    const displayedArticles = filteredArticles.slice(0, visibleCount);

    return (
        <>
            {/* Category Toggles */}
            <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
                {categories.map((category) => (
                    <button
                        key={category}
                        onClick={() => {
                            setActiveCategory(category);
                            setVisibleCount(9); // Reset pagination on filter change
                        }}
                        className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-all ${activeCategory === category
                                ? "border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]"
                                : "border-border bg-white text-muted-foreground hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
                            }`}
                    >
                        {category}
                    </button>
                ))}
            </div>

            {/* Grid */}
            {displayedArticles.length > 0 ? (
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {displayedArticles.map((post) => (
                        <Link
                            key={post.id}
                            href={`/blog/${post.slug}`}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
                        >
                            <div className="h-48 overflow-hidden bg-muted flex items-center justify-center">
                                {post.image?.startsWith("bg-") ? (
                                    <div className={`w-full h-full ${post.image} flex items-center justify-center text-white`}>
                                        <div className="text-[14px] font-semibold opacity-90">{post.category}</div>
                                    </div>
                                ) : post.image ? (
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
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
            ) : (
                <div className="py-20 text-center text-muted-foreground">
                    No articles found in this category.
                </div>
            )}

            {/* Load More */}
            {visibleCount < filteredArticles.length && (
                <div className="mt-16 text-center">
                    <button
                        onClick={() => setVisibleCount((prev) => prev + 9)}
                        className="rounded-xl border border-border bg-white px-8 py-3 text-[15px] font-semibold text-foreground shadow-sm transition-all hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
                    >
                        Load More Articles
                    </button>
                </div>
            )}
        </>
    );
}
