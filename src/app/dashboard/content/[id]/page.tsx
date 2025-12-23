"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Loader2,
    ChevronLeft,
    Calendar,
    Tag,
    Target,
    FileText,
    ExternalLink,
    Globe,
    Pencil,
    Save,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

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
    featured_image?: string;
    featured_image_url?: string;
}

export default function ArticleDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editable states
    const [isSaving, setIsSaving] = useState(false);
    const [editableSlug, setEditableSlug] = useState("");
    const [editableMetaDesc, setEditableMetaDesc] = useState("");
    const [editableStatus, setEditableStatus] = useState("");

    // UI states
    const [isEditingContent, setIsEditingContent] = useState(false);

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

                // Initialize editable states
                setEditableSlug(data.article.slug || "");
                setEditableMetaDesc(data.article.meta_description || "");
                setEditableStatus(data.article.status || "planned");
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadArticle();
    }, [id]);

    const handleSaveMetadata = async (field: 'slug' | 'meta_description' | 'status', value: string) => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ [field]: value }),
            });

            if (!response.ok) throw new Error("Failed to update article");

            const data = await response.json();
            setArticle(data.article);
            toast.success(`${field.replace('_', ' ')} updated successfully`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
                    <p className="text-sm font-medium text-gray-500 animate-pulse">Loading your premium content...</p>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-[#FAFAFA] px-4 text-center">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Article Not Found</h2>
                <p className="text-gray-500 mb-8 max-w-md">{error || "The article you're looking for doesn't exist or you don't have access."}</p>
                <Link href="/dashboard/content">
                    <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">Go back to Content History</Button>
                </Link>
            </div>
        );
    }

    const metaCharCount = editableMetaDesc.length;
    const metaLimit = 160;
    const isMetaOk = metaCharCount > 0 && metaCharCount <= metaLimit;

    return (
        <div className="min-h-screen bg-[#FAFAFA] antialiased">
            {/* Top Navigation / Breadcrumbs */}
            <div className="bg-white border-b border-gray-200 px-8 py-3 sticky top-0 z-50">
                <div className="max-w-[1600px] mx-auto flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/content" className="text-gray-500 hover:text-emerald-600 transition-colors">
                                    Content History
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="font-semibold text-gray-900 truncate max-w-[300px]">
                                    {article.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-2 transition-all"
                            onClick={() => setIsEditingContent(!isEditingContent)}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            {isEditingContent ? "Preview Mode" : "Edit Article"}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 w-9 p-0 flex items-center justify-center text-gray-500 hover:text-gray-900 border-gray-200"
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-10">
                {/* Left Column: Content */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                >
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden min-h-[800px]">
                        <div className="px-12 py-16 prose prose-slate max-w-none">
                            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
                                {article.title}
                            </h1>

                            <div className="article-preview-content">
                                <div
                                    dangerouslySetInnerHTML={{ __html: article.html_content || article.content || "<p class='grow-0 text-gray-400 italic py-10'>AI is tailoring your content masterpieces...</p>" }}
                                    className="article-body-premium"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Sidebar */}
                <aside className="space-y-6">
                    {/* Featured Image Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-1">
                        <div className="aspect-video relative bg-gray-50 rounded-xl overflow-hidden group">
                            {(article.featured_image || article.featured_image_url) ? (
                                <img
                                    src={article.featured_image || article.featured_image_url}
                                    alt="Hero"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 gap-2 p-4 text-center">
                                    <Globe className="h-8 w-8 opacity-20" />
                                    <p className="text-[10px] font-medium opacity-50 uppercase tracking-widest">No Featured Image</p>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                <p className="text-[10px] text-white/90 font-bold uppercase tracking-widest bg-emerald-600/80 px-2 py-1 rounded backdrop-blur-sm">
                                    Hero Image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                        <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Keyword:</p>
                            <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                {article.keyword || "Not optimized"}
                            </p>
                        </div>

                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Type:</p>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none hover:bg-blue-50 font-bold capitalize">
                                {article.article_type || "Standard"}
                            </Badge>
                        </div>

                        {/* CMS Integration Mockups as per design */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Integrations:</p>
                            <Button variant="outline" className="w-full justify-start gap-3 h-11 text-gray-600 hover:text-emerald-600 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all font-medium border-gray-200">
                                <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center">
                                    <Globe className="h-3 w-3 text-gray-400" />
                                </div>
                                Create First Integration
                            </Button>
                        </div>

                        {/* Editable Status */}
                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status:</p>
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin text-emerald-600" /> : <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />}
                            </div>
                            <div className="flex gap-2">
                                <Select
                                    value={editableStatus}
                                    onValueChange={(val) => {
                                        setEditableStatus(val);
                                        handleSaveMetadata('status', val);
                                    }}
                                >
                                    <SelectTrigger className="h-10 text-sm font-bold text-gray-900 border-gray-200 shadow-none focus:ring-emerald-500">
                                        <SelectValue placeholder="Select Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="planned">Planned</SelectItem>
                                        <SelectItem value="generated">Generated</SelectItem>
                                        <SelectItem value="published">Published</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Editable Slug */}
                        <div className="space-y-1.5 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Slug:</p>
                                <button
                                    onClick={() => handleSaveMetadata('slug', editableSlug)}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                                >
                                    SAVE
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    value={editableSlug}
                                    onChange={(e) => setEditableSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))}
                                    className="h-10 text-xs font-medium text-gray-600 bg-gray-50 border-gray-100 shadow-none focus-visible:ring-emerald-500 pr-8"
                                />
                                <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-300" />
                            </div>
                        </div>

                        {/* Meta Description with counter */}
                        <div className="space-y-2 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Meta Description:</p>
                                <span className={cn(
                                    "text-[10px] font-bold",
                                    metaCharCount > metaLimit ? "text-red-500" : "text-gray-400"
                                )}>
                                    {metaCharCount}/{metaLimit}
                                </span>
                            </div>
                            <Textarea
                                value={editableMetaDesc}
                                onChange={(e) => setEditableMetaDesc(e.target.value)}
                                className="min-h-[100px] text-xs leading-relaxed text-gray-600 bg-gray-50 border-gray-100 shadow-none focus-visible:ring-emerald-500 resize-none p-3"
                                placeholder="Describe your masterpiece..."
                            />
                            <Button
                                onClick={() => handleSaveMetadata('meta_description', editableMetaDesc)}
                                disabled={isSaving}
                                className="w-full h-8 text-[10px] font-bold bg-[#F3F4F6] text-gray-900 border-none shadow-none hover:bg-gray-200 transition-colors uppercase tracking-widest"
                            >
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : "Save Description"}
                            </Button>
                        </div>
                    </div>

                    {/* Referral / Bottom Promo matching the design */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 text-center">
                        <Button variant="outline" className="w-full justify-center gap-2 h-11 border-dashed border-gray-300 text-gray-400 hover:text-emerald-600 hover:border-emerald-300 transition-all font-bold">
                            <Target className="h-4 w-4" />
                            Join Referral Program
                        </Button>
                    </div>
                </aside>
            </main>

            {/* Premium Typography System */}
            <style jsx global>{`
                .article-body-premium {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .article-body-premium h1 { font-size: 2.75rem; font-weight: 900; color: #111827; margin-top: 2rem; margin-bottom: 2rem; line-height: 1.1; letter-spacing: -0.02em; }
                .article-body-premium h2 { font-size: 1.875rem; font-weight: 800; color: #111827; margin-top: 3rem; margin-bottom: 1.25rem; line-height: 1.2; letter-spacing: -0.01em; }
                .article-body-premium h3 { font-size: 1.5rem; font-weight: 700; color: #111827; margin-top: 2.5rem; margin-bottom: 1rem; line-height: 1.3; }
                .article-body-premium p { 
                    font-size: 1.125rem; 
                    line-height: 1.85; 
                    color: #374151; 
                    margin-bottom: 2rem; 
                    font-weight: 400;
                    letter-spacing: -0.005em;
                }
                .article-body-premium ul, .article-body-premium ol { margin-bottom: 2rem; padding-left: 1.25rem; }
                .article-body-premium li { 
                    margin-bottom: 0.75rem; 
                    font-size: 1.125rem; 
                    line-height: 1.8; 
                    color: #374151; 
                }
                .article-body-premium li::marker { color: #10B981; font-weight: bold; }
                .article-body-premium strong { color: #111827; font-weight: 700; }
                .article-body-premium blockquote { 
                    border-left: 4px solid #10B981; 
                    padding-left: 2rem; 
                    font-style: italic; 
                    margin: 3.5rem 0; 
                    color: #1F2937;
                    font-size: 1.5rem;
                    line-height: 1.6;
                    font-weight: 500;
                    background: #F9FAFB;
                    padding-top: 2rem;
                    padding-bottom: 2rem;
                    border-radius: 0 1rem 1rem 0;
                }
                .article-body-premium a {
                    color: #059669;
                    text-decoration: underline;
                    text-underline-offset: 4px;
                    font-weight: 600;
                    transition: color 0.2s;
                }
                .article-body-premium a:hover {
                    color: #047857;
                }
                .article-body-premium img {
                    border-radius: 1rem;
                    box-shadow: 0 4px 20px -2px rgba(0,0,0,0.1);
                    margin: 3rem 0;
                }
            `}</style>
        </div>
    );
}
