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
    { value: "informational", label: "Informational", color: "bg-green-50 text-green-700" },
    { value: "transactional", label: "Transactional", color: "bg-emerald-100 text-emerald-700" },
    { value: "commercial", label: "Commercial", color: "bg-green-100 text-[#22C55E]" },
    { value: "navigational", label: "Navigational", color: "bg-orange-50 text-orange-700" },
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
    volume?: number;
    difficulty?: number;
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
        planned: { bg: "bg-green-50", text: "text-green-700", label: "Planned" },
        generated: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Generated" },
        qa_validated: { bg: "bg-green-100", text: "text-[#22C55E]", label: "QA Validated" },
        published: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Published" },
        backlinks_queued: { bg: "bg-green-50", text: "text-green-700", label: "Backlinks Queued" },
    };
    return styles[status] || styles.planned;
}

function getStatusIndicator(status: string) {
    const indicators: Record<string, { bg: string; text: string; label: string }> = {
        planned: { bg: "bg-green-50", text: "text-green-700", label: "Planned" },
        generated: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Generated" },
        qa_validated: { bg: "bg-green-100", text: "text-[#22C55E]", label: "QA Validated" },
        published: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Published" },
        backlinks_queued: { bg: "bg-green-50", text: "text-green-700", label: "Backlinks Queued" },
    };
    return indicators[status] || indicators.planned;
}

function getBacklinksStatusBadge(status?: string) {
    const styles: Record<string, { bg: string; text: string; label: string }> = {
        pending: { bg: "bg-gray-100", text: "text-gray-600", label: "Pending" },
        queued: { bg: "bg-green-50", text: "text-green-700", label: "Queued" },
        in_progress: { bg: "bg-green-100", text: "text-[#22C55E]", label: "In Progress" },
        completed: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Completed" },
    };
    return styles[status || 'pending'] || styles.pending;
}

function getInitials(title: string) {
    const words = title.trim().split(" ");
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return title.slice(0, 2).toUpperCase();
}

function formatDateLocal(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

function formatRelativeDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "today";
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 60) return "about 1 month ago";
    return `${Math.floor(diffDays / 30)} months ago`;
}

function getArticleTypeIcon(type: string) {
    const found = ARTICLE_TYPES.find(t => t.value === type);
    return found?.icon || "📝";
}

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        planned: "bg-green-50 text-green-700",
        generated: "bg-emerald-100 text-emerald-700",
        qa_validated: "bg-green-100 text-[#22C55E]",
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
        // Auto-generate the initial 30 articles after onboarding *once the user is subscribed*
        // (so the user never needs to click "Generate 30 Articles").
        // Only auto-run on the first post-onboarding visit
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

                // Only auto-generate after the paid tier (30 posts/month) is active
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
            // Fetch all articles to display in chronological order
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

    // Parse YouTube HTML comments in content
    const parseYouTubeShortcodes = (content: string): string => {
        if (!content) return content;
        // Parse HTML comments: <!-- YOUTUBE:id -->
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
                console.error("Generation failed:", data.error || "No job ID returned");
                const errorMsg = data.error || "Failed to start generation. Please try again.";

                if (startResponse.status === 403) {
                    toast.error(errorMsg, {
                        duration: 5000,
                        id: 'monthly-limit-error'
                    });
                } else {
                    toast.error(errorMsg);
                }

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
                    console.error("Generation failed:", status.error);
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
                const errorMsg = data.error || data.message || "Failed to generate article content";
                toast.error(`Error: ${errorMsg}`);
            }
        } catch (error) {
            console.error("Failed to generate article:", error);
            toast.error("A network error occurred. Please check your connection and try again.");
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

    const handleAddArticle = (date: Date) => {
        const dateStr = formatDateLocal(date);
        setSelectedDate(dateStr);
        setNewArticle({
            title: "",
            keyword: "",
            secondary_keywords: "",
            article_type: "guide",
            search_intent: "informational",
            word_count: "1500",
            cta_placement: "end",
        });
        setShowAddModal(true);
    }

    const clearFilters = () => {
        setSearchQuery("");
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.keyword?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const stats = {
        total: articles.length,
        planned: articles.filter(a => a.status === "planned").length,
        generated: articles.filter(a => a.status === "generated").length,
        published: articles.filter(a => a.status === "published").length,
    };

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
                            className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                        >
                            {generating ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <Sparkles className="h-4 w-4" />}
                            Generate 30 Articles
                        </Button>
                        <Button
                            onClick={() => setShowAutopilotModal(true)}
                            variant="outline"
                            className="gap-2 border-green-100 hover:bg-green-50"
                        >
                            <Zap className={cn("h-4 w-4", autopilotSettings.enabled && "text-[#22C55E]")} />
                            Autopilot {autopilotSettings.enabled ? "ON" : "OFF"}
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="space-y-12">
                        {/* Month Sections */}
                        {(() => {
                            const now = new Date();
                            now.setHours(0, 0, 0, 0); // Normalize 'now' to start of day
                            const currentMonthIdx = now.getMonth();
                            const currentYearIdx = now.getFullYear();

                            // Generate a list of months to show: from current month to 3 months ahead, 
                            // plus any months actually containing articles.
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

                            // Add remaining months that have articles
                            Array.from(articleMonths).forEach(key => {
                                const [m, y] = key.split('-').map(Number);
                                monthsToShow.push({ month: m, year: y });
                            });

                            // Sort months chronologically
                            monthsToShow.sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month));

                            return monthsToShow.map(({ month, year }) => {
                                const firstDayOfMonth = new Date(year, month, 1).getDay();
                                const startingPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;
                                const daysInMonth = new Date(year, month + 1, 0).getDate();

                                // Create all days for the month, including padding for the grid
                                const totalCells = Math.ceil((startingPadding + daysInMonth) / 7) * 7;
                                const days = Array.from({ length: totalCells }, (_, i) => {
                                    const dayOfMonth = i - startingPadding + 1;
                                    const isValidDay = dayOfMonth > 0 && dayOfMonth <= daysInMonth;
                                    const date = isValidDay ? new Date(year, month, dayOfMonth) : null;
                                    return { date, dayOfMonth, isValidDay };
                                });

                                // Break into weeks (chunks of 7)
                                const weeks = [];
                                for (let i = 0; i < days.length; i += 7) {
                                    weeks.push(days.slice(i, i + 7));
                                }

                                // Filter weeks: Keep if it has an article OR if it's not entirely in the past
                                const visibleWeeks = weeks.filter(week => {
                                    const hasArticle = week.some(d => {
                                        if (!d.isValidDay || !d.date) return false;
                                        const dateStr = formatDateLocal(d.date);
                                        return articles.some(a => a.scheduled_date === dateStr);
                                    });
                                    if (hasArticle) return true;

                                    // Check if any day in the week is today or in the future
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
                                        <h2 className="text-xl font-bold text-gray-900 mb-8 font-display">
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
                                                                    ? "bg-white border-gray-100 hover:border-green-200 hover:shadow-lg cursor-default"
                                                                    : "bg-white border-gray-50 cursor-default"
                                                                : "bg-gray-50/10 border-transparent"
                                                        )}
                                                        onClick={() => {
                                                            // Disabled: User wants interaction only via buttons
                                                            // if (!d.isValidDay || !d.date || dayArticles.length === 0) return;
                                                            // setSelectedArticle(dayArticles[0]);
                                                            // setShowArticleDetail(true);
                                                        }}
                                                    >
                                                        {d.isValidDay && d.date && (
                                                            <div className="flex flex-col h-full" style={{ fontFamily: 'Inter, sans-serif' }}>
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
                                                                                dayArticles[0].status === 'published' ? "bg-[#22C55E]" :
                                                                                    dayArticles[0].status === 'generated' ? "bg-emerald-500" : "bg-green-500"
                                                                            )} />
                                                                            <span className="text-[9px] font-bold text-gray-500 uppercase tracking-normal truncate">
                                                                                {getArticleTypeLabel(dayArticles[0].article_type)}: {dayArticles[0].search_intent.charAt(0).toUpperCase() + dayArticles[0].search_intent.slice(1)}
                                                                            </span>
                                                                        </div>

                                                                        <h3 className="text-[12px] font-semibold text-gray-900 leading-[1.4] mb-3 line-clamp-2 min-h-[2.8em] tracking-tight">
                                                                            {dayArticles[0].title}
                                                                        </h3>

                                                                        <div className="flex items-center gap-4 mt-auto pb-1">
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Volume</span>
                                                                                <span className="text-[11px] font-bold text-gray-700 leading-none tracking-tight">{dayArticles[0].volume || 0}</span>
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Difficulty</span>
                                                                                <span className="text-[11px] font-bold text-gray-700 leading-none tracking-tight">{dayArticles[0].difficulty || 0}</span>
                                                                            </div>
                                                                        </div>

                                                                        {isPastOrToday ? (
                                                                            (dayArticles[0].status === 'generated' || dayArticles[0].status === 'published') ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="secondary"
                                                                                    className="w-full h-8 mt-4 text-[10px] font-bold bg-[#22C55E] text-white hover:bg-[#16A34A] border border-transparent transition-all tracking-normal shadow-sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        router.push(`/dashboard/content/${dayArticles[0].id}`);
                                                                                    }}
                                                                                >
                                                                                    Visit Article
                                                                                </Button>
                                                                            ) : dayArticles[0].status === 'planned' ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="secondary"
                                                                                    disabled={generatingArticle === dayArticles[0].id}
                                                                                    className="w-full h-8 mt-4 text-[10px] font-bold bg-[#22C55E] text-white hover:bg-[#16A34A] border border-transparent transition-all tracking-normal shadow-sm"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        generateArticleContent(dayArticles[0].id);
                                                                                    }}
                                                                                >
                                                                                    {generatingArticle === dayArticles[0].id ? (
                                                                                        <>
                                                                                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                                            Generating...
                                                                                        </>
                                                                                    ) : (
                                                                                        "Create and Publish"
                                                                                    )}
                                                                                </Button>
                                                                            ) : dayArticles[0].status === 'generating' ? (
                                                                                <Button
                                                                                    size="sm"
                                                                                    variant="secondary"
                                                                                    disabled
                                                                                    className="w-full h-8 mt-4 text-[10px] font-bold bg-green-50 text-[#22C55E] border border-green-100 transition-all tracking-normal"
                                                                                >
                                                                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                                                                    Generating...
                                                                                </Button>
                                                                            ) : null
                                                                        ) : null}
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
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" className="gap-2">
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </Button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keyword
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Publish Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Backlinks Status
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            CMS Export / Edit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredArticles.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="flex flex-col items-center justify-center">
                                                    <FileText className="h-12 w-12 text-gray-300 mb-3" />
                                                    <p className="text-gray-500 font-medium">No articles found</p>
                                                    <p className="text-sm text-gray-400 mt-1">Create your first content plan to get started</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredArticles.map((article) => {
                                            const statusBadge = getStatusBadgeStyle(article.status);
                                            const backlinksStatusBadge = getBacklinksStatusBadge(article.backlinks_status);

                                            return (
                                                <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                            {article.title}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-teal-600 font-medium">
                                                            {article.keyword || "—"}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn("px-3 py-1 rounded-full text-xs font-medium", statusBadge.bg, statusBadge.text)}>
                                                            {statusBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-gray-500">
                                                        {new Date(article.scheduled_date).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn("px-3 py-1 rounded-full text-xs font-medium", backlinksStatusBadge.bg, backlinksStatusBadge.text)}>
                                                                {backlinksStatusBadge.label}
                                                            </span>
                                                            {article.backlinks_count ? (
                                                                <span className="text-xs text-gray-500">({article.backlinks_count})</span>
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            {article.cms_exports && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                                                                >
                                                                    <Download className="h-4 w-4" />
                                                                </Button>
                                                            )}
                                                            <Button
                                                                onClick={() => {
                                                                    setSelectedArticle(article);
                                                                    setShowArticleDetail(true);
                                                                }}
                                                                variant="ghost"
                                                                size="sm"
                                                                className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between text-sm text-gray-500">
                            <p>Showing {filteredArticles.length} of {articles.length} articles</p>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" disabled>Previous</Button>
                                <Button variant="outline" size="sm" disabled>Next</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Schedule Article</h3>
                                <p className="text-sm text-slate-500">For {selectedDate}</p>
                            </div>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Article Title *</label>
                                <Input
                                    value={newArticle.title}
                                    onChange={(e) => setNewArticle({ ...newArticle, title: e.target.value })}
                                    placeholder="e.g., 10 Best SEO Tips for 2025"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Keyword *</label>
                                <Input
                                    value={newArticle.keyword}
                                    onChange={(e) => setNewArticle({ ...newArticle, keyword: e.target.value })}
                                    placeholder="e.g., SEO tips"
                                    className="h-11"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">Secondary Keywords</label>
                                <Input
                                    value={newArticle.secondary_keywords}
                                    onChange={(e) => setNewArticle({ ...newArticle, secondary_keywords: e.target.value })}
                                    placeholder="Comma separated: SEO strategies, SEO guide, SEO best practices"
                                    className="h-11"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Article Type</label>
                                    <select
                                        value={newArticle.article_type}
                                        onChange={(e) => setNewArticle({ ...newArticle, article_type: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        {ARTICLE_TYPES.map(type => (
                                            <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Search Intent</label>
                                    <select
                                        value={newArticle.search_intent}
                                        onChange={(e) => setNewArticle({ ...newArticle, search_intent: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        {SEARCH_INTENTS.map(intent => (
                                            <option key={intent.value} value={intent.value}>{intent.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Word Count Target</label>
                                    <Input
                                        type="number"
                                        value={newArticle.word_count}
                                        onChange={(e) => setNewArticle({ ...newArticle, word_count: e.target.value })}
                                        placeholder="1500"
                                        className="h-11"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">CTA Placement</label>
                                    <select
                                        value={newArticle.cta_placement}
                                        onChange={(e) => setNewArticle({ ...newArticle, cta_placement: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                                    >
                                        <option value="beginning">Beginning</option>
                                        <option value="middle">Middle</option>
                                        <option value="end">End</option>
                                        <option value="both">Beginning & End</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1 h-11">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={saveArticle}
                                    disabled={!newArticle.title || !newArticle.keyword || saving}
                                    className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700"
                                >
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Schedule Article"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showArticleDetail && selectedArticle && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{getArticleTypeIcon(selectedArticle.article_type)}</span>
                                <div>
                                    <Input
                                        value={selectedArticle.title}
                                        onChange={(e) => setSelectedArticle({ ...selectedArticle, title: e.target.value })}
                                        className="text-lg font-bold mb-1"
                                    />
                                    <p className="text-sm text-slate-500">
                                        Scheduled: {new Date(selectedArticle.scheduled_date).toLocaleDateString()} • {selectedArticle.word_count || 1500} words
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn("px-3 py-1 rounded-full text-xs font-medium", getStatusColor(selectedArticle.status))}>
                                    {selectedArticle.status}
                                </span>
                                <button onClick={() => { setShowArticleDetail(false); setSelectedArticle(null); }} className="text-slate-400 hover:text-slate-600 ml-2">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 gap-6 mb-6">
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 mb-2">Primary Keyword</p>
                                    <Input
                                        value={selectedArticle.keyword || ""}
                                        onChange={(e) => setSelectedArticle({ ...selectedArticle, keyword: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 mb-2">Search Intent</p>
                                    <select
                                        value={selectedArticle.search_intent || "informational"}
                                        onChange={(e) => setSelectedArticle({ ...selectedArticle, search_intent: e.target.value })}
                                        className="w-full h-9 rounded-lg border border-slate-200 px-3 text-sm"
                                    >
                                        {SEARCH_INTENTS.map(intent => (
                                            <option key={intent.value} value={intent.value}>{intent.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 mb-2">Scheduled Date</p>
                                    <Input
                                        type="date"
                                        value={selectedArticle.scheduled_date}
                                        onChange={(e) => setSelectedArticle({ ...selectedArticle, scheduled_date: e.target.value })}
                                        className="h-9 text-sm"
                                    />
                                </div>
                            </div>

                            {selectedArticle.secondary_keywords?.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-sm font-medium text-slate-700 mb-2">Secondary Keywords</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedArticle.secondary_keywords.map((kw, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full bg-slate-100 text-sm text-slate-600">{kw}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedArticle.content ? (
                                <div className="space-y-6">
                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-slate-700">Meta Description</p>
                                            <button
                                                onClick={() => copyToClipboard(selectedArticle.meta_description, "meta")}
                                                className="text-slate-400 hover:text-emerald-500"
                                            >
                                                {copiedId === "meta" ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                            </button>
                                        </div>
                                        <p className="text-sm text-slate-600">{selectedArticle.meta_description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="rounded-xl border border-slate-200 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <LucideLink className="h-4 w-4 text-blue-500" />
                                                <p className="text-sm font-medium text-slate-700">Internal Links ({(selectedArticle.internal_links as { title: string; url: string }[])?.length || 0})</p>
                                            </div>
                                            <div className="space-y-2">
                                                {(selectedArticle.internal_links as { title: string; url: string }[])?.slice(0, 3).map((link, i) => (
                                                    <p key={i} className="text-xs text-slate-500 truncate">{link.title}</p>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="rounded-xl border border-slate-200 p-4">
                                            <div className="flex items-center gap-2 mb-3">
                                                <ExternalLink className="h-4 w-4 text-purple-500" />
                                                <p className="text-sm font-medium text-slate-700">External Links ({(selectedArticle.external_links as { source: string }[])?.length || 0})</p>
                                            </div>
                                            <div className="space-y-2">
                                                {(selectedArticle.external_links as { source: string }[])?.slice(0, 3).map((link, i) => (
                                                    <p key={i} className="text-xs text-slate-500 truncate">{link.source}</p>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <LucideImage className="h-4 w-4 text-amber-500" />
                                            <p className="text-sm font-medium text-slate-700">Images ({(selectedArticle.images as object[])?.length || 0})</p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {(selectedArticle.images as { url: string; alt: string }[])?.map((img, i) => (
                                                <img key={i} src={img.url} alt={img.alt} className="rounded-lg w-full h-16 object-cover bg-slate-100" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-sm font-medium text-slate-700">Article Content Preview</p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => copyToClipboard(selectedArticle.markdown_content, "markdown")}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200"
                                                >
                                                    {copiedId === "markdown" ? "Copied!" : "Copy Markdown"}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(selectedArticle.html_content, "html")}
                                                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200"
                                                >
                                                    {copiedId === "html" ? "Copied!" : "Copy HTML"}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto rounded-lg bg-white border border-slate-100 p-6 shadow-inner">
                                            <div className="article-preview-rendered prose prose-sm max-w-none" style={{ maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'break-word', overflow: 'hidden' }}>
                                                {selectedArticle.html_content ? (
                                                    <div dangerouslySetInnerHTML={{ __html: parseYouTubeShortcodes(selectedArticle.html_content) }} />
                                                ) : selectedArticle.content ? (
                                                    <div className="whitespace-pre-wrap font-sans text-sm text-slate-600" style={{ maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                                                        {selectedArticle.content}
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 italic">No content available.</p>
                                                )}
                                            </div>
                                        </div>
                                        <style jsx global>{`
                                            .article-preview-rendered { max-width: 100%; overflow-x: hidden; }
                                            .article-preview-rendered * { max-width: 100%; word-wrap: break-word; overflow-wrap: break-word; }
                                            .article-preview-rendered h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 1rem; color: #0f172a; }
                                            .article-preview-rendered h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.75rem; color: #0f172a; }
                                            .article-preview-rendered h3 { font-size: 1.125rem; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #0f172a; }
                                            .article-preview-rendered p { font-size: 0.875rem; line-height: 1.6; color: #475569; margin-bottom: 1rem; }
                                            .article-preview-rendered ul, .article-preview-rendered ol { margin-bottom: 1rem; padding-left: 1.25rem; font-size: 0.875rem; color: #475569; }
                                            .article-preview-rendered li { margin-bottom: 0.25rem; }
                                            .article-preview-rendered img { border-radius: 0.5rem; margin: 1rem 0; max-width: 100%; height: auto; }
                                            .article-preview-rendered a { color: #2563eb; text-decoration: underline; word-break: break-all; }
                                            .article-preview-rendered iframe { max-width: 100%; }
                                            .article-preview-rendered .video-container { max-width: 100%; }
                                        `}</style>
                                    </div>

                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Download className="h-4 w-4 text-emerald-600" />
                                            <p className="text-sm font-medium text-emerald-700">CMS Export Ready</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify((selectedArticle.cms_exports as { wordpress: object })?.wordpress, null, 2), "wp")}
                                                className="flex-1 rounded-lg bg-white border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-100"
                                            >
                                                {copiedId === "wp" ? "Copied!" : "WordPress Export"}
                                            </button>
                                            <button
                                                onClick={() => copyToClipboard(JSON.stringify((selectedArticle.cms_exports as { shopify: object })?.shopify, null, 2), "shopify")}
                                                className="flex-1 rounded-lg bg-white border border-emerald-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-100"
                                            >
                                                {copiedId === "shopify" ? "Copied!" : "Shopify Export"}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 rounded-xl bg-slate-50 border-2 border-dashed border-slate-200">
                                    <Sparkles className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-600 font-medium mb-2">Content not generated yet</p>
                                    <p className="text-sm text-slate-500 mb-6">Generate SEO-optimized content with internal links, images, and CMS exports</p>
                                    <Button
                                        onClick={() => generateArticleContent(selectedArticle.id)}
                                        disabled={generatingArticle === selectedArticle.id}
                                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                    >
                                        {generatingArticle === selectedArticle.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        Generate Article Content
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                            <button
                                onClick={() => deleteArticle(selectedArticle.id)}
                                className="flex items-center gap-2 text-red-500 hover:text-red-600 text-sm"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete
                            </button>
                            <div className="flex gap-3">
                                <Button
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`/api/articles/${selectedArticle.id}`, {
                                                method: "PATCH",
                                                headers: { "Content-Type": "application/json" },
                                                body: JSON.stringify({
                                                    title: selectedArticle.title,
                                                    keyword: selectedArticle.keyword,
                                                    search_intent: selectedArticle.search_intent,
                                                    scheduled_date: selectedArticle.scheduled_date,
                                                }),
                                            });
                                            if (response.ok) {
                                                await loadArticles();
                                                setShowArticleDetail(false);
                                            }
                                        } catch (error) {
                                            console.error("Failed to save article:", error);
                                        }
                                    }}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Changes
                                </Button>
                                {!selectedArticle.content && (
                                    <Button
                                        onClick={() => generateArticleContent(selectedArticle.id)}
                                        disabled={generatingArticle === selectedArticle.id}
                                        className="gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                    >
                                        {generatingArticle === selectedArticle.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Sparkles className="h-4 w-4" />
                                        )}
                                        Generate Content
                                    </Button>
                                )}
                                {selectedArticle.content && (
                                    <Button
                                        onClick={() => generateArticleContent(selectedArticle.id)}
                                        disabled={generatingArticle === selectedArticle.id}
                                        variant="outline"
                                        className="gap-2"
                                    >
                                        {generatingArticle === selectedArticle.id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <RefreshCw className="h-4 w-4" />
                                        )}
                                        Regenerate
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div >
                </div >
            )
            }

            {
                showAutopilotModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                                        <Zap className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">Autopilot Settings</h3>
                                        <p className="text-sm text-slate-500">Configure automatic content generation</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowAutopilotModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="space-y-5">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                                    <div>
                                        <p className="font-medium text-slate-900">Enable Autopilot</p>
                                        <p className="text-sm text-slate-500">Automatically generate content daily</p>
                                    </div>
                                    <button
                                        onClick={() => setAutopilotSettings({ ...autopilotSettings, enabled: !autopilotSettings.enabled })}
                                        className={cn(
                                            "relative w-12 h-6 rounded-full transition-colors",
                                            autopilotSettings.enabled ? "bg-emerald-500" : "bg-slate-300"
                                        )}
                                    >
                                        <span className={cn(
                                            "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                                            autopilotSettings.enabled ? "translate-x-7" : "translate-x-1"
                                        )} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Publish Time Start</label>
                                        <select
                                            value={autopilotSettings.publish_time_start}
                                            onChange={(e) => setAutopilotSettings({ ...autopilotSettings, publish_time_start: parseInt(e.target.value) })}
                                            className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00 UTC</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Publish Time End</label>
                                        <select
                                            value={autopilotSettings.publish_time_end}
                                            onChange={(e) => setAutopilotSettings({ ...autopilotSettings, publish_time_end: parseInt(e.target.value) })}
                                            className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                                        >
                                            {Array.from({ length: 24 }, (_, i) => (
                                                <option key={i} value={i}>{i.toString().padStart(2, "0")}:00 UTC</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Articles Per Day</label>
                                    <select
                                        value={autopilotSettings.articles_per_day}
                                        onChange={(e) => setAutopilotSettings({ ...autopilotSettings, articles_per_day: parseInt(e.target.value) })}
                                        className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                                    >
                                        <option value={1}>1 article per day</option>
                                        <option value={2}>2 articles per day</option>
                                        <option value={3}>3 articles per day</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Writing Tone</label>
                                    <select
                                        value={autopilotSettings.tone}
                                        onChange={(e) => setAutopilotSettings({ ...autopilotSettings, tone: e.target.value })}
                                        className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm"
                                    >
                                        <option value="natural">Natural & Human</option>
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual & Friendly</option>
                                        <option value="authoritative">Authoritative</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">CMS Targets</label>
                                    <div className="flex gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autopilotSettings.cms_targets.includes("wordpress")}
                                                onChange={(e) => {
                                                    const targets = e.target.checked
                                                        ? [...autopilotSettings.cms_targets, "wordpress"]
                                                        : autopilotSettings.cms_targets.filter(t => t !== "wordpress");
                                                    setAutopilotSettings({ ...autopilotSettings, cms_targets: targets });
                                                }}
                                                className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-slate-700">WordPress</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={autopilotSettings.cms_targets.includes("shopify")}
                                                onChange={(e) => {
                                                    const targets = e.target.checked
                                                        ? [...autopilotSettings.cms_targets, "shopify"]
                                                        : autopilotSettings.cms_targets.filter(t => t !== "shopify");
                                                    setAutopilotSettings({ ...autopilotSettings, cms_targets: targets });
                                                }}
                                                className="rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-slate-700">Shopify</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button variant="outline" onClick={() => setShowAutopilotModal(false)} className="flex-1 h-11">
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={saveAutopilotSettings}
                                        className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 text-white"
                                    >
                                        Save Settings
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {
                showWelcomeModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                        {welcomeStep === "loading" ? (
                            <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
                                <Loader2 className="h-12 w-12 animate-spin text-emerald-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Creating Content Strategy</h3>
                                <p className="text-sm text-slate-500">Analyzing your niche and generating a 30-day plan...</p>
                            </div>
                        ) : (
                            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
                                <div className="text-center mb-6">
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto mb-4">
                                        <Sparkles className="h-8 w-8 text-emerald-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">Your 1-month Content Strategy is ready!</h3>
                                    <p className="text-sm text-slate-500">We&apos;ve generated high-impact article ideas for you.</p>
                                </div>
                                <div className="space-y-4 mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <p className="text-sm text-slate-700">30 SEO-optimized article topics</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <p className="text-sm text-slate-700">Autopilot enabled for daily publishing</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                        <p className="text-sm text-slate-700">Keywords and search intent analysis</p>
                                    </div>
                                </div>
                                <Button onClick={handleCloseWelcome} className="w-full h-12 text-base font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25">
                                    Let&apos;s Go!
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }
        </div >
    );
}

function getClusterColorClass(clusterName: string | null | undefined): string {
    if (!clusterName) return "bg-slate-200";

    const colors = [
        "bg-blue-500",
        "bg-purple-500",
        "bg-emerald-500",
        "bg-amber-500",
        "bg-rose-500",
        "bg-indigo-500",
        "bg-teal-500",
    ];

    // Hash function to pick a stable color for a cluster name
    let hash = 0;
    for (let i = 0; i < clusterName.length; i++) {
        hash = clusterName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}
