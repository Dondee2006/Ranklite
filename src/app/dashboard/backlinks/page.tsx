"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Loader2, 
  FileText, 
  Link2, 
  Layers, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Eye,
  Sparkles,
  ChevronRight,
  ExternalLink,
  BarChart3,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Backlink {
  id: string;
  source_name: string;
  linking_url: string;
  anchor_text: string;
  domain_rating: number;
  status: string;
  date_added: string;
  source_domain?: string;
  tier?: number;
  source_tier?: number;
  is_indexed?: boolean;
  article_id?: string;
  article?: {
    id: string;
    title: string;
    keyword: string;
    slug: string;
  };
  adapted_type?: string;
}

interface DistributionStats {
  tier1Links: number;
  tier2Links: number;
  tier3Links: number;
  indexedCount: number;
  indexRate: number;
  pendingTasks: number;
}

interface AmplifiedArticle {
  id: string;
  title: string;
  keyword: string;
  backlinks_count: number;
  backlinks_status: string;
}

const STATUS_COLORS = {
  Live: "bg-[#D1FAE5] text-[#065F46]",
  Pending: "bg-[#FEF3C7] text-[#92400E]",
  Failed: "bg-[#FEE2E2] text-[#991B1B]",
};

function getDRColor(dr: number) {
  if (dr >= 70) return "bg-[#10B981] text-white";
  if (dr >= 50) return "bg-[#FCD34D] text-[#92400E]";
  return "bg-[#F87171] text-white";
}

function getTierBadge(tier: number) {
  switch (tier) {
    case 1:
      return { bg: "bg-blue-100", text: "text-blue-700", label: "T1 - Target" };
    case 2:
      return { bg: "bg-purple-100", text: "text-purple-700", label: "T2 - Authority" };
    case 3:
      return { bg: "bg-gray-100", text: "text-gray-600", label: "T3 - Amplifier" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-600", label: "Unknown" };
  }
}

export default function BacklinksPage() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [campaign, setCampaign] = useState<any>(null);
  const [distribution, setDistribution] = useState<DistributionStats | null>(null);
  const [amplifiedArticles, setAmplifiedArticles] = useState<AmplifiedArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"by-tier" | "by-article">("by-tier");

  useEffect(() => {
    loadBacklinks();
  }, []);

  async function loadBacklinks() {
    setLoading(true);
    try {
      const response = await fetch("/api/backlinks");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setBacklinks(data.backlinks || []);
      setCampaign(data.campaign || null);
      setDistribution(data.distribution || null);
      setAmplifiedArticles(data.amplifiedArticles || []);
    } catch (error) {
      console.error("Failed to load backlinks:", error);
      setBacklinks([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredBacklinks = backlinks.filter(b => {
    const status = b.status === "pending_verification" ? "Pending" : b.status;
    if (filterStatus && status !== filterStatus) return false;
    const tier = b.tier || b.source_tier || 2;
    if (filterTier && tier !== filterTier) return false;
    return true;
  });

  const backlinksByArticle = filteredBacklinks.reduce((acc, b) => {
    const articleId = b.article_id || "unassigned";
    if (!acc[articleId]) {
      acc[articleId] = {
        article: b.article || { id: "unassigned", title: "Foundation Links", keyword: "General" },
        backlinks: [],
      };
    }
    acc[articleId].backlinks.push(b);
    return acc;
  }, {} as Record<string, { article: any; backlinks: Backlink[] }>);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Content Distribution</h1>
            <p className="text-sm text-[#6B7280] mt-1">Backlinks generated from your content amplification</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/backlink-generator"
              className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF] transition-colors shadow-sm flex items-center gap-2"
            >
              <Zap className={cn("h-4 w-4", campaign?.agent_status === "scanning" && "animate-pulse")} />
              {campaign?.agent_status === "scanning" ? "Agent Running" : "Open Autopilot"}
            </Link>
          </div>
        </div>
      </header>

      <div className="p-8">
        {distribution && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tier 1 Links</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{distribution.tier1Links}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                  <Link2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tier 2 Links</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{distribution.tier2Links}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Tier 3 Links</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{distribution.tier3Links}</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Index Rate</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{distribution.indexRate}%</p>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50 text-yellow-600">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Pending</p>
                  <p className="text-2xl font-bold text-[#1A1A1A]">{distribution.pendingTasks}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {amplifiedArticles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2563EB]" />
              Amplified Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {amplifiedArticles.map((article) => (
                <div 
                  key={article.id} 
                  className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setFilterTier(null)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#1A1A1A] line-clamp-2">{article.title}</p>
                      <p className="text-xs text-[#6B7280] mt-1">{article.keyword}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#2563EB]">
                      <Link2 className="h-4 w-4" />
                      <span className="font-bold">{article.backlinks_count || 0}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      article.backlinks_status === "distributing" ? "bg-blue-100 text-blue-700" :
                      article.backlinks_status === "completed" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {article.backlinks_status || "Pending"}
                    </span>
                    <Link 
                      href={`/dashboard/content/${article.id}`}
                      className="text-xs text-[#2563EB] hover:underline flex items-center gap-1"
                    >
                      View Article <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[#F3F4F6] p-1 rounded-lg">
              <button
                onClick={() => setViewMode("by-tier")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  viewMode === "by-tier" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280]"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5 inline mr-1" />
                By Tier
              </button>
              <button
                onClick={() => setViewMode("by-article")}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                  viewMode === "by-article" ? "bg-white text-[#1A1A1A] shadow-sm" : "text-[#6B7280]"
                )}
              >
                <FileText className="h-3.5 w-3.5 inline mr-1" />
                By Article
              </button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filterTier || ""}
              onChange={(e) => setFilterTier(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-md bg-white text-[#6B7280]"
            >
              <option value="">All Tiers</option>
              <option value="1">Tier 1 - Target</option>
              <option value="2">Tier 2 - Authority</option>
              <option value="3">Tier 3 - Amplifier</option>
            </select>
            <select
              value={filterStatus || ""}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-md bg-white text-[#6B7280]"
            >
              <option value="">All Status</option>
              <option value="Live">Live</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : viewMode === "by-article" ? (
            <div className="divide-y divide-[#E5E5E5]">
              {Object.entries(backlinksByArticle).length === 0 ? (
                <div className="px-6 py-12 text-center text-sm text-[#6B7280]">
                  No backlinks found. Enable content amplification on your articles.
                </div>
              ) : (
                Object.entries(backlinksByArticle).map(([articleId, { article, backlinks: articleBacklinks }]) => (
                  <div key={articleId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-[#1A1A1A]">{article.title}</p>
                          <p className="text-xs text-[#6B7280]">{article.keyword}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#2563EB]">
                        {articleBacklinks.length} backlinks
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {articleBacklinks.slice(0, 6).map((backlink) => {
                        const tier = backlink.tier || backlink.source_tier || 2;
                        const tierStyle = getTierBadge(tier);
                        return (
                          <div key={backlink.id} className="border border-[#E5E5E5] rounded-lg p-3 bg-[#F9FAFB]">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-[#1A1A1A] truncate">
                                {backlink.source_name || backlink.source_domain}
                              </span>
                              <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", tierStyle.bg, tierStyle.text)}>
                                T{tier}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={cn("px-2 py-0.5 rounded-md font-medium", getDRColor(backlink.domain_rating || 0))}>
                                DR {backlink.domain_rating || 0}
                              </span>
                              {backlink.is_indexed && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <Eye className="h-3 w-3" /> Indexed
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {articleBacklinks.length > 6 && (
                      <p className="text-xs text-[#6B7280] mt-3 text-center">
                        +{articleBacklinks.length - 6} more backlinks
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Source</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">From Article</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Tier</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Anchor</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">DR</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredBacklinks.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                        {campaign?.pending_tasks > 0 ? "First links arriving soon..." : "No backlinks found"}
                      </td>
                    </tr>
                  ) : (
                    filteredBacklinks.map((backlink) => {
                      const tier = backlink.tier || backlink.source_tier || 2;
                      const tierStyle = getTierBadge(tier);
                      return (
                        <tr key={backlink.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A]">{backlink.source_name || backlink.source_domain || "Unknown"}</div>
                            {backlink.adapted_type && (
                              <span className="text-[10px] text-[#6B7280] uppercase">{backlink.adapted_type}</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {backlink.article ? (
                              <Link href={`/dashboard/content/${backlink.article.id}`} className="text-sm text-[#2563EB] hover:underline line-clamp-1">
                                {backlink.article.title}
                              </Link>
                            ) : (
                              <span className="text-sm text-[#6B7280]">Foundation Link</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase", tierStyle.bg, tierStyle.text)}>
                              {tierStyle.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#6B7280]">{backlink.anchor_text || "-"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn("inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold w-10", getDRColor(backlink.domain_rating || 0))}>
                              {backlink.domain_rating || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                                backlink.status === "Live" ? "bg-[#D1FAE5] text-[#065F46]" :
                                (backlink.status === "Pending" || backlink.status === "pending_verification") ? "bg-[#FEF3C7] text-[#92400E]" :
                                "bg-[#FEE2E2] text-[#991B1B]"
                              )}>
                                {backlink.status === "pending_verification" ? "Pending" : backlink.status}
                              </span>
                              {backlink.is_indexed && (
                                <span className="flex items-center text-green-600" title="Indexed">
                                  <Eye className="h-3.5 w-3.5" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <a
                              href={backlink.linking_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF] inline-flex items-center gap-1"
                            >
                              View <ExternalLink className="h-3 w-3" />
                            </a>
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
    </div>
  );
}
