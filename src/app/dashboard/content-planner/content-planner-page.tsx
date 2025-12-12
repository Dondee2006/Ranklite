"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    Sparkles,
    Plus,
    ChevronLeft,
    ChevronRight,
    Loader2,
    X,
    Settings,
    Calendar,
    FileText,
    Zap,
    Edit3,
    Trash2,
    Eye,
    Download,
    RefreshCw,
    GripVertical,
    Target,
    Clock,
    BarChart3,
    ExternalLink,
    Link,
    Image,
    Copy,
    Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSearchParams, useRouter } from "next/navigation";

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

function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
}

function getWeekdayLabel(year: number, month: number, day: number) {
    return new Date(year, month, day).toLocaleDateString("en-US", { weekday: "short" });
}

function getArticleTypeLabel(type: string) {
    const found = ARTICLE_TYPES.find(t => t.value === type);
    return found?.label || "Article";
}

function getArticleTone(status: string) {
    const tones: Record<string, string> = {
        published: "bg-gradient-to-b from-[#f1e9ff] to-white border-purple-200",
        generated: "bg-gradient-to-b from-[#f1e9ff] to-white border-purple-200",
        scheduled: "bg-gradient-to-b from-[#f1e9ff] to-white border-purple-200",
        planned: "bg-slate-50 border-slate-200",
        draft: "bg-slate-50 border-slate-200",
    };
    return tones[status] || tones.planned;
}

function getStatusColor(status: string) {
    const colors: Record<string, string> = {
        planned: "bg-gray-100 text-gray-700",
        scheduled: "bg-blue-100 text-blue-700",
        generated: "bg-amber-100 text-amber-700",
        published: "bg-green-100 text-green-700",
        draft: "bg-slate-100 text-slate-600",
    };
    return colors[status] || colors.draft;
}

function getArticleTypeIcon(type: string) {
    const found = ARTICLE_TYPES.find(t => t.value === type);
    return found?.icon || "📄";
}

function getArticlePreview(article: Article) {
    const source = article.meta_description || article.markdown_content || article.content || "";
    return source.replace(/[#*]/g, "").slice(0, 140);
}

export default function ContentPlannerPage() {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
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
        enabled: false,
        publish_time_start: 7,
        publish_time_end: 9,
        timezone: "UTC",
        articles_per_day: 1,
        preferred_article_types: [],
        tone: "natural",
        cms_targets: [],
    });
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const autopilotRunLock = useRef(false);

    // Welcome Modal State
    const searchParams = useSearchParams();
    const router = useRouter();
    const [showWelcomeModal, setShowWelcomeModal] = useState(false);
    const [welcomeStep, setWelcomeStep] = useState<"loading" | "success">("loading");

    useEffect(() => {
        if (searchParams.get("welcome") === "true") {
            setShowWelcomeModal(true);
            // Simulate loading delay for effect
            const timer = setTimeout(() => {
                setWelcomeStep("success");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    const handleCloseWelcome = () => {
        setShowWelcomeModal(false);
        router.replace("/dashboard/content-planner");
    };

    const loadArticles = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/articles?month=${currentMonth}&year=${currentYear}`);
            const data = await response.json();
            setArticles(data.articles || []);
        } catch (error) {
            console.error("Failed to load articles:", error);
        } finally {
            setLoading(false);
        }
    }, [currentMonth, currentYear]);

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
            const response = await fetch("/api/content-calendar/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    month: currentMonth,
                    year: currentYear,
                }),
            });
            const data = await response.json();
            if (data.success) {
                await loadArticles();
            }
        } catch (error) {
            console.error("Failed to generate calendar:", error);
        } finally {
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
            if (data.article) {
                setArticles(prev => prev.map(a => a.id === articleId ? data.article : a));
                if (selectedArticle?.id === articleId) {
                    setSelectedArticle(data.article);
                }
            }
        } catch (error) {
            console.error("Failed to generate article:", error);
        } finally {
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
                loadArticles();
            }
        } catch (error) {
            console.error("Failed to save article:", error);
        } finally {
            setSaving(false);
        }
    }

    async function updateArticle(articleId: string, updates: Partial<Article>) {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates),
            });
            if (response.ok) {
                loadArticles();
            }
        } catch (error) {
            console.error("Failed to update article:", error);
        }
    }

    async function deleteArticle(articleId: string) {
        try {
            const response = await fetch(`/api/articles/${articleId}`, {
                method: "DELETE",
            });
            if (response.ok) {
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
                setShowAutopilotModal(false);
            }
        } catch (error) {
            console.error("Failed to save autopilot settings:", error);
        }
    }

    function copyToClipboard(text: string, id: string) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    const plannerStartDay = today.getFullYear() === currentYear && today.getMonth() === currentMonth
        ? today.getDate()
        : 1;
    const plannerStart = new Date(currentYear, currentMonth, plannerStartDay);
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const todayKey = new Date().toISOString().split("T")[0];

    const totalPlannerDays = Math.max(0, daysInMonth - plannerStartDay + 1);
    const plannerDays = Array.from({ length: totalPlannerDays }, (_, i) => {
        const date = new Date(plannerStart);
        date.setDate(plannerStart.getDate() + i);
        return date;
    });

    const weeks: Date[][] = [];
    for (let i = 0; i < plannerDays.length; i += 5) {
        weeks.push(plannerDays.slice(i, i + 5));
    }

    const formatDateKey = (date: Date) => date.toISOString().split("T")[0];

    const getArticlesForDate = (date: Date) => {
        const dateStr = formatDateKey(date);
        return articles.filter(a => a.scheduled_date === dateStr);
    };

    const handleAddArticle = (date: Date) => {
        const dateStr = formatDateKey(date);
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
    };

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const stats = {
        total: articles.length,
        planned: articles.filter(a => a.status === "planned").length,
        generated: articles.filter(a => a.status === "generated").length,
        published: articles.filter(a => a.status === "published").length,
    };

    return (
        <div className="min-h-screen bg-white">
            <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl px-8 py-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25">
                            <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                                SEO Content Planner
                            </h1>
                            <p className="text-sm text-slate-500">Autopilot SEO Engine • Daily Content Generation</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowAutopilotModal(true)}
                            className={cn(
                                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                                autopilotSettings.enabled
                                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25"
                                    : "border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:bg-emerald-50"
                            )}
                        >
                            <Zap className={cn("h-4 w-4", autopilotSettings.enabled && "animate-pulse")} />
                            Autopilot {autopilotSettings.enabled ? "ON" : "OFF"}
                        </button>
                        <Button
                            onClick={generateMonthlyCalendar}
                            disabled={generating}
                            className="gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2.5 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all"
                        >
                            {generating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Sparkles className="h-4 w-4" />
                            )}
                            Generate 30-Day Plan
                        </Button>
                    </div>
                </div>
            </header>

            <div className="p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                                <FileText className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
                                <p className="text-sm text-slate-500">Total Articles</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                                <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stats.planned}</p>
                                <p className="text-sm text-slate-500">Planned</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
                                <RefreshCw className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stats.generated}</p>
                                <p className="text-sm text-slate-500">Generated</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100">
                                <Check className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-slate-900">{stats.published}</p>
                                <p className="text-sm text-slate-500">Published</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={prevMonth}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-display)" }}>
                        {MONTHS[currentMonth]} {currentYear}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                    {loading && <Loader2 className="h-5 w-5 animate-spin text-emerald-500" />}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
                    <div className="space-y-3 w-full">
                        {weeks.map((week, weekIndex) => {
                            return (
                                <div key={weekIndex} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {week.map((day, dayIndex) => {
                                        const dayKey = formatDateKey(day);
                                        const isToday = dayKey === todayKey;
                                        const dayArticles = getArticlesForDate(day);
                                        const primaryArticle = dayArticles[0];
                                        const weekday = getWeekdayLabel(day.getFullYear(), day.getMonth(), day.getDate());

                                        return (
                                            <div
                                                key={dayIndex}
                                                className={cn(
                                                    "min-h-[260px] rounded-2xl border p-3 shadow-sm transition-all overflow-hidden",
                                                    "bg-white border-slate-200",
                                                    isToday && "ring-2 ring-purple-200"
                                                )}
                                            >
                                                <div className="flex h-full flex-col gap-3">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xl font-bold text-slate-900">{day.getDate()}</span>
                                                        <span className="text-xs font-semibold text-purple-500">{weekday}</span>
                                                    </div>
                                                    {primaryArticle ? (
                                                        <div
                                                            onClick={() => { setSelectedArticle(primaryArticle); setShowArticleDetail(true); }}
                                                            className={cn(
                                                                "mt-1 flex flex-1 flex-col rounded-xl border px-3 py-3 text-left shadow-sm transition-all hover:-translate-y-0.5 overflow-hidden",
                                                                getArticleTone(primaryArticle.status)
                                                            )}
                                                        >
                                                            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-purple-700">
                                                                <span className="h-2 w-2 rounded-full bg-purple-500" />
                                                                <span>{getArticleTypeLabel(primaryArticle.article_type)}</span>
                                                                {primaryArticle.search_intent && (
                                                                    <span className="text-slate-500">· {primaryArticle.search_intent.replace("-", " ")}</span>
                                                                )}
                                                            </div>
                                                            {primaryArticle.keyword && (
                                                                <div className="mt-2 inline-flex max-w-full items-center">
                                                                    <span className="truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
                                                                        {primaryArticle.keyword}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            <p className="mt-3 line-clamp-3 text-base font-semibold leading-tight text-slate-900">
                                                                {primaryArticle.title}
                                                            </p>
                                                            <div className="mt-3 space-y-1 text-xs text-slate-700">
                                                                <p>Volume: {primaryArticle.volume ?? "–"}</p>
                                                                <p>Difficulty: {primaryArticle.difficulty ?? "–"}</p>
                                                            </div>
                                                            <div className="mt-auto pt-3">
                                                                <Button
                                                                    size="sm"
                                                                    className="w-full justify-center rounded-lg bg-gradient-to-b from-slate-900 to-slate-800 text-sm font-semibold text-white shadow"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setSelectedArticle(primaryArticle);
                                                                        setShowArticleDetail(true);
                                                                    }}
                                                                >
                                                                    Visit Article
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleAddArticle(day)}
                                                            className="mt-1 flex min-h-[140px] flex-1 w-full items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-400 hover:border-purple-200 hover:text-purple-500 hover:bg-purple-50/40"
                                                        >
                                                            Add article
                                                        </button>
                                                    )}
                                                    {dayArticles.length > 1 && (
                                                        <p className="text-xs font-semibold text-slate-500">+{dayArticles.length - 1} more</p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
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
                                    <h3 className="text-lg font-bold text-slate-900">{selectedArticle.title}</h3>
                                    <p className="text-sm text-slate-500">
                                        {selectedArticle.scheduled_date} • {selectedArticle.word_count || 1500} words target
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
                                    <p className="text-xs text-slate-500 mb-1">Primary Keyword</p>
                                    <p className="font-semibold text-slate-900">{selectedArticle.keyword || "Not set"}</p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 mb-1">Search Intent</p>
                                    <span className={cn("px-2 py-0.5 rounded text-xs font-medium",
                                        SEARCH_INTENTS.find(i => i.value === selectedArticle.search_intent)?.color || "bg-gray-100 text-gray-700"
                                    )}>
                                        {selectedArticle.search_intent || "informational"}
                                    </span>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <p className="text-xs text-slate-500 mb-1">Article Type</p>
                                    <p className="font-semibold text-slate-900 capitalize">{selectedArticle.article_type?.replace("-", " ") || "Guide"}</p>
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
                                                <Link className="h-4 w-4 text-blue-500" />
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
                                            <Image className="h-4 w-4 text-amber-500" />
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
                                        <div className="max-h-60 overflow-y-auto rounded-lg bg-slate-50 p-4">
                                            <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono">
                                                {selectedArticle.content?.slice(0, 2000)}...
                                            </pre>
                                        </div>
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
                    </div>
                </div>
            )}

            {showAutopilotModal && (
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
            )}

            {showWelcomeModal && (
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
                                <p className="text-sm text-slate-500">We've generated high-impact article ideas for you.</p>
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
                                Let's Go!
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
