"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ChevronLeft, Calendar, Tag, Target, FileText, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Article {
    id: string;
    title: string;
    slug: string;
    content: string;
    html_content: string;
    meta_description: string;
    keyword: string;
    article_type: string;
    search_intent: string;
    status: string;
    scheduled_date: string;
    word_count: number;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadArticle() {
            try {
                const response = await fetch(`/api/articles/${id}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "Failed to fetch article");
                }
                const data = await response.json();
                setArticle(data.article);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadArticle();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#FAFAFA] px-4 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Article Not Found</h2>
                <p className="text-gray-500 mb-6">{error || "The article you're looking for doesn't exist or you don't have access."}</p>
                <div className="bg-gray-100 p-3 rounded text-xs font-mono mb-6">
                    ID: {id}
                </div>
                <Link href="/dashboard/content">
                    <Button variant="outline">Back to Content</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FAFAFA] pb-20">
            <header className="border-b border-[#E5E5E5] bg-white sticky top-0 z-10 transition-all duration-200">
                <div className="px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard/content"
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-900"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                    article.status === 'published' ? "bg-emerald-100 text-emerald-700" :
                                        article.status === 'generated' ? "bg-blue-100 text-blue-700" :
                                            "bg-gray-100 text-gray-600"
                                )}>
                                    {article.status}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {article.word_count || 0} words
                                </span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900 truncate max-w-[500px]">
                                {article.title}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {article.slug && (
                            <Button variant="outline" size="sm" className="gap-2" asChild>
                                <a href={`/${article.slug}`} target="_blank" rel="noopener noreferrer">
                                    <Globe className="h-4 w-4" />
                                    Preview
                                </a>
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-8">
                    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden">
                        <div className="px-10 py-12 prose prose-slate prose-emerald border-b border-gray-100 max-w-none">
                            <div
                                dangerouslySetInnerHTML={{ __html: article.html_content || article.content || "<p class='text-gray-400 italic'>Content is being generated by the AI SEO Agent...</p>" }}
                                className="article-body"
                            />
                        </div>

                        {article.meta_description && (
                            <div className="bg-gray-50/50 px-10 py-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Target className="h-3 w-3" />
                                    Meta Description
                                </h3>
                                <p className="text-sm text-gray-600 italic">
                                    {article.meta_description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Metadata */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm p-6">
                        <h3 className="text-sm font-bold text-gray-900 mb-6">Article Details</h3>

                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-emerald-50 rounded-lg">
                                    <Tag className="h-4 w-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Primary Keyword</p>
                                    <p className="text-sm font-semibold text-gray-900">{article.keyword || "Not set"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-blue-50 rounded-lg">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Article Type</p>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{article.article_type || "Standard"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-purple-50 rounded-lg">
                                    <Target className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Search Intent</p>
                                    <p className="text-sm font-semibold text-gray-900 capitalize">{article.search_intent || "Informational"}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 p-2 bg-amber-50 rounded-lg">
                                    <Calendar className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-0.5">Scheduled Date</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {article.scheduled_date ? new Date(article.scheduled_date).toLocaleDateString() : "Draft"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#111827] rounded-xl border border-[#374151] shadow-lg p-6 text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -top-4 bg-emerald-500/10 w-24 h-24 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-300"></div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                            <Loader2 className="h-4 w-4 text-emerald-400" />
                            Next Step: Publish
                        </h4>
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                            Once you've reviewed the article, you can publish it to your connected CMS using the Publish button.
                        </p>
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-none shadow-md shadow-emerald-900/20">
                            Publish to Site
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
        .article-body h1 { font-size: 2.25rem; font-weight: 800; color: #111827; margin-top: 2rem; margin-bottom: 1.5rem; line-height: 1.2; }
        .article-body h2 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.3; }
        .article-body h3 { font-size: 1.25rem; font-weight: 600; color: #111827; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .article-body p { font-size: 1.0625rem; line-height: 1.8; color: #4B5563; margin-bottom: 1.5rem; }
        .article-body ul, .article-body ol { margin-bottom: 1.5rem; padding-left: 1.5rem; }
        .article-body li { margin-bottom: 0.5rem; color: #4B5563; }
        .article-body strong { color: #111827; font-weight: 600; }
        .article-body blockquote { border-left: 4px solid #10B981; padding-left: 1.5rem; italic; margin: 2rem 0; color: #374151; }
      `}</style>
        </div>
    );
}
