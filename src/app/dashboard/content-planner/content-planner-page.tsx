"use client";


import { useState, useEffect, useRef, useCallback } from "react";
import {
    Sparkles,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
    Calendar,
    FileText,
    Zap,
    Edit3,
    Trash2,
    Clock,
    RefreshCw,
    Check,
    Filter,
    Search,
    ArrowUpDown,
    Copy,
    Link as LucideLink,
    ExternalLink,
    Image as LucideImage,
    Download,
    Crown,
    Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const ARTICLE_TYPES = [
    { value: "listicle", label: "Listicle", icon: "📝" },
    { value: "how-to", label: "How-To", icon: "📖" },
    { value: "guide", label: "Guide", icon: "📚" },
    { value: "comparison", label: "Comparison", icon: "⚖️" },
    { value: "review", label: "Review", icon: "⭐" },
    { value: "q-and-a", label: "Q&A", icon: "❓" },
    { value: "tutorial", label: "Tutorial", icon: "🎓" },
    { value: "problem-solution", label: "Problem-Solution", icon: "💡" },
];

const SEARCH_INTENTS = [
    { value: "informational", label: "Informational", color: "bg-blue-100 text-blue-700" },
    { value: "transactional", label: "Transactional", color: "bg-green-100 text-green-700" },
    { value: "commercial", label: "Commercial", color: "bg-purple-100 text-purple-700" },
    { value: "navigational", label: "Navigational", color: "bg-orange-100 text-orange-700" },
];

interface Article {
    id: string;
    title: string;
    slug: string;
    keyword: string;
    secondary_keywords: string[];
    search_intent: string;
    article_type: string;
    word_count: number;
    cta_placement: string;
    status: string;
    scheduled_date: string;
    scheduled_time?: string;
    volume: number;
    difficulty: number;
    content: string;
    html_content: string;
    markdown_content: string;
    meta_description: string;
    outline: object;
    internal_links: object[];
    external_links: object[];
    images: object[];
    cms_exports: object;
    published_at?: string;
    featured_image?: string;
    backlinks_status?: string;
    backlinks_count?: number;
    cluster_name?: string;
    is_pillar?: boolean;
}

interface AutopilotSettings {
    enabled: boolean;
    publish_time_start: number;
    publish_time_end: number;
    timezone: string;
    articles_per_day: number;
    preferred_article_types: string[];
    tone: string;
    cms_targets: string[];
}

function getArticleTypeLabel(type: string) {
    const found = ARTICLE_TYPES.find(t => t.value === type);
    return found?.label || "Article";
}

function getStatusBadgeStyle(status: string) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        planned: { bg: "bg-blue-100", text: "text-blue-700", label: "Planned" },
        generated: { bg: "bg-purple-100", text: "text-purple-700", label: "Generated" },
        qa_validated: { bg: "bg-amber-100", text: "text-amber-700", label: "QA Validated" },
        published: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Published" },
        backlinks_queued: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Backlinks Queued" },
    };
    return styles[status] || styles.planned;
}

function getBacklinksStatusBadge(status?: string) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
        queued: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Queued" },
        in_progress: { bg: "bg-yellow-100", text: "text-yellow-700", label: "In Progress" },
        completed: { bg: "bg-green-100", text: "text-green-700", label: "Completed" },
    };
    return styles[status || 'pending'] || styles.pending;
}

function formatDateLocal(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function getArticleTypeIcon(type: string) {
    const found = ARTICLE_TYPES.find(t => t.value === type);
    return found?.icon || "📝";
}

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        planned: "bg-blue-100 text-blue-700",
        generated: "bg-purple-100 text-purple-700",
        qa_validated: "bg-amber-100 text-amber-700",
        published: "bg-emerald-100 text-emerald-700",
        draft: "bg-gray-100 text-gray-700",
    };
    return colors[status] || colors.draft;
}

export default function ContentPlannerPage() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showArticleDetail, setShowArticleDetail] = useState(false);
    const [showAutopilotModal, setShowAutopilotModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
    const [newArticle, setNewArticle] = useState({
        title: "",
        keyword: "",
        secondary_keywords: "",
        article_type: "guide",
        search_intent: "informational",
        word_count: "1500",
        cta_placement: "end",
        scheduled_time: "09:00",
    });
    const [saving, setSaving] = useState(false);
    const [generatingArticle, setGeneratingArticle] = useState<string | null>(null);
    const [autopilotSettings, setAutopilotSettings] = useState<AutopilotSettings>({
        enabled: true,
        publish_time_start: 7,
        publish_time_end: 9,
        timezone: "UTC",
        articles_per_day: 1,
        preferred_article_types: [],
        tone: "natural",
        cms_targets: [],
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const autopilotRunLock = useRef(false);

    const searchParams = useSearchParams();
    const router = useRouter();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [welcomeStep, setWelcomeStep] = useState<"loading" | "success">("loading");
    const autoGenerateLock = useRef(false);

    useEffect(() => {
        if (searchParams.get("welcome") === "true") {
            setShowWelcomeModal(true);
            const timer = setTimeout(() => {
                setWelcomeStep("success");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    useEffect(() => {
        if (searchParams.get("welcome") !== "true") return;
        if (loading) return;
        if (generating) return;
        if (autoGenerateLock.current) return;

        const hasGeneratedArticles = articles.some((a) => a.status === "generated");
        if (hasGeneratedArticles) return;

        autoGenerateLock.current = true;

        (async () => {
            try {
                const planRes = await fetch("/api/billing/current-plan");
                const planData = await planRes.json();
                const postsPerMonth = planData?.plan?.posts_per_month ?? 0;
                const planStatus = planData?.status;

                if (planStatus !== "active" || postsPerMonth < 30) return;
                await generateMonthlyCalendar();
            } catch (error) {
                console.error("Failed to auto-generate initial articles:", error);
            }
        })();
    }, [articles, generating, loading, searchParams]);

    const handleCloseWelcome = () => {
        setShowWelcomeModal(false);
        router.replace("/dashboard/content-planner");
    };

    const loadArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/articles');
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error("Failed to load articles:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAutopilotSettings = useCallback(async () => {
        try {
            const response = await fetch("/api/autopilot");
            const data = await response.json();
            if (data.settings) {
                setAutopilotSettings(data.settings);
            }
        } catch (error) {
            console.error("Failed to load autopilot settings:", error);
        }
    }, []);

    const runAutopilotPublish = useCallback(async () => {
        try {
            const response = await fetch("/api/autopilot/run", { method: "POST" });
            const data = await response.json();
            if (data.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error("Autopilot publish failed:", error);
        }
    }, [loadArticles]);

    useEffect(() => {
        loadArticles();
        loadAutopilotSettings();
    }, [loadArticles, loadAutopilotSettings]);

    const parseYouTubeShortcodes = (content: string): string => {
        if (!content) return content;
        return content.replace(/<!--\s*YOUTUBE:([a-zA-Z0-9_-]+)\s*-->/g, (match, videoId) => {
            return `<div class="video-container" style="margin: 2rem 0; aspect-ratio: 16/9; border-radius: 0.75rem; overflow: hidden; max-width: 100%;">
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/${videoId}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
            </div>`;
        });
    };

    useEffect(() => {
        if (!autopilotSettings.enabled) {
            autopilotRunLock.current = false;
            return;
        }
        if (!autopilotRunLock.current) {
            autopilotRunLock.current = true;
            runAutopilotPublish();
        }
    }, [autopilotSettings.enabled, runAutopilotPublish]);

    async function generateMonthlyCalendar() {
        setGenerating(true);
        try {
            const now = new Date();
            const startResponse = await fetch("/api/content-calendar/generate-bulk/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month: now.getMonth(),
                    year: now.getFullYear(),
                }),
            });

            const data = await startResponse.json();

            if (!startResponse.ok || !data.jobId) {
                toast.error(data.error || "Failed to start generation. Please try again.");
                setGenerating(false);
                return;
            }
            toast.info("Generating 30 articles. This may take a moment...");

            const { jobId } = data;
            const pollInterval = setInterval(async () => {
                const statusResponse = await fetch(`/api/content-calendar/generate-bulk/status/${jobId}`);
                const status = await statusResponse.json();

                if (status.status === "completed") {
                    clearInterval(pollInterval);
                    await loadArticles();
                    toast.success("Articles generated successfully!");
                    setGenerating(false);
                } else if (status.status === "failed") {
                    clearInterval(pollInterval);
                    toast.error(`Generation failed: ${status.error}`);
                    setGenerating(false);
                }
            }, 3000);
        } catch (error) {
            console.error("Failed to start generation:", error);
            toast.error("Failed to start generation. Please check the console for details.");
            setGenerating(false);
        }
    }

    async function generateArticleContent(articleId: string) {
        setGeneratingArticle(articleId);
        try {
            const response = await fetch("/api/articles/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ articleId }),
            });
            const data = await response.json();
            if (response.ok) {
                if (data.article) {
                    setArticles(prev => prev.map(a => a.id === articleId ? data.article : a));
                    if (selectedArticle?.id === articleId) {
                        setSelectedArticle(data.article);
                    }
                    toast.success("Article content generated!");
                }
            } else {
                toast.error(`Error: ${data.error || data.message || "Failed to generate article content"}`);
            }
        } catch (error) {
            console.error("Failed to generate article:", error);
            toast.error("A network error occurred. Please try again.");
        }
        finally {
            setGeneratingArticle(null);
        }
    }

    async function saveArticle() {
        if (!newArticle.title || !selectedDate) return;
        setSaving(true);
        try {
            const response = await fetch("/api/articles", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: newArticle.title,
                        keyword: newArticle.keyword,
                        secondary_keywords: newArticle.secondary_keywords.split(",").map(k => k.trim()).filter(Boolean),
                        article_type: newArticle.article_type,
                        search_intent: newArticle.search_intent,
                        word_count: parseInt(newArticle.word_count) || 1500,
                        cta_placement: newArticle.cta_placement,
                        scheduled_date: selectedDate,
                        scheduled_time: newArticle.scheduled_time,
                        status: "planned",
                    }),
            });
            if (response.ok) {
                setShowAddModal(false);
                toast.success("Article scheduled successfully!");
                loadArticles();
            }
        } catch (error) {
            console.error("Failed to save article:", error);
        } finally {
            setSaving(false);
        }
    }

    async function deleteArticle(articleId: string) {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "DELETE",
            });
            if (response.ok) {
                toast.success("Article deleted successfully");
                loadArticles();
                setShowArticleDetail(false);
                setSelectedArticle(null);
            }
        } catch (error) {
            console.error("Failed to delete article:", error);
        }
    }

    async function saveAutopilotSettings() {
        try {
            const response = await fetch("/api/autopilot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(autopilotSettings),
            });
            if (response.ok) {
                toast.success("Autopilot settings updated");
                setShowAutopilotModal(false);
            }
        } catch (error) {
            console.error("Failed to save autopilot settings:", error);
        }
    }

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.keyword?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <header className="sticky top-0 z-30 border-b border-gray-200 bg-white px-8 py-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Content Planner</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Manage your SEO content calendar</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button
                            onClick={generateMonthlyCalendar}
                            disabled={generating}
                            type="button"
                            className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                        >
                            {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            Generate 30 Articles
                        </Button>
                        <Button
                            onClick={() => setShowAutopilotModal(true)}
                            variant="outline"
                            className="gap-2"
                        >
                            <Zap className={cn("h-4 w-4", autopilotSettings.enabled && "text-emerald-500")} />
                            Autopilot {autopilotSettings.enabled ? "ON" : "OFF"}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="space-y-12">
                        {(() => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0);
                            const currentMonthIdx = now.getMonth();
                            const currentYearIdx = now.getFullYear();

                            const monthsToShow: { month: number; year: number }[] = [];
                            const articleMonths = new Set(articles.map(a => {
                                const d = new Date(a.scheduled_date);
                                return `${d.getMonth()}-${d.getFullYear()}`;
                            }));

                            for (let i = 0; i < 4; i++) {
                                const d = new Date(currentYearIdx, currentMonthIdx + i, 1);
                                monthsToShow.push({ month: d.getMonth(), year: d.getFullYear() });
                                articleMonths.delete(`${d.getMonth()}-${d.getFullYear()}`);
                            }

                            Array.from(articleMonths).forEach(key => {
                                const [m, y] = key.split('-').map(Number);
                                monthsToShow.push({ month: m, year: y });
                            });

                            monthsToShow.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));

                            return monthsToShow.map(({ month, year }) => {
                                const firstDayOfMonth = new Date(year, month, 1).getDay();
                                const startingPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                                const daysInMonth = new Date(year, month + 1, 0).getDate();
                                const totalCells = Math.ceil((startingPadding + daysInMonth) / 7) * 7;
                                const days = Array.from({ length: totalCells }, (_, i) => {
                                    const dayOfMonth = i - startingPadding + 1;
                                    const isValidDay = dayOfMonth > 0 && dayOfMonth <= daysInMonth;
                                    const date = isValidDay ? new Date(year, month, dayOfMonth) : null;
                                    return { date, dayOfMonth, isValidDay };
                                });

                                const weeks = [];
                                for (let i = 0; i < days.length; i += 7) {
                                    weeks.push(days.slice(i, i + 7));
                                }

                                const visibleWeeks = weeks.filter(week => {
                                    const hasArticle = week.some(d => {
                                        if (!d.isValidDay || !d.date) return false;
                                        const dateStr = formatDateLocal(d.date);
                                        return articles.some(a => a.scheduled_date === dateStr);
                                    });
                                    if (hasArticle) return true;
                                    const hasFutureDay = week.some(d => {
                                        if (!d.isValidDay || !d.date) return false;
                                        const cellDate = new Date(d.date);
                                        cellDate.setHours(0, 0, 0, 0);
                                        return cellDate >= now;
                                    });
                                    return hasFutureDay;
                                });

                                if (visibleWeeks.length === 0) return null;

                                return (
                                    <div key={`${month}-${year}`} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-8">
                                        <h2 className="text-xl font-bold text-gray-900 mb-8">
                                            {MONTHS[month]} {year}
                                        </h2>

                                        <div className="grid grid-cols-7 gap-3">
                                            {DAYS.map(day => (
                                                <div key={day} className="text-[11px] font-bold text-gray-400 uppercase tracking-widest text-right px-2 pb-4">
                                                    {day}
                                                </div>
                                            ))}
                                            {visibleWeeks.flat().map((d, i) => {
                                                const dateStr = d.date ? formatDateLocal(d.date) : null;
                                                const dayArticles = d.isValidDay ? articles.filter(a => a.scheduled_date === dateStr) : [];
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                const isPastOrToday = d.date ? d.date <= today : false;

                                                return (
                                                    <div
                                                        key={i}
                                                        className={cn(
                                                            "min-h-[160px] rounded-xl border p-4 transition-all duration-200 group relative",
                                                            d.isValidDay
                                                                ? dayArticles.length > 0
                                                                    ? "bg-white border-gray-100 hover:border-emerald-200 hover:shadow-lg cursor-default"
                                                                    : "bg-white border-gray-50 cursor-default"
                                                                : "bg-gray-50/10 border-transparent"
                                                        )}
                                                    >
                                                        {d.isValidDay && d.date && (
                                                            <div className="flex flex-col h-full">
                                                                <div className="flex items-center justify-between mb-4">
                                                                    <div className="flex items-baseline gap-1.5">
                                                                        <span className="text-[15px] font-bold text-gray-900 leading-none">{d.dayOfMonth}</span>
                                                                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider leading-none">
                                                                            {d.date.toLocaleDateString('en-US', { weekday: 'short' })}
                                                                        </span>
                                                                    </div>
                                                                    {dayArticles.length > 0 && dayArticles[0].is_pillar && (
                                                                        <Crown className="h-4 w-4 text-amber-500" />
                                                                    )}
                                                                </div>

                                                                {dayArticles.length > 0 ? (
                                                                    <div className="flex-1 flex flex-col min-w-0">
                                                                          <div className="flex items-center gap-2 mb-2">
                                                                              <div className={cn(
                                                                                  "h-1.5 w-1.5 rounded-full shrink-0",
                                                                                  dayArticles[0].status === 'published' ? "bg-emerald-500" :
                                                                                      dayArticles[0].status === 'generated' ? "bg-purple-500" : "bg-blue-500"
                                                                              )} />
                                                                              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-normal truncate">
                                                                                  {dayArticles[0].scheduled_time ? `${dayArticles[0].scheduled_time.slice(0, 5)} • ` : ""}{getArticleTypeLabel(dayArticles[0].article_type)}
                                                                              </span>
                                                                          </div>

                                                                        <h3 className="text-[12px] font-semibold text-gray-900 leading-[1.4] mb-3 line-clamp-2 min-h-[2.8em] tracking-tight">
                                                                            {dayArticles[0].title}
                                                                        </h3>

                                                                        <div className="flex items-center gap-4 mt-auto pb-1">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Vol</span>
                                                                                <span className="text-[11px] font-bold text-gray-700 leading-none tracking-tight">{dayArticles[0].volume || 0}</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">KD</span>
                                                                                <span className="text-[11px] font-bold text-gray-700 leading-none tracking-tight">{dayArticles[0].difficulty || 0}</span>
                                                                            </div>
                                                                        </div>

                                                                        {isPastOrToday && (
                                                                            <Button
                                                                                size="sm"
                                                                                variant="secondary"
                                                                                disabled={generatingArticle === dayArticles[0].id}
                                                                                className="w-full h-8 mt-4 text-[10px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (dayArticles[0].status === 'planned') {
                                                                                        generateArticleContent(dayArticles[0].id);
                                                                                    } else {
                                                                                        router.push(`/dashboard/content/${dayArticles[0].id}`);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                {generatingArticle === dayArticles[0].id ? (
                                                                                    <Loader2 className="h-3 w-3 animate-spin" />
                                                                                ) : (
                                                                                    dayArticles[0].status === 'planned' ? "Create and Publish" : "Visit Article"
                                                                                )}
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className="flex-1" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search articles..."
                                    className="pl-9 h-10"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keyword</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Publish Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Backlinks</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredArticles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No articles found</td>
                                        </tr>
                                    ) : (
                                        filteredArticles.map((article) => {
                                            const statusBadge = getStatusBadgeStyle(article.status);
                                            const backlinksStatusBadge = getBacklinksStatusBadge(article.backlinks_status);
                                            return (
                                                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{article.title}</td>
                                                    <td className="px-6 py-4 text-sm text-teal-600 font-medium">{article.keyword || "—"}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusBadge.bg, statusBadge.text)}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(article.scheduled_date).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", backlinksStatusBadge.bg, backlinksStatusBadge.text)}>
                                                            {backlinksStatusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            onClick={() => { setSelectedArticle(article); setShowArticleDetail(true); }}
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-teal-600 hover:text-teal-700"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Schedule Article</h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                                <Input value={newArticle.title} onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })} placeholder="Article Title" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Primary Keyword</label>
                                <Input value={newArticle.keyword} onChange={(e) => setNewArticle({ ...newArticle, keyword: e.target.value })} placeholder="Primary Keyword" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Scheduled Time</label>
                                <Input 
                                    type="time" 
                                    value={newArticle.scheduled_time} 
                                    onChange={(e) => setNewArticle({ ...newArticle, scheduled_time: e.target.value })} 
                                    className="cursor-pointer"
                                />
                                <p className="text-[10px] text-slate-400">Specify when the article should be published on {selectedDate}.</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
                                <Button onClick={saveArticle} disabled={!newArticle.title || !newArticle.keyword || saving} className="flex-1 bg-emerald-600 text-white">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showArticleDetail && selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-bold">{selectedArticle.title}</h3>
                            <button onClick={() => { setShowArticleDetail(false); setSelectedArticle(null); }} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                          <div className="flex-1 overflow-y-auto p-6">
                              <div className="grid grid-cols-3 gap-6 mb-6">
                                  <div className="space-y-1">
                                      <label className="text-xs font-semibold text-slate-500 uppercase">Title</label>
                                      <Input value={selectedArticle.title} onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })} placeholder="Title" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-semibold text-slate-500 uppercase">Keyword</label>
                                      <Input value={selectedArticle.keyword} onChange={(e) => setSelectedArticle({ ...selectedArticle, keyword: e.target.value })} placeholder="Keyword" />
                                  </div>
                                  <div className="space-y-1">
                                      <label className="text-xs font-semibold text-slate-500 uppercase">Publish Time</label>
                                      <Input 
                                          type="time" 
                                          value={selectedArticle.scheduled_time || "09:00"} 
                                          onChange={(e) => setSelectedArticle({ ...selectedArticle, scheduled_time: e.target.value })} 
                                      />
                                  </div>
                              </div>
                            <div className="max-h-80 overflow-y-auto border p-4 rounded-lg bg-slate-50">
                                <div dangerouslySetInnerHTML={{ __html: parseYouTubeShortcodes(selectedArticle.html_content || selectedArticle.content || "") }} />
                            </div>
                        </div>
                        <div className="p-6 border-t flex items-center justify-between">
                            <Button variant="ghost" className="text-red-500" onClick={() => deleteArticle(selectedArticle.id)}>Delete</Button>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setShowArticleDetail(false)}>Cancel</Button>
                                <Button className="bg-emerald-600 text-white" onClick={async () => {
                                    try {
                                        const response = await fetch(`/api/articles/${selectedArticle.id}`, {
                                            method: "PATCH",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify(selectedArticle),
                                        });
                                        if (response.ok) {
                                            await loadArticles();
                                            setShowArticleDetail(false);
                                        }
                                    } catch (e) { console.error(e); }
                                }}>Save Changes</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAutopilotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">Autopilot Settings</h3>
                            <button onClick={() => setShowAutopilotModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <span>Enable Autopilot</span>
                                <Button variant={autopilotSettings.enabled ? "default" : "outline"} onClick={() => setAutopilotSettings({ ...autopilotSettings, enabled: !autopilotSettings.enabled })}>
                                    {autopilotSettings.enabled ? "On" : "Off"}
                                </Button>
                            </div>
                            <Button className="w-full bg-emerald-600 text-white" onClick={saveAutopilotSettings}>Save Settings</Button>
                        </div>
                    </div>
                </div>
            )}

            {showWelcomeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
                        {welcomeStep === "loading" ? (
                            <>
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold">Creating Content Strategy</h3>
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-4">Your Content Strategy is ready!</h3>
                                <Button onClick={handleCloseWelcome} className="w-full bg-emerald-600 text-white">Let's Go!</Button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

