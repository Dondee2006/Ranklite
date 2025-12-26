"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Info,
  Lightbulb,
  Layers,
  List,
  CheckCircle2,
  Link2,
  Globe,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Loader2,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Settings,
  Zap,
  Pause,
  Play,
  ClipboardList,
  X,
  Save,
  Clock,
  ShieldCheck,
  Cpu,
  Fingerprint,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Backlink {
  id: string;
  source_name: string;
  source_domain: string;
  linking_url: string;
  traffic: string;
  domain_rating: number;
  date_added: string;
  status: string;
  verification_status?: string;
  is_dofollow?: boolean;
  tier?: number;
  is_indexed?: boolean;
  article_id?: string;
  article_title?: string;
  adapted_type?: string;
}

const PLATFORM_LOGOS: Record<string, string> = {
  "techpluto.com": "https://www.techpluto.com/wp-content/uploads/2016/09/Tech_Pluto_Logo.png",
  "sayellow.com": "https://www.sayellow.com/images/logo.png",
  "substack.com": "https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack.com%2Fimg%2Fsubstack.png",
  "coursera.org": "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera_assets.s3.amazonaws.com/images/fff9c12e-d0c1-4e41-88ea-e1c51fb609e5.png",
  "anyflip.com": "https://online.anyflip.com/images/logo.png",
  "medium.com": "https://cdn-static-1.medium.com/_/fp/icons/Medium-Avatar-500x500.svg",
  "locable.com": "https://www.locable.com/assets/locable-logo-6c3d4f3d3e6e87e76c9c9e42b3a21d0b4b8b1b8b7a5e5e5e5e5e5e5e5e5e5e5.png",
  "alltopstartups.com": "https://alltopstartups.com/wp-content/uploads/2018/05/all-top-startups-logo.png",
  "clickup.com": "https://clickup.com/landing/images/clickup-logo-gradient.png",
};

interface Campaign {
  status: string;
  agent_status: string;
  current_step: string | null;
  total_backlinks: number;
  unique_sources: number;
  avg_domain_rating: number;
  this_month_backlinks: number;
  website_url: string | null;
  last_scan_at: string | null;
  next_scan_at: string | null;
  is_paused: boolean;
  pending_tasks: number;
  manual_review_count: number;
  failed_tasks: number;
  daily_submission_count: number;
  max_daily_submissions: number;
  min_domain_rating?: number;
}

interface Stats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  require_manual: number;
  blocked: number;
}

interface SiteSettings {
  name: string;
  url: string;
}

const AGENT_STEPS = [
  { id: 1, text: "Tiered Architecture Setup", description: "Structuring multi-layer buffers (T1, T2, T3) for maximum authority" },
  { id: 2, text: "Contextual Adaptation", description: "AI rewriting content for syndication and parasite platforms" },
  { id: 3, text: "Anchor Optimization", description: "Balancing branded, keyword, and naked URL distribution" },
  { id: 4, text: "Smart Submission", description: "Automated placement via secure APIs and cloud browser nodes" },
  { id: 5, text: "Indexation Pushing", description: "Forcing search engine discovery via premium indexing signals" },
  { id: 6, text: "Profile Health Check", description: "Monitoring persistence, metrics, and toxic link prevention" },
];

function getDRColor(dr: number) {
  if (dr >= 90) return "bg-emerald-500";
  if (dr >= 70) return "bg-green-500";
  if (dr >= 50) return "bg-yellow-500";
  if (dr >= 30) return "bg-orange-500";
  return "bg-red-500";
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}

function SiteLogo({ domain, name, size = 24, className }: { domain: string; name: string; size?: number; className?: string }) {
  const [imgError, setImgError] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  
  if (!domain) return (
    <div 
      className={cn("flex items-center justify-center rounded-lg bg-gray-100 text-gray-400 font-bold text-sm", className)}
      style={{ width: size + 8, height: size + 8 }}
    >
      ?
    </div>
  );

  const cleanDomain = domain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  const baseDomain = cleanDomain.split('.').slice(-2).join('.');
  const knownLogo = PLATFORM_LOGOS[baseDomain] || PLATFORM_LOGOS[cleanDomain];
  const logoDevToken = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;
  const logoSources = [
    knownLogo,
    logoDevToken ? `https://img.logo.dev/${cleanDomain}?token=${logoDevToken}&size=80&format=png` : `https://img.logo.dev/${cleanDomain}?size=80&format=png`,
    `https://www.google.com/s2/favicons?domain=${cleanDomain}&sz=128`,
  ].filter(Boolean) as string[];
  
  const colors = [
    "from-[#8B5CF6] to-[#7C3AED]",
    "from-[#22C55E] to-[#16A34A]",
    "from-[#3B82F6] to-[#2563EB]",
    "from-[#F59E0B] to-[#D97706]",
    "from-[#EF4444] to-[#DC2626]",
    "from-[#EC4899] to-[#DB2777]",
  ];
  
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
  
  if (imgError || logoSources.length === 0) {
    return (
      <div 
        className={cn(`flex items-center justify-center rounded-lg bg-gradient-to-br ${colors[colorIndex]} text-white font-bold text-sm`, className)}
        style={{ width: size + 8, height: size + 8 }}
      >
        {name ? name.charAt(0).toUpperCase() : "?"}
      </div>
    );
  }

  return (
    <div 
      className={cn("rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden p-1", className)}
      style={{ width: size + 8, height: size + 8 }}
    >
      <img
        src={logoSources[sourceIndex]}
        alt={name || "Site logo"}
        width={size}
        height={size}
        className="object-contain"
        onError={() => {
          if (sourceIndex < logoSources.length - 1) {
            setSourceIndex(sourceIndex + 1);
          } else {
            setImgError(true);
          }
        }}
        loading="lazy"
      />
    </div>
  );
}

export default function BacklinkGeneratorPage() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [newBacklinkNotification, setNewBacklinkNotification] = useState<Backlink | null>(null);
  const [filterDR, setFilterDR] = useState<number | null>(null);
  const [togglingPause, setTogglingPause] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    website_url: "",
    min_domain_rating: 50,
    max_daily_submissions: 10,
    risk_level: "Balanced",
    branded_terms: "",
    keywords: "",
  });

  const [indexationStats, setIndexationStats] = useState({ rate: 0, indexed: 0, total: 0 });
  const [viewMode, setViewMode] = useState<'agent' | 'list'>('agent');
  const [showGuide, setShowGuide] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const loadBacklinks = useCallback(async () => {
    try {
      const [backlinksRes, campaignRes, settingsRes] = await Promise.all([
        fetch("/api/backlinks"),
        fetch("/api/backlinks/campaign"),
        fetch("/api/settings"),
      ]);
      const backlinksData = await backlinksRes.json();
      const campaignData = await campaignRes.json();
      const settingsData = await settingsRes.json();
      
      setBacklinks(backlinksData.backlinks || []);
      setCampaign(backlinksData.campaign || campaignData.campaign);
      setStats(campaignData.stats);
      setSiteSettings(settingsData.settings);
      
      if (campaignData.indexation) {
        setIndexationStats(campaignData.indexation);
      }
    } catch (error) {
      console.error("Failed to load backlinks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const runAgentStep = useCallback(async () => {
    if (agentRunning || campaign?.is_paused) return;
    setAgentRunning(true);
    try {
      const response = await fetch("/api/backlinks/agent", { method: "POST" });
      if (response.ok) {
        const data = await response.json();
        if (data.newBacklink) {
          setNewBacklinkNotification(data.newBacklink);
          setTimeout(() => setNewBacklinkNotification(null), 5000);
        }
        await loadBacklinks();
      }
    } catch (error) {
      console.error("Agent step failed:", error);
    } finally {
      setAgentRunning(false);
    }
  }, [agentRunning, campaign?.is_paused, loadBacklinks]);

  const togglePause = useCallback(async () => {
    if (!campaign) return;
    setTogglingPause(true);
    try {
      const response = await fetch("/api/backlinks/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_paused: !campaign.is_paused }),
      });
      if (!response.ok) throw new Error("Failed to toggle pause");
      await loadBacklinks();
    } catch (error) {
      console.error("Failed to toggle pause:", error);
    } finally {
      setTogglingPause(false);
    }
  }, [campaign, loadBacklinks]);

  const saveSettings = useCallback(async () => {
    setSavingSettings(true);
    try {
      const response = await fetch("/api/backlinks/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          min_domain_rating: settingsForm.min_domain_rating,
          max_daily_submissions: settingsForm.max_daily_submissions,
          risk_level: settingsForm.risk_level,
          branded_terms: settingsForm.branded_terms.split(",").map(t => t.trim()).filter(Boolean),
          keywords: settingsForm.keywords.split(",").map(k => k.trim()).filter(Boolean),
        }),
      });
      if (!response.ok) throw new Error("Failed to save settings");
      await loadBacklinks();
      setShowSettings(false);
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  }, [settingsForm, loadBacklinks]);

  useEffect(() => {
    loadBacklinks();
  }, [loadBacklinks]);

  useEffect(() => {
    if (campaign) {
      setSettingsForm({
        website_url: campaign.website_url || "",
        min_domain_rating: campaign.min_domain_rating || 50,
        max_daily_submissions: campaign.max_daily_submissions || 10,
        risk_level: (campaign as any).risk_level || "Balanced",
        branded_terms: ((campaign as any).branded_terms || []).join(", "),
        keywords: ((campaign as any).keywords || []).join(", "),
      });
    }
  }, [campaign]);

  useEffect(() => {
    if (!campaign?.is_paused && (campaign?.agent_status === "scanning" || campaign?.status === "active")) {
      const interval = setInterval(runAgentStep, 15000); 
      return () => clearInterval(interval);
    }
  }, [campaign?.agent_status, campaign?.status, campaign?.is_paused, runAgentStep]);

  const currentStepIndex = campaign?.current_step 
    ? AGENT_STEPS.findIndex(s => s.text === campaign.current_step) 
    : 0;

  const filteredBacklinks = backlinks.filter(b => {
    if (filterDR && b.domain_rating < filterDR) return false;
    return true;
  });

  const chartData = [
    { month: "Jun", value: Math.max(0, (campaign?.total_backlinks || 0) - 20) },
    { month: "Jul", value: Math.max(0, (campaign?.total_backlinks || 0) - 15) },
    { month: "Aug", value: Math.max(0, (campaign?.total_backlinks || 0) - 12) },
    { month: "Sep", value: Math.max(0, (campaign?.total_backlinks || 0) - 8) },
    { month: "Oct", value: Math.max(0, (campaign?.total_backlinks || 0) - 5) },
    { month: "Nov", value: Math.max(0, (campaign?.total_backlinks || 0) - 2) },
    { month: "Dec", value: campaign?.total_backlinks || 0 },
  ];
  const maxValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {newBacklinkNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="rounded-xl border border-[#E5E5E5] bg-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-[#1A1A1A]">New Backlink Earned!</p>
                <p className="text-sm text-[#6B7280]">{newBacklinkNotification.source_name} • DR {newBacklinkNotification.domain_rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-[#E5E5E5] bg-white px-4 sm:px-8 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">
                Backlink Autopilot
              </h1>
            {campaign?.is_paused ? (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-yellow-50 px-2 py-0.5 text-xs font-medium text-yellow-700 border border-yellow-200">
                <Pause className="h-3 w-3" />
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#2563EB] border border-blue-100">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2563EB] animate-pulse" />
                Live Agent Active
              </span>
            )}
          </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-[#F3F4F6] p-1 rounded-lg mr-2">
                <button
                  onClick={() => setViewMode('agent')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === 'agent' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
                  )}
                >
                  <Cpu className="h-3.5 w-3.5" />
                  Agent Monitor
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === 'list' ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280] hover:text-[#1A1A1A]"
                  )}
                >
                  <List className="h-3.5 w-3.5" />
                  Earned Links
                </button>
              </div>
              <button
                onClick={togglePause}
                disabled={togglingPause}
                className={cn(
                  "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-all shadow-sm",
                  campaign?.is_paused
                    ? "border-green-200 bg-white text-green-700 hover:bg-green-50"
                    : "border-yellow-200 bg-white text-yellow-700 hover:bg-yellow-50"
                )}
              >
                {togglingPause ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : campaign?.is_paused ? (
                  <Play className="h-4 w-4" />
                ) : (
                  <Pause className="h-4 w-4" />
                )}
                {campaign?.is_paused ? "Resume" : "Pause"}
              </button>
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="flex items-center gap-1.5 rounded-md border border-[#E5E5E5] bg-white px-3 py-1.5 text-sm font-medium text-[#6B7280] hover:bg-[#F9FAFB] transition-all shadow-sm"
              >
                <Settings className="h-4 w-4" />
                Campaign Config
              </button>
            </div>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        <div className="flex flex-col gap-6">
          {showGuide && (
            <div className="relative rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-8 shadow-sm overflow-hidden group">
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={() => setShowGuide(false)}
                  className="text-[#6B7280] hover:text-[#1A1A1A] transition-colors p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2563EB] text-white shadow-lg shadow-blue-200 shrink-0">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-[#1A1A1A] mb-2 flex items-center gap-2">
                    How Backlink Autopilot works
                    <span className="text-[10px] uppercase tracking-widest bg-blue-100 text-[#2563EB] px-2 py-0.5 rounded-full font-bold">New Engine</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] text-sm font-bold shrink-0">01</div>
                      <div>
                        <p className="font-bold text-[#1A1A1A] text-sm">Multi-Tier Protection</p>
                        <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                          We build a powerful buffer of high-DR Tier 1 links, boosted by automated Tier 2 and Tier 3 layers to create massive authority while keeping your main site safe.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] text-sm font-bold shrink-0">02</div>
                      <div>
                        <p className="font-bold text-[#1A1A1A] text-sm">Contextual Content Intelligence</p>
                        <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                          Our AI adapts your articles into specialized formats for syndication, parasite SEO (Medium, Substack), and niche micro-platforms to maintain relevance.
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-[#2563EB] text-sm font-bold shrink-0">03</div>
                      <div>
                        <p className="font-bold text-[#1A1A1A] text-sm">Proactive Indexation Pushing</p>
                        <p className="text-xs text-[#6B7280] mt-1.5 leading-relaxed">
                          Links are useless if not indexed. We continuously monitor live status and use premium signals to force search engine discovery for every earned link.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewMode === 'agent' ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Total Backlinks</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{campaign?.total_backlinks || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Unique Sources</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{campaign?.unique_sources || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Avg. DR</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{campaign?.avg_domain_rating || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Index Rate</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{Math.round(indexationStats.rate)}%</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-[#E5E5E5] bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">This Month</p>
                      <p className="text-2xl font-bold text-[#1A1A1A]">{campaign?.this_month_backlinks || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-8 shadow-sm">
                <div className="mb-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-[#1A1A1A]">Tiered Acquisition Engine</h3>
                    <p className="text-sm text-[#6B7280]">Current authority structure for {siteSettings?.name || "your website"}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#6B7280]">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200" />
                      <span>Tier 1 (Target)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-purple-500 shadow-sm shadow-purple-200" />
                      <span>Tier 2 (Buffer)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gray-300 shadow-sm" />
                      <span>Tier 3 (Discovery)</span>
                    </div>
                  </div>
                </div>

                <div className="relative flex flex-col items-center justify-center py-20 min-h-[600px] overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent opacity-60" />
                  
                  <div className="relative z-30 flex flex-col items-center group">
                    <div className="absolute -inset-4 bg-blue-500/10 rounded-full blur-xl group-hover:bg-blue-500/20 transition-all duration-700" />
                    <SiteLogo 
                      domain={siteSettings?.url || ""} 
                      name={siteSettings?.name || ""} 
                      size={60} 
                      className="relative z-30 h-24 w-24 rounded-3xl bg-white border-4 border-blue-500 shadow-2xl shadow-blue-200 transform group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="mt-4 px-4 py-1 rounded-full bg-[#1A1A1A] text-white text-xs font-bold shadow-lg">
                      {siteSettings?.name || "Your Website"}
                    </div>
                  </div>

                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    <div className="h-[320px] w-[320px] rounded-full border-2 border-dashed border-purple-200 animate-[spin_60s_linear_infinite]" />
                  </div>
                  <div className="absolute inset-0 z-5 flex items-center justify-center">
                    <div className="h-[480px] w-[480px] rounded-full border border-gray-100" />
                  </div>

                  <div className="absolute inset-0 z-20 flex items-center justify-center">
                    {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                      <div 
                        key={deg}
                        className="absolute h-12 w-12 rounded-2xl bg-white border-2 border-purple-500 text-purple-600 flex items-center justify-center shadow-xl transform hover:scale-110 transition-all duration-300 cursor-help group/node"
                        style={{ transform: `rotate(${deg}deg) translate(160px) rotate(-${deg}deg)` }}
                      >
                        <Layers className="h-6 w-6" />
                        <div className="absolute -bottom-10 opacity-0 group-hover/node:opacity-100 transition-opacity bg-white border border-[#E5E5E5] px-2 py-1 rounded shadow-sm whitespace-nowrap text-[10px] font-bold text-[#1A1A1A]">
                          Tier 2 Contextual
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="absolute inset-0 z-10 flex items-center justify-center">
                    {[30, 90, 150, 210, 270, 330].map((deg) => (
                      <div 
                        key={deg}
                        className="absolute h-8 w-8 rounded-xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center shadow-md transform hover:scale-110 transition-all duration-300"
                        style={{ transform: `rotate(${deg}deg) translate(240px) rotate(-${deg}deg)` }}
                      >
                        <Zap className="h-4 w-4" />
                      </div>
                    ))}
                  </div>

                  <div className="absolute top-10 right-20 animate-bounce delay-75">
                    <Sparkles className="h-5 w-5 text-yellow-400 opacity-50" />
                  </div>
                  <div className="absolute bottom-20 left-10 animate-pulse">
                    <TrendingUp className="h-6 w-6 text-green-400 opacity-50" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-sm">
                  <div className="mb-8 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#1A1A1A]">Live Agent Execution</h3>
                      <p className="text-sm text-[#6B7280]">Real-time background operations</p>
                    </div>
                    {agentRunning && (
                      <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-[10px] font-bold text-[#2563EB] uppercase tracking-wider animate-pulse border border-blue-100">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Syncing with network...
                      </div>
                    )}
                  </div>

                  <div className="space-y-6">
                    {AGENT_STEPS.map((step, index) => {
                      const isCompleted = index < currentStepIndex;
                      const isCurrent = index === currentStepIndex;
                      return (
                        <div key={step.id} className="flex gap-5 group">
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-xl border-2 transition-all duration-500 shadow-sm",
                              isCompleted ? "border-[#22C55E] bg-[#22C55E] text-white" : 
                              isCurrent ? "border-[#2563EB] bg-white text-[#2563EB] ring-4 ring-blue-50" : 
                              "border-[#E5E5E5] bg-white text-[#D1D5DB]"
                            )}>
                              {isCompleted ? <CheckCircle2 className="h-5 w-5" /> : <Fingerprint className="h-5 w-5" />}
                            </div>
                            {index !== AGENT_STEPS.length - 1 && (
                              <div className={cn(
                                "h-14 w-0.5 transition-all duration-500 rounded-full",
                                isCompleted ? "bg-[#22C55E]" : "bg-[#F3F4F6]"
                              )} />
                            )}
                          </div>
                          <div className="pt-0.5">
                            <p className={cn(
                              "font-bold transition-colors",
                              isCompleted ? "text-[#1A1A1A]" : isCurrent ? "text-[#2563EB]" : "text-[#9CA3AF]"
                            )}>
                              {step.text}
                            </p>
                            <p className="text-xs text-[#6B7280] mt-1 leading-relaxed max-w-md">{step.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-[#E5E5E5] bg-white p-8 shadow-sm flex flex-col">
                  <h3 className="mb-6 text-lg font-bold text-[#1A1A1A]">Network Growth</h3>
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex h-56 items-end justify-between gap-3 px-2">
                      {chartData.map((data) => (
                        <div key={data.month} className="group relative flex flex-1 flex-col items-center gap-2">
                          <div 
                            className="w-full rounded-lg bg-gradient-to-t from-[#2563EB] to-[#60A5FA] opacity-20 transition-all duration-500 group-hover:opacity-100 group-hover:shadow-lg group-hover:shadow-blue-100"
                            style={{ height: `${(data.value / maxValue) * 100}%` }}
                          />
                          <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-tighter">{data.month}</span>
                          
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1A1A1A] text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap pointer-events-none">
                            {data.value} links
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-10 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 border border-green-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-green-700 uppercase tracking-wider">Growth Delta</span>
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                          <TrendingUp className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <p className="text-2xl font-black text-green-800">+{campaign?.this_month_backlinks || 0}</p>
                      <p className="text-[10px] text-green-600 font-medium mt-1">New earned links this period</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[#E5E5E5] bg-white overflow-hidden shadow-sm">
              <div className="p-6 border-b border-[#E5E5E5] bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-[#1A1A1A]">Earned Backlink Profile</h3>
                  <p className="text-xs text-[#6B7280]">Showing {filteredBacklinks.length} live active links</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 shadow-sm">
                    <List className="h-4 w-4 text-[#6B7280]" />
                    <select 
                      className="text-xs font-bold bg-transparent text-[#1A1A1A] outline-none cursor-pointer"
                      value={filterDR || ""}
                      onChange={(e) => setFilterDR(e.target.value ? parseInt(e.target.value) : null)}
                    >
                      <option value="">All Authority</option>
                      <option value="50">DR 50+ High</option>
                      <option value="70">DR 70+ Premium</option>
                      <option value="90">DR 90+ Elite</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#F9FAFB] text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                      <th className="px-8 py-4 text-left">Source Platform</th>
                      <th className="px-8 py-4 text-left">Linking URL</th>
                      <th className="px-8 py-4 text-center">Structure</th>
                      <th className="px-8 py-4 text-center">DR</th>
                      <th className="px-8 py-4 text-center">Status</th>
                      <th className="px-8 py-4 text-right">Discovery</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {filteredBacklinks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="flex flex-col items-center gap-3 grayscale opacity-30">
                            <Layers className="h-10 w-10" />
                            <p className="text-sm font-bold text-[#6B7280]">No backlinks discovered yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBacklinks.map((backlink) => (
                        <tr key={backlink.id} className="hover:bg-blue-50/20 transition-colors text-sm group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <SiteLogo domain={backlink.source_domain} name={backlink.source_name} size={36} className="shadow-sm" />
                              <div>
                                <p className="font-bold text-[#1A1A1A] group-hover:text-[#2563EB] transition-colors">{backlink.source_name}</p>
                                <p className="text-[10px] text-[#9CA3AF] font-medium tracking-tight">{backlink.source_domain}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-2">
                              <a href={backlink.linking_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium truncate max-w-[220px] block transition-colors">
                                {backlink.linking_url}
                              </a>
                              <ArrowUpRight className="h-3 w-3 text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest",
                              backlink.tier === 1 ? "bg-blue-100 text-blue-700" :
                              backlink.tier === 2 ? "bg-purple-100 text-purple-700" :
                              "bg-gray-100 text-gray-700"
                            )}>
                              Tier {backlink.tier || 1}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className={cn("h-1.5 w-1.5 rounded-full", getDRColor(backlink.domain_rating))} />
                              <span className="font-black text-[#1A1A1A]">{backlink.domain_rating}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-center">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-[#22C55E] text-[10px] font-black uppercase tracking-widest border border-green-100 shadow-sm">
                              <div className="h-1 w-1 rounded-full bg-[#22C55E] animate-pulse" />
                              {backlink.status}
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right text-[10px] font-bold text-[#9CA3AF] uppercase">
                            {formatDate(backlink.date_added)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#E5E5E5] animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-8 py-6 border-b border-[#F3F4F6]">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A]">Campaign Optimization</h2>
                <p className="text-xs text-[#6B7280]">Fine-tune your backlink generation strategy</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-[#9CA3AF] hover:text-[#1A1A1A] p-2 hover:bg-[#F3F4F6] rounded-xl transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Aggression Level</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D1D5DB]" />
                    <select
                      value={settingsForm.risk_level}
                      onChange={(e) => setSettingsForm({...settingsForm, risk_level: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                      <option value="Conservative">Safe / Slow</option>
                      <option value="Balanced">Balanced / Natural</option>
                      <option value="Boost">Aggressive / Fast</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Daily Threshold</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#D1D5DB]" />
                    <input
                      type="number"
                      value={settingsForm.max_daily_submissions}
                      onChange={(e) => setSettingsForm({...settingsForm, max_daily_submissions: parseInt(e.target.value) || 10})}
                      className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest mb-2">Target Keywords</label>
                <div className="relative">
                  <Sparkles className="absolute left-3 top-3 h-4 w-4 text-[#D1D5DB]" />
                  <textarea
                    placeholder="SEO, marketing, business..."
                    value={settingsForm.keywords}
                    onChange={(e) => setSettingsForm({...settingsForm, keywords: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 bg-[#F9FAFB] border border-[#E5E5E5] rounded-2xl text-sm font-bold h-24 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                </div>
                <p className="text-[10px] text-[#9CA3AF] mt-2 italic">Comma separated list of keywords to target in anchor text.</p>
              </div>
              
              <div className="pt-4 border-t border-[#F3F4F6]">
                <button
                  onClick={saveSettings}
                  disabled={savingSettings}
                  className="w-full bg-[#2563EB] text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {savingSettings ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                  Deploy Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
