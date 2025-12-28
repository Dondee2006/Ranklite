"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Loader2,
  Coins,
  Link2,
  ArrowUpRight,
  ArrowDownLeft,
  Shield,
  Settings,
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Globe,
  Eye,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  X,
  Info,
  HelpCircle,
  FileText,
  MousePointer2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExchangeData {
  credits: {
    balance: number;
    pending: number;
    lifetimeEarned: number;
    lifetimeSpent: number;
  };
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    reason: string;
    createdAt: string;
  }>;
  inventory: {
    total: number;
    verified: number;
    pending: number;
    pages: Array<{
      id: string;
      pageUrl: string;
      domain: string;
      domainRating: number;
      qualityScore: number;
      creditsPerLink: number;
      currentLinks: number;
      maxLinks: number;
      status: string;
      tier: number;
      isIndexed: boolean;
    }>;
  };
  stats: {
    linksGiven: number;
    linksReceived: number;
    pendingRequests: number;
    avgHopDistance: number;
    indexRate: number;
  };
  settings: {
    autoAccept: boolean;
    minIncomingDR: number;
    maxOutgoingPerDay: number;
    minHopDistance: number;
    tier1Enabled: boolean;
    tier2Enabled: boolean;
    tier3Enabled: boolean;
    autoExchangeEnabled: boolean;
    automationRiskLevel: string;
  };
}

interface Route {
  inventoryId: string;
  domain: string;
  pageUrl: string;
  domainRating: number;
  qualityScore: number;
  creditsRequired: number;
  hopDistance: number;
  tier: number;
}

export default function AuthorityExchangePage() {
  const [data, setData] = useState<ExchangeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "inventory" | "find" | "settings">("overview");
  const [searchDomain, setSearchDomain] = useState("");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/exchange");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to load exchange data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function searchRoutes() {
    if (!searchDomain.trim()) return;
    setSearchLoading(true);
    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "find_routes",
          targetDomain: searchDomain,
        }),
      });
      if (res.ok) {
        const result = await res.json();
        setRoutes(result.routes || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearchLoading(false);
    }
  }

  async function requestLink(route: Route) {
    const targetUrl = prompt("Enter the full URL you want the link to point to:");
    if (!targetUrl) return;

    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_link",
          inventoryId: route.inventoryId,
          targetUrl,
          anchorType: "branded",
        }),
      });

      if (res.ok) {
        alert("Link request submitted successfully!");
        loadData();
      } else {
        const error = await res.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      alert("Failed to request link");
    }
  }

  async function updateSettings(updatedSettings: Partial<ExchangeData["settings"]>) {
    if (!data) return;
    setIsUpdating(true);
    const newSettings = { ...data.settings, ...updatedSettings };

    // Optimistic update
    setData({
      ...data,
      settings: newSettings as ExchangeData["settings"]
    });

    try {
      const res = await fetch("/api/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_settings",
          settings: {
            autoAccept: newSettings.autoAccept,
            minIncomingDR: newSettings.minIncomingDR,
            maxOutgoingPerDay: newSettings.maxOutgoingPerDay,
            minHopDistance: newSettings.minHopDistance,
            tier1Enabled: newSettings.tier1Enabled,
            tier2Enabled: newSettings.tier2Enabled,
            tier3Enabled: newSettings.tier3Enabled,
            autoExchangeEnabled: newSettings.autoExchangeEnabled,
            automationRiskLevel: newSettings.automationRiskLevel,
          },
        }),
      });

      if (!res.ok) {
        loadData();
        alert("Failed to update settings");
      }
    } catch (error) {
      loadData();
      alert("Failed to update settings");
    } finally {
      setIsUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#1A1A1A]">
      <header className="border-b border-[#E5E5E5] bg-white px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight text-[#1A1A1A]">Backlink Exchange</h1>
              <button
                onClick={() => setIsHowItWorksOpen(true)}
                className="text-xs text-[#6B7280] hover:text-[#22C55E] flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="underline decoration-[#E5E5E5] underline-offset-4">How It Works</span>
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 text-[#6B7280] hover:text-[#22C55E] hover:bg-[#FAFAFA] rounded-full transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-[#E5E5E5] rounded-full shadow-sm">
                <span className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">Your Domain Rating:</span>
                <span className="text-xs font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                  {data?.inventory.pages.length ? (data.inventory.pages.reduce((acc, p) => acc + p.domainRating, 0) / data.inventory.pages.length).toFixed(1) : "0.0"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-8 border-b border-transparent">
            {['overview', 'inventory', 'find'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={cn(
                  "pb-4 text-sm font-bold transition-all border-b-2 capitalize",
                  activeTab === tab
                    ? "border-[#22C55E] text-[#22C55E]"
                    : "border-transparent text-[#6B7280] hover:text-[#1A1A1A]"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Network Participation Banner */}
            <div className="w-full bg-white border border-[#E5E5E5] rounded-2xl p-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAFAFA] border border-[#E5E5E5]">
                  <RefreshCw className={cn("h-5 w-5 text-[#6B7280]", isUpdating && "animate-spin text-[#22C55E]")} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#1A1A1A]">Network Participation</h3>
                    <AlertTriangle className="h-3.5 w-3.5 text-[#9CA3AF] cursor-help" />
                  </div>
                  <p className="text-sm text-[#6B7280] mt-0.5">
                    When enabled, your website will participate in our backlink exchange program and can earn backlinks from other websites
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-[#6B7280]">
                  {data?.settings.autoExchangeEnabled ? "Active" : "Paused"}
                </span>
                <button
                  onClick={() => updateSettings({ autoExchangeEnabled: !data?.settings.autoExchangeEnabled })}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                    data?.settings.autoExchangeEnabled ? "bg-[#22C55E]" : "bg-[#E5E5E5]"
                  )}
                >
                  <span className={cn(
                    "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                    data?.settings.autoExchangeEnabled ? "translate-x-5" : "translate-x-0"
                  )} />
                </button>
              </div>
            </div>

            {/* Dual-Column Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Backlink Credits */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 relative overflow-hidden group shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Coins className="h-4 w-4 text-yellow-500" />
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">Backlink Credits</h3>
                  <AlertTriangle className="h-3.5 w-3.5 text-[#9CA3AF] cursor-help" />
                </div>

                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B7280] font-medium">Credits Available</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-[#1A1A1A]">{data?.credits.balance.toFixed(0)}</p>
                      <p className="text-xs text-[#9CA3AF]">1 Credit = 1 Domain Rating</p>
                    </div>
                  </div>

                  <div className="text-right space-y-3">
                    <div className="space-y-0.5">
                      <p className="text-xs text-[#6B7280] font-medium">Monthly Credits</p>
                      <Link
                        href="/dashboard/billing"
                        className="flex items-center gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg shadow-green-500/10"
                      >
                        Get Monthly Credits <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <p className="text-[10px] text-[#9CA3AF]">Get up to 1000 credits per month</p>
                  </div>
                </div>
              </div>

              {/* Backlink Performance */}
              <div className="bg-white border border-[#E5E5E5] rounded-2xl p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">Backlink Performance</h3>
                  <AlertTriangle className="h-3.5 w-3.5 text-[#9CA3AF] cursor-help" />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B7280] font-medium">Total Backlinks</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-[#1A1A1A]">{data?.stats.linksReceived}</p>
                      <p className="text-xs text-[#9CA3AF]">All Time</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-[#6B7280] font-medium">Unique Sources</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-5xl font-bold text-[#1A1A1A]">{data?.inventory.total}</p>
                      <p className="text-xs text-[#9CA3AF]">Different Websites</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Earned Backlinks Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded bg-[#22C55E]/10 flex items-center justify-center">
                    <Link2 className="h-3.5 w-3.5 text-[#22C55E]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]">History</h3>
                </div>
                <div className="flex items-center gap-2 text-xs text-[#22C55E] bg-[#22C55E]/10 px-3 py-1 rounded-full border border-[#22C55E]/20 font-bold">
                  {data?.stats.linksReceived} Verified Links
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Credits</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">DR</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Source</th>
                      <th className="px-6 py-4 text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {data?.transactions.filter(t => t.type === 'spent').map((tx) => (
                      <tr key={tx.id} className="hover:bg-[#FAFAFA] transition-colors group">
                        <td className="px-6 py-4 text-xs font-medium text-[#4B5563]">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9]">
                            <CheckCircle className="h-3 w-3" /> Verified
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-[#1A1A1A]">
                          -{Math.abs(tx.amount)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="h-7 w-7 rounded-full border border-[#E5E5E5] flex items-center justify-center text-[10px] font-bold bg-white">{Math.abs(tx.amount).toFixed(0)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-[#4B5563]">
                            <Globe className="h-3 w-3 text-[#9CA3AF]" />
                            {tx.reason.split('from ')[1]?.split(' ')[0] || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                            <span className="line-clamp-1 max-w-[150px]">{tx.reason.split(' - ')[1] || 'Verification complete'}</span>
                            <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-[#22C55E]" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {(data?.transactions.filter(t => t.type === 'spent').length ?? 0) === 0 && (
                  <div className="py-20 text-center">
                    <Link2 className="h-12 w-12 text-[#E5E5E5] mx-auto mb-4" />
                    <p className="text-sm text-[#6B7280] font-medium">No verified backlinks found yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#1A1A1A]">Your Inventory</h3>
                <p className="text-sm text-[#6B7280]">Pages from your sites that are currently available to the network.</p>
              </div>
              <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] px-4 py-2 rounded-xl shadow-sm">
                <Globe className="h-4 w-4 text-[#22C55E]" />
                <span className="text-sm font-bold">{data?.inventory.total} Sites Linked</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.inventory.pages.map((page) => (
                <div key={page.id} className="bg-white border border-[#E5E5E5] p-5 rounded-2xl hover:border-[#22C55E]/30 transition-all shadow-sm group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center group-hover:bg-[#22C55E]/5 transition-colors">
                      <FileText className="h-5 w-5 text-[#6B7280] group-hover:text-[#22C55E]" />
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Domain Rating</span>
                      <span className="text-lg font-black text-[#22C55E]">{page.domainRating}</span>
                    </div>
                  </div>
                  <div className="space-y-1 mb-6">
                    <p className="text-xs font-bold text-[#1A1A1A] line-clamp-1 truncate">{page.domain}</p>
                    <p className="text-[10px] text-[#6B7280] line-clamp-1 flex items-center gap-1">
                      <ExternalLink className="h-2.5 w-2.5" />
                      {page.pageUrl}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-[#FAFAFA] flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                      <span className="text-[10px] font-bold text-[#6B7280]">Active in Network</span>
                    </div>
                    <span className="text-[10px] font-bold text-[#22C55E] bg-[#22C55E]/10 px-2 py-0.5 rounded-full">
                      Tier {page.tier}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {data?.inventory.pages.length === 0 && (
              <div className="py-20 bg-white border border-dashed border-[#E5E5E5] rounded-3xl text-center">
                <Globe className="h-12 w-12 text-[#E5E5E5] mx-auto mb-4" />
                <p className="text-sm text-[#6B7280] font-medium">No inventory sites found.</p>
                <p className="text-xs text-[#9CA3AF] mt-1">Publish articles to add them to the authority network.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'find' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white border border-[#E5E5E5] rounded-3xl p-10 shadow-sm text-center max-w-2xl mx-auto border-b-4 border-b-[#22C55E]">
              <div className="h-16 w-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Search className="h-8 w-8 text-[#22C55E]" />
              </div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Find Placement Routes</h2>
              <p className="text-sm text-[#6B7280] mb-8">Enter your domain to discover high-authority websites ready to link to your content.</p>

              <div className="relative group max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="e.g. yourdomain.com"
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchRoutes()}
                  className="w-full bg-[#FAFAFA] border-2 border-[#E5E5E5] rounded-full py-4 px-12 text-sm font-medium focus:outline-none focus:border-[#22C55E] transition-all"
                />
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#9CA3AF]" />
                <button
                  onClick={searchRoutes}
                  disabled={searchLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#22C55E] hover:bg-[#16A34A] text-white h-10 w-10 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50"
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin text-white" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {routes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {routes.map((route, i) => (
                  <div key={i} className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-sm hover:border-[#22C55E]/40 transition-all group">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex gap-4">
                        <div className="h-12 w-12 rounded-xl bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center">
                          <Globe className="h-6 w-6 text-[#22C55E]" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#1A1A1A]">{route.domain}</h4>
                          <span className="text-[10px] font-bold text-[#6B7280]">Target DR: {route.domainRating}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Cost</p>
                        <p className="text-sm font-bold text-[#22C55E]">{route.creditsRequired} Credits</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#FAFAFA] rounded-xl border border-[#E5E5E5] mb-6">
                      <p className="text-[10px] font-bold text-[#6B7280] uppercase mb-1">Target Path</p>
                      <p className="text-xs text-[#4B5563] truncate">{route.pageUrl}</p>
                    </div>
                    <button
                      onClick={() => requestLink(route)}
                      className="w-full flex items-center justify-center gap-2 bg-white border-2 border-[#E5E5E5] hover:border-[#22C55E] text-[#1A1A1A] hover:text-[#22C55E] py-3 rounded-xl text-xs font-bold transition-all group-hover:bg-[#22C55E]/5"
                    >
                      <MousePointer2 className="h-4 w-4" />
                      Request Manual Injection
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Settings Drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsSettingsOpen(false)} />
          <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 border-b border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-[#22C55E]" />
                <h2 className="text-lg font-bold text-[#1A1A1A]">Network Settings</h2>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-[#6B7280] hover:text-[#1A1A1A] rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <section className="space-y-4">
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Safety & Quality</h3>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4B5563]">Minimum Incoming DR</label>
                    <input
                      type="range" min="0" max="100"
                      value={data?.settings.minIncomingDR || 0}
                      onChange={(e) => updateSettings({ minIncomingDR: parseInt(e.target.value) })}
                      className="w-full h-2 bg-[#FAFAFA] rounded-full appearance-none accent-[#22C55E] border border-[#E5E5E5]"
                    />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF]">
                      <span>DR 0</span>
                      <span className="font-bold text-[#22C55E]">Current: {data?.settings.minIncomingDR}</span>
                      <span>DR 100</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#4B5563]">Automation Risk Level</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['low', 'medium', 'high'].map((level) => (
                        <button
                          key={level}
                          onClick={() => updateSettings({ automationRiskLevel: level })}
                          className={cn(
                            "px-3 py-2 rounded-lg text-xs font-bold border transition-all capitalize",
                            data?.settings.automationRiskLevel === level
                              ? "bg-[#22C55E]/10 border-[#22C55E] text-[#22C55E]"
                              : "border-[#E5E5E5] text-[#9CA3AF] hover:border-[#22C55E]/30"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-xs font-bold text-[#6B7280] uppercase tracking-wider">Network Tiers</h3>
                <div className="space-y-3">
                  {[
                    { id: 'tier1Enabled', label: 'Tier 1 (High Authority Sites)', desc: 'DR 70+ Premium network' },
                    { id: 'tier2Enabled', label: 'Tier 2 (Niche Relevant)', desc: 'DR 40-70 Mid-tier blogs' },
                    { id: 'tier3Enabled', label: 'Tier 3 (Growth Phase)', desc: 'DR 10-40 Emerging sites' },
                  ].map((tier) => (
                    <div key={tier.id} className="flex items-center justify-between p-3 rounded-xl border border-[#E5E5E5] hover:border-[#22C55E]/20 transition-colors">
                      <div>
                        <p className="text-xs font-bold text-[#4B5563]">{tier.label}</p>
                        <p className="text-[10px] text-[#9CA3AF]">{tier.desc}</p>
                      </div>
                      <button
                        onClick={() => updateSettings({ [tier.id]: !data?.settings[tier.id as keyof ExchangeData["settings"]] })}
                        className={cn(
                          "relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                          data?.settings[tier.id as keyof ExchangeData["settings"]] ? "bg-[#22C55E]" : "bg-[#E5E5E5]"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition",
                          data?.settings[tier.id as keyof ExchangeData["settings"]] ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="p-6 border-t border-[#E5E5E5] bg-[#FAFAFA]">
              <p className="text-[10px] text-center text-[#9CA3AF]">
                Settings are applied automatically to all future link injections.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* How It Works Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsHowItWorksOpen(false)} />
          <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-[#E5E5E5] bg-[#FAFAFA]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-[#22C55E]" />
                  </div>
                  <h2 className="text-xl font-bold text-[#1A1A1A]">How the Network Works</h2>
                </div>
                <button onClick={() => setIsHowItWorksOpen(false)} className="p-2 text-[#6B7280] hover:text-[#1A1A1A] rounded-full">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="text-sm text-[#6B7280]">
                Ranklite uses a decentralized authority exchange to build natural, high-quality backlinks on autopilot.
              </p>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-xs font-bold text-[#22C55E]">1</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Publish Content</h4>
                    <p className="text-xs text-[#6B7280] mt-1">When you publish articles via Ranklite, they are automatically indexed into the authority network.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-xs font-bold text-[#22C55E]">2</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Earn Credits</h4>
                    <p className="text-xs text-[#6B7280] mt-1">Other network members will contextually link to your sites. Every link given earns you authority credits.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-xs font-bold text-[#22C55E]">3</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Automated Growth</h4>
                    <p className="text-xs text-[#6B7280] mt-1">Ranklite uses your credits to automatically secure backlinks for you from high-authority sources.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-8 w-8 rounded-lg bg-[#FAFAFA] border border-[#E5E5E5] flex items-center justify-center text-xs font-bold text-[#22C55E]">4</div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1A1A1A]">Quality Assurance</h4>
                    <p className="text-xs text-[#6B7280] mt-1">Our AI ensures all links are contextually relevant and safe, maintaining natural link velocity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-[#FAFAFA] border-t border-[#E5E5E5] flex justify-center">
              <button
                onClick={() => setIsHowItWorksOpen(false)}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 py-3 rounded-full text-sm font-bold transition-all"
              >
                Got it, let's grow!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
