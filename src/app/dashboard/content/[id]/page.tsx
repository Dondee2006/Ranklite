"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, use, useMemo } from "react";
import dynamicImport from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { marked } from "marked";

const TipTapEditor = dynamicImport(() => import("@/components/dashboard/tiptap-editor").then(mod => mod.TipTapEditor), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100" />,
});
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
    const [integrations, setIntegrations] = useState<any[]>([]);
    const [isPublishing, setIsPublishing] = useState<string | null>(null);

    const parseYouTubeShortcodes = (content: string): string => {
        if (!content) return content;
        // Handle both formats: [YOUTUBE:id] and <!-- YOUTUBE:id -->
        return content.replace(/(?:\[YOUTUBE:|<!--\s*YOUTUBE:)([a-zA-Z0-9_-]+)(?:\]|\s*-->)/g, (match, videoId) => {
            return `<div class="video-container" style="margin: 2rem 0; aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden; max-width: 100%;">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>`;
        });
    };



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

                // Load content for editing
                // Convert shortcodes to iframes so TipTap extension picks them up
                const rawContent = data.article.html_content || data.article.content || "";
                const processedContent = parseYouTubeShortcodes(rawContent);
                setEditableContent(processedContent);

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
        fetchIntegrations();
    }, [id]);

    const fetchIntegrations = async () => {
        try {
            const res = await fetch("/api/cms/integrations");
            if (res.ok) {
                const data = await res.json();
                setIntegrations(data.integrations || []);
            }
        } catch (error) {
            console.error("Failed to fetch integrations:", error);
        }
    };

    const handlePublish = async (platform: string) => {
        setIsPublishing(platform);
        try {
            const res = await fetch("/api/cms-publish", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    articleId: id,
                    cmsTarget: platform
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Publishing failed");

            toast.success(`Published to ${platform} as draft!`);
            if (data.publishedUrl) {
                window.open(data.publishedUrl, '_blank');
            }

            // Refresh article to get updated status/cms_exports
            const refreshRes = await fetch(`/api/articles/${id}`);
            if (refreshRes.ok) {
                const refreshData = await refreshRes.json();
                setArticle(refreshData.article);
                setEditableStatus(refreshData.article.status);
            }

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setIsPublishing(null);
        }
    };

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

    // Convert TipTap YouTube embeds back to shortcode format for storage
    const convertYouTubeToShortcode = (html: string): string => {
        // TipTap YouTube extension creates divs with data-youtube-video attribute
        // We need to convert these back to <!-- YOUTUBE:id --> format
        return html.replace(
            /<div[^>]*data-youtube-video="([^"]+)"[^>]*>.*?<\/div>/gs,
            (match, videoId) => `<!-- YOUTUBE:${videoId} -->`
        );
    };

    const handleSaveAllContent = async () => {
        setIsSaving(true);
        try {
            // Convert YouTube embeds back to shortcodes before saving
            const contentToSave = convertYouTubeToShortcode(editableContent);

            const response = await fetch(`/api/articles/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: editableTitle,
                    html_content: contentToSave,
                    content: contentToSave
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
                                    onClick={() => {
                                        // Force conversion of any legacy markdown format to clean HTML for the visual editor
                                        const rawContent = article.html_content || article.content || "";

                                        // Even if it's already HTML, running it through marked ensures nested symbols are resolved
                                        // and legacy markdown articles are converted instantly.
                                        setEditableContent(marked.parse(rawContent) as string);
                                        setIsEditingContent(true);
                                    }}
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
                    className="bg-white border-r border-gray-100 min-h-[calc(100vh-65px)] min-w-0"
                >
                    <div className="max-w-[1100px] mx-auto px-12 py-20 prose prose-slate break-words">
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
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content (Premium Editor)</label>
                                    <TipTapEditor
                                        content={editableContent}
                                        onChange={setEditableContent}
                                        placeholder="Start writing your masterpiece..."
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="article-preview-content" style={{ maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'break-word', overflow: 'hidden' }}>
                                <h1 className="text-4xl font-bold text-gray-900 tracking-tight leading-tight mb-10">
                                    {article.title}
                                </h1>
                                <div className="article-body-premium">
                                    {article.html_content ? (
                                        <div dangerouslySetInnerHTML={{ __html: parseYouTubeShortcodes(article.html_content) }} />
                                    ) : article.content ? (
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {article.content}
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
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden p-2 transition-all duration-500 hover:shadow-2xl hover:border-emerald-200 group">
                        <div className="aspect-video relative bg-slate-50 rounded-[1.5rem] overflow-hidden">
                            {(article.featured_image || article.featured_image_url) ? (
                                <img
                                    src={article.featured_image || article.featured_image_url}
                                    alt="Hero"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-3 p-4 text-center">
                                    <Globe className="h-10 w-10 opacity-30 animate-pulse" />
                                    <p className="text-[11px] font-bold opacity-60 uppercase tracking-[0.2em] text-slate-400">No Featured Image</p>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                                <p className="text-[10px] text-white font-black uppercase tracking-[0.25em] bg-emerald-500/90 px-3 py-1.5 rounded-full backdrop-blur-md w-fit shadow-lg shadow-emerald-500/20">
                                    Hero Image
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Meta Section */}
                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-10 transition-all duration-500 hover:shadow-xl hover:border-emerald-100">
                        <div className="space-y-3">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Target className="h-3.5 w-3.5 text-emerald-500/60" />
                                Target Keyword
                            </p>
                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 group transition-colors hover:bg-white hover:border-emerald-200">
                                <p className="text-lg font-bold text-slate-900 flex items-center gap-3">
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                                    {article.keyword || "Not optimized"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-8 border-t border-slate-100/80">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Tag className="h-3.5 w-3.5 text-blue-500/60" />
                                Article Type
                            </p>
                            <Badge variant="secondary" className="bg-blue-50/50 text-blue-600 border-blue-100/50 hover:bg-blue-100/50 font-bold px-4 py-2 text-[13px] rounded-xl transition-all tracking-tight">
                                {article.article_type || "Standard Post"}
                            </Badge>
                        </div>

                        {/* Editable Status */}
                        <div className="space-y-4 pt-8 border-t border-slate-100/80">
                            <div className="flex items-center justify-between mb-1">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Clock className="h-3.5 w-3.5 text-amber-500/60" />
                                    Status
                                </p>
                                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" /> : <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] translate-y-[1px]" />}
                            </div>
                            <Select
                                value={editableStatus}
                                onValueChange={(val) => {
                                    setEditableStatus(val);
                                    handleSaveMetadata('status', val);
                                }}
                            >
                                <SelectTrigger className="h-12 text-[15px] font-bold text-slate-900 border-slate-200 rounded-xl shadow-none focus:ring-emerald-500/20 focus:border-emerald-500 bg-slate-50/50 hover:bg-white transition-all">
                                    <SelectValue placeholder="Select Status" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl shadow-2xl border-slate-100">
                                    <SelectItem value="planned">Planned</SelectItem>
                                    <SelectItem value="generated">Generated</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Editable Slug */}
                        <div className="space-y-4 pt-8 border-t border-slate-100/80">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Link2 className="h-3.5 w-3.5 text-slate-400/60" />
                                    URL Slug
                                </p>
                                <button
                                    onClick={() => handleSaveMetadata('slug', editableSlug)}
                                    className="text-[11px] font-black text-emerald-600 hover:text-emerald-500 transition-all tracking-[0.1em] bg-emerald-50 px-2 py-1 rounded-lg"
                                >
                                    SAVE
                                </button>
                            </div>
                            <div className="relative group/input">
                                <Input
                                    value={editableSlug}
                                    onChange={(e) => setEditableSlug(e.target.value.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''))}
                                    className="h-12 text-sm font-semibold text-slate-600 bg-slate-50 border-slate-200 rounded-xl shadow-none focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 transition-all pr-12 group-hover/input:bg-white"
                                />
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover/input:text-emerald-500 transition-colors">
                                    <Globe className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        {/* Meta Description with counter */}
                        <div className="space-y-4 pt-8 border-t border-slate-100/80">
                            <div className="flex items-center justify-between">
                                <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <FileText className="h-3.5 w-3.5 text-slate-400/60" />
                                    SEO Description
                                </p>
                                <span className={cn(
                                    "text-[11px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm transition-all",
                                    metaCharCount > metaLimit ? "bg-red-50 text-red-500" : "bg-slate-100 text-slate-400"
                                )}>
                                    {metaCharCount}/{metaLimit}
                                </span>
                            </div>
                            <Textarea
                                value={editableMetaDesc}
                                onChange={(e) => setEditableMetaDesc(e.target.value)}
                                className="min-h-[140px] text-[14px] leading-relaxed text-slate-600 bg-slate-50 border-slate-200 rounded-xl shadow-none focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 resize-none p-5 font-medium transition-all hover:bg-white"
                                placeholder="Describe your masterpiece for search engines..."
                            />
                            <Button
                                onClick={() => handleSaveMetadata('meta_description', editableMetaDesc)}
                                disabled={isSaving}
                                className="w-full h-12 text-[12px] font-black bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:bg-emerald-600 hover:border-emerald-600 transition-all duration-300 uppercase tracking-[0.2em] rounded-xl active:scale-95 translate-y-0 hover:-translate-y-0.5"
                            >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Metadata
                            </Button>
                        </div>

                        {/* CMS Export Section */}
                        {integrations.length > 0 && (
                            <div className="bg-emerald-50/30 rounded-[2rem] border border-emerald-100/50 shadow-sm p-8 space-y-7 transition-all duration-500 hover:shadow-xl hover:bg-white hover:border-emerald-200">
                                <p className="text-[11px] font-black text-emerald-700/60 uppercase tracking-[0.25em] flex items-center gap-2">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    CMS Integration
                                </p>
                                <div className="space-y-5">
                                    {integrations.map((integration) => {
                                        const exportData = (article as any)?.cms_exports?.[integration.platform];
                                        const isNotion = integration.platform.toLowerCase() === 'notion';

                                        return (
                                            <div key={integration.id} className="space-y-4">
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-between px-6 h-14 rounded-2xl border-slate-200 transition-all duration-500 group/btn translate-y-0 active:scale-95",
                                                        exportData
                                                            ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:shadow-emerald-100 shadow-lg"
                                                            : "bg-white hover:border-emerald-400 hover:text-emerald-700 hover:shadow-2xl hover:-translate-y-1"
                                                    )}
                                                    onClick={() => handlePublish(integration.platform)}
                                                    disabled={isPublishing !== null}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        {isPublishing === integration.platform ? (
                                                            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                                                        ) : isNotion ? (
                                                            <img src="/notion-icon.png" className="w-5 h-5 opacity-80" onError={(e) => (e.currentTarget.style.display = 'none')} />
                                                        ) : (
                                                            <Globe className="h-5 w-5 opacity-40 group-hover/btn:rotate-12 transition-transform" />
                                                        )}
                                                        <span className="text-[14px] font-black uppercase tracking-widest">
                                                            {exportData ? `Update ${integration.platform}` : `Push to ${integration.platform}`}
                                                        </span>
                                                    </div>
                                                    {exportData ? (
                                                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                                    ) : (
                                                        <ChevronLeft className="h-4 w-4 rotate-180 opacity-20 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                                    )}
                                                </Button>

                                                {exportData?.published_url && (
                                                    <a
                                                        href={exportData.published_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center justify-center gap-2 group/link py-2 rounded-xl border border-dashed border-emerald-100/50 hover:bg-emerald-50/50 transition-all"
                                                    >
                                                        <span className="text-[11px] font-black text-emerald-600/60 group-hover/link:text-emerald-600 uppercase tracking-[0.15em] transition-colors">
                                                            View live on {integration.platform}
                                                        </span>
                                                        <ExternalLink className="h-3 w-3 text-emerald-400 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                                                    </a>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>

                </aside>
            </main>

            <style jsx global>{`
                /* Content Preview Styles */
                .article-body-premium {
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                    max-width: 100%;
                    overflow-x: hidden;
                }
                .article-body-premium * {
                    max-width: 100%;
                    word-wrap: break-word;
                    overflow-wrap: break-word;
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
                    max-width: 100%;
                    height: auto;
                }
                .article-body-premium iframe {
                    max-width: 100%;
                }
                .article-body-premium .video-container {
                    max-width: 100%;
                }
                .article-body-premium a {
                    word-break: break-all;
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
