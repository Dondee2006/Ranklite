"use client";

import { useState, useEffect, useCallback } from "react";
import {
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
}

// Map of real logos for known platforms
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
}

interface Stats {
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  require_manual: number;
  blocked: number;
}

const AGENT_STEPS = [
  { id: 1, text: "Scanning directories" },
  { id: 2, text: "Discovering opportunities" },
  { id: 3, text: "Checking policy compliance" },
  { id: 4, text: "Processing submissions" },
  { id: 5, text: "Verifying backlinks" },
  { id: 6, text: "Updating metrics" },
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

function getTimeUntilNextScan(nextScan: string | null) {
  if (!nextScan) return "Soon";
  const diff = new Date(nextScan).getTime() - Date.now();
  if (diff <= 0) return "Now";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function SiteLogo({ domain, name, size = 24 }: { domain: string; name: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const [sourceIndex, setSourceIndex] = useState(0);
  
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
  
  const colorIndex = name.charCodeAt(0) % colors.length;
  
  if (imgError || logoSources.length === 0) {
    return (
      <div 
        className={`flex items-center justify-center rounded-lg bg-gradient-to-br ${colors[colorIndex]} text-white font-bold text-sm`}
        style={{ width: size + 8, height: size + 8 }}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    );
  }

  return (
    <div 
      className="rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden p-1"
      style={{ width: size + 8, height: size + 8 }}
    >
      <img
        src={logoSources[sourceIndex]}
        alt={name}
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
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentRunning, setAgentRunning] = useState(false);
  const [newBacklinkNotification, setNewBacklinkNotification] = useState<Backlink | null>(null);
  const [filterDR, setFilterDR] = useState<number | null>(null);
  const [togglingPause, setTogglingPause] = useState(false);

  const loadBacklinks = useCallback(async () => {
    try {
      const [backlinksRes, campaignRes] = await Promise.all([
        fetch("/api/backlinks"),
        fetch("/api/backlinks/campaign"),
      ]);
      const backlinksData = await backlinksRes.json();
      const campaignData = await campaignRes.json();
      setBacklinks(backlinksData.backlinks || []);
      setCampaign(backlinksData.campaign || campaignData.campaign);
      setStats(campaignData.stats);
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
      const data = await response.json();
      if (data.new_backlink) {
        setNewBacklinkNotification(data.new_backlink);
        setTimeout(() => setNewBacklinkNotification(null), 5000);
      }
      if (data.stats) {
        setStats(data.stats);
      }
      await loadBacklinks();
    } catch (error) {
      console.error("Agent step failed:", error);
    } finally {
      setAgentRunning(false);
    }
  }, [agentRunning, campaign?.is_paused, loadBacklinks]);

  const togglePause = async () => {
    if (!campaign) return;
    setTogglingPause(true);
    try {
      await fetch("/api/backlinks/campaign", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_paused: !campaign.is_paused }),
      });
      await loadBacklinks();
    } catch (error) {
      console.error("Failed to toggle pause:", error);
    } finally {
      setTogglingPause(false);
    }
  };

  useEffect(() => {
    loadBacklinks();
  }, [loadBacklinks]);

  useEffect(() => {
    if (!campaign?.is_paused && (campaign?.agent_status === "scanning" || campaign?.status === "active")) {
      const interval = setInterval(runAgentStep, 6000);
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
    <div className="min-h-screen bg-[#FAFFFE]">
      {newBacklinkNotification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="rounded-2xl border border-[#22C55E]/30 bg-gradient-to-r from-[#F0FDF4] to-white p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#22C55E]">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-foreground">New Backlink Earned!</p>
                <p className="text-sm text-muted-foreground">{newBacklinkNotification.source_name} • DR {newBacklinkNotification.domain_rating}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b border-border bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
              Backlink Generator
            </h1>
            {campaign?.is_paused ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700">
                <Pause className="h-3 w-3" />
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#22C55E]/10 px-3 py-1 text-xs font-semibold text-[#22C55E]">
                <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                Autopilot Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {(stats?.require_manual || 0) > 0 && (
              <Link
                href="/dashboard/backlink-generator/manual-review"
                className="flex items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-700 hover:bg-orange-100 transition-all"
              >
                <ClipboardList className="h-4 w-4" />
                {stats?.require_manual} Manual Review
              </Link>
            )}
            <button
              onClick={togglePause}
              disabled={togglingPause}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all",
                campaign?.is_paused
                  ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                  : "border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
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
            <button className="flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-sm text-muted-foreground hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] transition-all">
              <Settings className="h-4 w-4" />
              Settings
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Queue Stats */}
        {stats && (
          <div className="grid grid-cols-6 gap-3 mb-6">
            <div className="rounded-xl border border-border bg-white p-3 text-center">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="text-lg font-bold text-foreground">{stats.pending}</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-center">
              <p className="text-xs text-blue-600">Processing</p>
              <p className="text-lg font-bold text-blue-700">{stats.processing}</p>
            </div>
            <div className="rounded-xl border border-green-200 bg-green-50 p-3 text-center">
              <p className="text-xs text-green-600">Completed</p>
              <p className="text-lg font-bold text-green-700">{stats.completed}</p>
            </div>
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 text-center">
              <p className="text-xs text-orange-600">Manual Review</p>
              <p className="text-lg font-bold text-orange-700">{stats.require_manual}</p>
            </div>
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center">
              <p className="text-xs text-red-600">Failed</p>
              <p className="text-lg font-bold text-red-700">{stats.failed}</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-center">
              <p className="text-xs text-gray-600">Blocked</p>
              <p className="text-lg font-bold text-gray-700">{stats.blocked}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED]">
                  <Zap className="h-7 w-7 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-foreground">
                      {campaign?.is_paused ? "Agent Paused" : "AI Agent Running"}
                    </h2>
                    {!campaign?.is_paused && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#22C55E]/10 px-2.5 py-1 text-xs font-semibold text-[#22C55E]">
                        <Sparkles className="h-3 w-3" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign?.website_url 
                      ? `Building backlinks for ${campaign.website_url.replace(/https?:\/\//, "")}`
                      : "Scanning and building quality backlinks automatically"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-xl border border-border bg-white px-4 py-3 text-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Link2 className="h-3.5 w-3.5" />
                    TOTAL
                  </div>
                  <div className="text-3xl font-bold text-foreground">{campaign?.total_backlinks || 0}</div>
                  <div className="text-xs text-muted-foreground">links</div>
                </div>
                <div className="rounded-xl border border-border bg-white px-4 py-3 text-center">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Globe className="h-3.5 w-3.5" />
                    PLATFORMS
                  </div>
                  <div className="text-3xl font-bold text-foreground">{campaign?.unique_sources || 0}</div>
                  <div className="text-xs text-muted-foreground">sources</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {AGENT_STEPS.map((step, index) => {
                const isDone = index < currentStepIndex;
                const isActive = index === currentStepIndex && !campaign?.is_paused;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    {isDone ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#22C55E]/10">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#22C55E]" />
                      </div>
                    ) : isActive ? (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#8B5CF6]/10">
                        <Loader2 className="h-3.5 w-3.5 text-[#8B5CF6] animate-spin" />
                      </div>
                    ) : (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-100">
                        <div className="h-2 w-2 rounded-full bg-gray-300" />
                      </div>
                    )}
                    <span className={cn(
                      "text-sm",
                      isDone ? "text-muted-foreground" : isActive ? "text-foreground font-medium" : "text-gray-400"
                    )}>
                      {isActive && <span className="text-[#8B5CF6] mr-1">→</span>}
                      {step.text}{isActive && " ..."}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Today: {campaign?.daily_submission_count || 0}/{campaign?.max_daily_submissions || 10} submissions</span>
                </div>
                <div className="flex items-center gap-2 text-[#22C55E]">
                  {campaign?.is_paused ? (
                    <span className="text-yellow-600">Automation paused</span>
                  ) : (
                    <>
                      <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                      Running continuously
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Total Backlinks</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{campaign?.total_backlinks || 0}</span>
                </div>
                <p className="text-xs text-muted-foreground">All Time</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Unique Sources</p>
                <span className="text-2xl font-bold text-foreground">{campaign?.unique_sources || 0}</span>
                <p className="text-xs text-muted-foreground">Different Websites</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">Avg. Domain Rating</p>
                <span className="text-2xl font-bold text-foreground">{campaign?.avg_domain_rating || 0}</span>
                <p className="text-xs text-muted-foreground">Quality Score</p>
              </div>
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <span className="text-2xl font-bold text-foreground">{campaign?.this_month_backlinks || 0}</span>
                <p className="text-xs text-muted-foreground">New Backlinks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-[#8B5CF6]" />
                <h3 className="font-semibold text-foreground">Backlink Growth</h3>
              </div>
            </div>

            <div className="h-48 flex items-end gap-2 pt-4">
              {chartData.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-[#8B5CF6]/20 to-[#8B5CF6]/60 transition-all duration-500"
                    style={{ height: `${Math.max(4, (item.value / maxValue) * 150)}px` }}
                  />
                  <span className="text-xs text-muted-foreground">{item.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#22C55E]" />
                <h3 className="font-semibold text-foreground">Earned Backlinks</h3>
                <span className="rounded-full bg-[#8B5CF6]/10 px-2 py-0.5 text-xs font-medium text-[#8B5CF6]">
                  {filteredBacklinks.length} links
                </span>
              </div>
              <select 
                className="text-xs border border-border rounded-lg px-2 py-1"
                value={filterDR || ""}
                onChange={(e) => setFilterDR(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">All DR</option>
                <option value="50">DR 50+</option>
                <option value="70">DR 70+</option>
              </select>
            </div>

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
              </div>
            ) : filteredBacklinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="h-16 w-16 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 text-[#8B5CF6] animate-spin" />
                </div>
                <p className="font-medium text-foreground">Agent is working...</p>
                <p className="text-sm text-muted-foreground mt-1">Your first backlinks will appear here soon</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="grid grid-cols-5 gap-4 pb-3 border-b border-border text-xs text-muted-foreground font-medium">
                  <span>Source Website</span>
                  <span>Linking URL</span>
                  <span className="text-center">Traffic</span>
                  <span className="text-center">DR</span>
                  <span>Status</span>
                </div>
                <div className="divide-y divide-border max-h-[300px] overflow-y-auto">
                  {filteredBacklinks.slice(0, 10).map((backlink) => (
                    <div key={backlink.id} className="grid grid-cols-5 gap-4 py-3 items-center text-sm">
                      <div className="flex items-center gap-2">
                        <SiteLogo domain={backlink.source_domain} name={backlink.source_name} />
                        <div>
                          <p className="font-medium text-foreground">{backlink.source_name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[120px]">{backlink.source_domain}</p>
                        </div>
                      </div>
                      <a
                        href={backlink.linking_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#8B5CF6] hover:underline truncate flex items-center gap-1"
                      >
                        {backlink.linking_url.slice(0, 30)}...
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                      <div className="text-center">
                        <span className="font-medium text-foreground">{backlink.traffic}</span>
                      </div>
                      <div className="flex justify-center">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-white font-bold text-xs",
                          getDRColor(backlink.domain_rating)
                        )}>
                          {backlink.domain_rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {backlink.verification_status === "verified" ? (
                          <span className="inline-flex items-center gap-1 text-[#22C55E] text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : backlink.verification_status === "pending" ? (
                          <span className="inline-flex items-center gap-1 text-yellow-600 text-xs">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-gray-500 text-xs">
                            <AlertCircle className="h-3.5 w-3.5" />
                            {backlink.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}