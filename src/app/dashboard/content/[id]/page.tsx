"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
    const [editableTitle, setEditableTitle] = useState("");
    const [editableContent, setEditableContent] = useState("");
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
                setEditableTitle(data.article.title || "");
                setEditableContent(data.article.html_content || data.article.content || "");
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

    const handleSaveMetadata = async (field: 'slug' | 'meta_description' | 'status' | 'content' | 'title', value: string) => {
        setIsSaving(true);
        try {
            // If saving content, we save both html_content and content for compatibility
            const updatePayload = field === 'content'
                ? { html_content: value, content: value }
                : { [field]: value };

            const response = await fetch(`/api/articles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatePayload),
            });

            if (!response.ok) throw new Error("Failed to update article");

            const data = await response.json();
            setArticle(data.article);

            if (field === 'title') setEditableTitle(data.article.title);
            if (field === 'content') setEditableContent(data.article.html_content || data.article.content);

            toast.success(`${field.replace('_', ' ')} updated successfully`);
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveAllContent = async () => {
        setIsSaving(true);
        try {
            const response = await fetch(`/api/articles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editableTitle,
                    html_content: editableContent,
                    content: editableContent
                }),
            });

            if (!response.ok) throw new Error("Failed to save changes");

            const data = await response.json();
            setArticle(data.article);
            setIsEditingContent(false);
            toast.success("Article saved successfully");
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
            <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
                <div className="w-full flex items-center justify-between">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/dashboard/content" className="text-[13px] text-gray-500 hover:text-emerald-600 transition-colors">
                                    Content History
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="text-[13px] font-semibold text-gray-900 truncate max-w-[400px]">
                                    {article.title}
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center gap-3">
                        {isEditingContent ? (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-semibold text-gray-600 border-gray-200 hover:bg-gray-50"
                                    onClick={() => setIsEditingContent(false)}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 transition-all font-bold text-xs"
                                    onClick={handleSaveAllContent}
                                    disabled={isSaving}
                                >
                                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                                    Save Changes
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 px-4 text-xs font-bold text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900 gap-2 transition-all"
                                    onClick={() => setIsEditingContent(true)}
                                >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Edit Article
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 w-9 p-0 flex items-center justify-center text-gray-500 hover:text-gray-900 border-gray-200"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <main className="w-full grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">
                {/* Left Column: Content */}
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white border-r border-gray-100 min-h-[calc(100vh-65px)]"
                >
                    <div className="max-w-[1100px] mx-auto px-12 py-20 prose prose-slate">
                        {isEditingContent ? (
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Title</label>
                                    <Input
                                        value={editableTitle}
                                        onChange={(e) => setEditableTitle(e.target.value)}
                                        className="text-4xl font-bold text-gray-900 tracking-tight leading-tight border-none p-0 focus-visible:ring-0 bg-transparent h-auto"
                                        placeholder="Enter article title..."
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content (HTML/Markdown supported)</label>
                                    <Textarea
                                        value={editableContent}
                                        onChange={(e) => setEditableContent(e.target.value)}
                                        className="min-h-[700px] text-lg leading-relaxed text-gray-700 bg-gray-50/50 border-gray-100 focus-visible:ring-emerald-500/20 p-8 font-sans"
                                        placeholder="Write your masterpiece here..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="article-preview-content">
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-10">
                                    {article.title}
                                </h1>
                                <div className="article-body-premium">
                                    {article.content || article.html_content ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {article.content || article.html_content || ""}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="grow-0 text-gray-400 italic py-10">AI is tailoring your content masterpieces...</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Right Column: Sidebar */}
                <aside className="bg-[#F8F9FA] p-8 space-y-8 border-l border-gray-100 min-h-screen overflow-y-auto sticky top-[65px] h-[calc(100vh-65px)]">
                    {/* Featured Image Section */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-1.5 transition-transform hover:scale-[1.02] duration-300">
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
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-8">
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Target Keyword:</p>
                            <p className="text-base font-bold text-gray-900 flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                {article.keyword || "Not optimized"}
                            </p>
                        </div>

                        <div className="space-y-2 pt-6 border-t border-gray-100">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Article Type:</p>
                            <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none hover:bg-blue-50 font-bold px-3 py-1 text-xs capitalize">
                                {article.article_type || "Standard"}
                            </Badge>
                        </div>

                        {/* Editable Status */}
                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Publishing Status:</p>
                                {isSaving ? <Loader2 className="h-3 w-3 animate-spin text-emerald-600" /> : <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />}
                            </div>
                            <Select
                                value={editableStatus}
                                onValueChange={(val) => {
                                    setEditableStatus(val);
                                    handleSaveMetadata('status', val);
                                }}
                            >
                                <SelectTrigger className="h-11 text-sm font-bold text-gray-900 border-gray-200 shadow-none focus:ring-emerald-500 bg-gray-50/50">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="generated">Generated</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Editable Slug */}
                        <div className="space-y-3 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">URL Slug:</p>
                                <button
                                    onClick={() => handleSaveMetadata('slug', editableSlug)}
                                    className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors tracking-widest"
                                >
                                    SAVE SLUG
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    value={editableSlug}
                                    onChange={(e) => setEditableSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))}
                                    className="h-11 text-xs font-semibold text-gray-600 bg-gray-50/80 border-gray-100 shadow-none focus-visible:ring-emerald-500 pr-10"
                                />
                                <Link2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                            </div>
                        </div>

                        {/* Meta Description with counter */}
                        <div className="space-y-4 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-between">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SEO Description:</p>
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
                                className="min-h-[120px] text-xs leading-relaxed text-gray-600 bg-gray-50/80 border-gray-100 shadow-none focus-visible:ring-emerald-500 resize-none p-4 font-medium"
                                placeholder="Write a compelling SEO description..."
                            />
                            <Button
                                onClick={() => handleSaveMetadata('meta_description', editableMetaDesc)}
                                disabled={isSaving}
                                className="w-full h-10 text-[11px] font-bold bg-gray-900 text-white border-none shadow-lg hover:bg-gray-800 transition-all uppercase tracking-widest"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save SEO Meta"}
                            </Button>
                        </div>
                    </div>

                    {/* Referral / Bottom Promo */}
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center group cursor-pointer hover:border-emerald-200 transition-all">
                        <Button variant="outline" className="w-full justify-center gap-2 h-12 border-dashed border-gray-300 text-gray-400 group-hover:text-emerald-600 group-hover:border-emerald-300 transition-all font-bold text-xs uppercase tracking-widest">
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
                .article-body-premium h1 { 
                    font-family: inherit; 
                    font-size: 2.5rem; 
                    font-weight: 800; 
                    color: #0f172a; 
                    margin-top: 2.5rem; 
                    margin-bottom: 2rem; 
                    line-height: 1.2; 
                    letter-spacing: -0.025em; 
                }
                .article-body-premium h2 { 
                    font-family: inherit; 
                    font-size: 1.75rem; 
                    font-weight: 700; 
                    color: #0f172a; 
                    margin-top: 3rem; 
                    margin-bottom: 1.25rem; 
                    line-height: 1.3; 
                    letter-spacing: -0.015em;
                }
                .article-body-premium h3 { 
                    font-family: inherit; 
                    font-size: 1.5rem; 
                    font-weight: 700; 
                    color: #0f172a; 
                    margin-top: 2.5rem; 
                    margin-bottom: 1rem; 
                    line-height: 1.4; 
                }
                .article-body-premium p { 
                    font-size: 1.125rem; 
                    line-height: 1.8; 
                    color: #334155; 
                    margin-bottom: 1.75rem; 
                    font-weight: 400;
                }
                .article-body-premium ul, .article-body-premium ol { 
                    margin-bottom: 1.75rem; 
                    padding-left: 1.5rem; 
                }
                .article-body-premium li { 
                    margin-bottom: 0.75rem; 
                    font-size: 1.125rem; 
                    line-height: 1.75; 
                    color: #334155; 
                }
                .article-body-premium li::marker { 
                    color: #94a3b8; 
                }
                .article-body-premium strong { 
                    color: #0f172a; 
                    font-weight: 700; 
                }
                .article-body-premium blockquote { 
                    border-left: 4px solid #e2e8f0; 
                    padding-left: 1.5rem; 
                    font-style: italic; 
                    margin: 2.5rem 0; 
                    color: #475569;
                    font-size: 1.25rem;
                    line-height: 1.6;
                }
                .article-body-premium a {
                    color: #2563eb;
                    text-decoration: underline;
                    text-underline-offset: 3px;
                    font-weight: 500;
                    transition: color 0.15s;
                }
                .article-body-premium a:hover {
                    color: #1d4ed8;
                    text-decoration: underline;
                }
                .article-body-premium img {
                    border-radius: 0.75rem;
                    box-shadow: 0 4px 20px -5px rgba(0,0,0,0.08);
                    margin: 3rem 0;
                    width: 100%;
                }
                .article-body-premium hr {
                    border: 0;
                    border-top: 1px solid #e2e8f0;
                    margin: 3rem 0;
                }
            `}</style>
        </div>
    );
}
