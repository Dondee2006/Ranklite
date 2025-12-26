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
  Zap,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Authority Exchange Network</h1>
            <p className="text-sm text-[#6B7280] mt-1">Credit-based decentralized content-mediated linking</p>
          </div>
          <Link
            href="/dashboard/backlinks"
            className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E5E5] rounded-md hover:bg-[#F3F4F6] transition-colors"
          >
            Back to Distribution
          </Link>
        </div>

        <div className="flex items-center gap-1 mt-6 border-b border-[#E5E5E5] -mb-5">
          {[
            { id: "overview", label: "Overview", icon: TrendingUp },
            { id: "inventory", label: "My Inventory", icon: Globe },
            { id: "find", label: "Find Links", icon: Search },
            { id: "settings", label: "Settings", icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-[#2563EB] text-[#2563EB]"
                  : "border-transparent text-[#6B7280] hover:text-[#1A1A1A]"
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <div className="p-8">
        {activeTab === "overview" && data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white">
                    <Coins className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Credit Balance</p>
                    <p className="text-3xl font-bold text-[#1A1A1A]">{data.credits.balance.toFixed(1)}</p>
                    {data.credits.pending > 0 && (
                      <p className="text-xs text-[#6B7280]">+{data.credits.pending.toFixed(1)} pending</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                    <ArrowUpRight className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Links Given</p>
                    <p className="text-3xl font-bold text-[#1A1A1A]">{data.stats.linksGiven}</p>
                    <p className="text-xs text-[#6B7280]">Earned: {data.credits.lifetimeEarned.toFixed(0)} credits</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                    <ArrowDownLeft className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Links Received</p>
                    <p className="text-3xl font-bold text-[#1A1A1A]">{data.stats.linksReceived}</p>
                    <p className="text-xs text-[#6B7280]">Spent: {data.credits.lifetimeSpent.toFixed(0)} credits</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E5E5] bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Avg Hop Distance</p>
                    <p className="text-3xl font-bold text-[#1A1A1A]">{data.stats.avgHopDistance || 3}</p>
                    <p className="text-xs text-green-600">Google-safe routing</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                <div className="p-5 border-b border-[#E5E5E5]">
                  <h2 className="font-semibold text-[#1A1A1A]">Recent Transactions</h2>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {data.transactions.length === 0 ? (
                    <div className="p-8 text-center text-sm text-[#6B7280]">
                      No transactions yet. Add inventory to start earning credits.
                    </div>
                  ) : (
                    data.transactions.slice(0, 5).map((tx) => (
                      <div key={tx.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex h-8 w-8 items-center justify-center rounded-lg",
                              tx.type === "earned" || tx.type === "bonus"
                                ? "bg-green-100 text-green-600"
                                : tx.type === "spent"
                                ? "bg-red-100 text-red-600"
                                : tx.type === "pending"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-gray-100 text-gray-600"
                            )}
                          >
                            {tx.type === "earned" || tx.type === "bonus" ? (
                              <ArrowDownLeft className="h-4 w-4" />
                            ) : (
                              <ArrowUpRight className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A] capitalize">{tx.type}</p>
                            <p className="text-xs text-[#6B7280] line-clamp-1">{tx.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={cn(
                              "text-sm font-bold",
                              tx.amount > 0 ? "text-green-600" : "text-red-600"
                            )}
                          >
                            {tx.amount > 0 ? "+" : ""}{tx.amount.toFixed(1)}
                          </p>
                          <p className="text-xs text-[#6B7280]">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
                  <h2 className="font-semibold text-[#1A1A1A]">My Inventory Summary</h2>
                  <button
                    onClick={() => setActiveTab("inventory")}
                    className="text-sm text-[#2563EB] hover:underline flex items-center gap-1"
                  >
                    Manage <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-[#F9FAFB] rounded-lg">
                      <p className="text-2xl font-bold text-[#1A1A1A]">{data.inventory.total}</p>
                      <p className="text-xs text-[#6B7280]">Total Pages</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{data.inventory.verified}</p>
                      <p className="text-xs text-[#6B7280]">Verified</p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <p className="text-2xl font-bold text-yellow-600">{data.inventory.pending}</p>
                      <p className="text-xs text-[#6B7280]">Pending</p>
                    </div>
                  </div>

                  {data.inventory.pages.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-[#6B7280] mb-3">No pages in your inventory yet</p>
                      <button
                        onClick={() => setActiveTab("inventory")}
                        className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF]"
                      >
                        <Plus className="h-4 w-4 inline mr-1" /> Add Pages
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {data.inventory.pages.slice(0, 3).map((page) => (
                        <div
                          key={page.id}
                          className="flex items-center justify-between p-3 border border-[#E5E5E5] rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4 text-[#6B7280]" />
                            <span className="text-sm font-medium text-[#1A1A1A]">{page.domain}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                              DR {page.domainRating}
                            </span>
                            <span className="text-xs text-[#6B7280]">
                              {page.creditsPerLink.toFixed(1)} credits/link
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1A1A1A]">How Authority Exchange Works</h3>
                  <ul className="mt-2 text-sm text-[#4B5563] space-y-1">
                    <li>1. Add pages from your sites to the inventory pool to earn credits</li>
                    <li>2. Credits are earned when links are placed and verified as indexed</li>
                    <li>3. Spend credits to receive backlinks from other users inventory</li>
                    <li>4. Smart routing ensures 3+ hop distance (no direct reciprocal patterns)</li>
                    <li>5. All links are content-mediated and contextually placed</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === "inventory" && data && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
              <div className="p-5 border-b border-[#E5E5E5] flex items-center justify-between">
                <h2 className="font-semibold text-[#1A1A1A]">Link Inventory Pool</h2>
                <button className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF] flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Pages
                </button>
              </div>

              {data.inventory.pages.length === 0 ? (
                <div className="p-12 text-center">
                  <Globe className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No pages in your inventory</h3>
                  <p className="text-sm text-[#6B7280] mb-4 max-w-md mx-auto">
                    Add pages from your websites that are eligible to host outbound links.
                    You will earn credits when links are placed on your pages.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Page</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">DR</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Quality</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Credits/Link</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Links</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E5E5]">
                      {data.inventory.pages.map((page) => (
                        <tr key={page.id} className="hover:bg-[#F9FAFB]">
                          <td className="px-6 py-4">
                            <div>
                              <p className="text-sm font-medium text-[#1A1A1A]">{page.domain}</p>
                              <p className="text-xs text-[#6B7280] truncate max-w-xs">{page.pageUrl}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-1 text-xs font-bold rounded bg-blue-100 text-blue-700">
                              {page.domainRating}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-[#E5E5E5] rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-green-500 rounded-full"
                                  style={{ width: `${page.qualityScore}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#6B7280]">{page.qualityScore.toFixed(0)}%</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm font-medium text-[#1A1A1A]">
                              {page.creditsPerLink.toFixed(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-[#6B7280]">
                              {page.currentLinks}/{page.maxLinks}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={cn(
                                "px-2 py-1 text-xs font-medium rounded",
                                page.status === "verified"
                                  ? "bg-green-100 text-green-700"
                                  : page.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {page.status}
                            </span>
                            {page.isIndexed && (
                              <Eye className="h-3.5 w-3.5 text-green-600 inline ml-2" title="Indexed" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "find" && data && (
          <div className="space-y-6">
            <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm p-6">
              <h2 className="font-semibold text-[#1A1A1A] mb-4">Find Available Link Opportunities</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={searchDomain}
                  onChange={(e) => setSearchDomain(e.target.value)}
                  placeholder="Enter your target domain (e.g., example.com)"
                  className="flex-1 px-4 py-2 border border-[#E5E5E5] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <button
                  onClick={searchRoutes}
                  disabled={searchLoading}
                  className="px-6 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF] disabled:opacity-50 flex items-center gap-2"
                >
                  {searchLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  Search
                </button>
              </div>
              <p className="text-xs text-[#6B7280] mt-2">
                Your balance: <span className="font-bold text-[#1A1A1A]">{data.credits.balance.toFixed(1)} credits</span>
              </p>
            </div>

            {routes.length > 0 && (
              <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm">
                <div className="p-5 border-b border-[#E5E5E5]">
                  <h2 className="font-semibold text-[#1A1A1A]">Available Routes ({routes.length})</h2>
                </div>
                <div className="divide-y divide-[#E5E5E5]">
                  {routes.map((route) => (
                    <div key={route.inventoryId} className="p-5 flex items-center justify-between hover:bg-[#F9FAFB]">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Globe className="h-5 w-5 text-[#6B7280]" />
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">{route.domain}</p>
                            <p className="text-xs text-[#6B7280] truncate max-w-md">{route.pageUrl}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                            DR {route.domainRating}
                          </span>
                          <span className="text-xs text-[#6B7280]">
                            Quality: {route.qualityScore.toFixed(0)}%
                          </span>
                          <span className="text-xs text-[#6B7280]">
                            Hop Distance: {route.hopDistance}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            Tier {route.tier}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#1A1A1A]">{route.creditsRequired.toFixed(1)}</p>
                          <p className="text-xs text-[#6B7280]">credits</p>
                        </div>
                        <button
                          onClick={() => requestLink(route)}
                          disabled={data.credits.balance < route.creditsRequired}
                          className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Request Link
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {routes.length === 0 && searchDomain && !searchLoading && (
              <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-[#D1D5DB] mx-auto mb-4" />
                <h3 className="text-lg font-medium text-[#1A1A1A] mb-2">No routes available</h3>
                <p className="text-sm text-[#6B7280] max-w-md mx-auto">
                  No valid link opportunities found for this domain.
                  This could be due to routing restrictions or limited inventory.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "settings" && data && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm p-6">
              <h2 className="font-semibold text-[#1A1A1A] mb-4">Exchange Settings</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-[#E5E5E5]">
                  <div>
                    <p className="text-sm font-medium text-[#1A1A1A]">Auto-Accept Requests</p>
                    <p className="text-xs text-[#6B7280]">Automatically approve incoming link requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={data.settings.autoAccept}
                      className="sr-only peer"
                      readOnly
                    />
                    <div className="w-11 h-6 bg-[#E5E5E5] peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]"></div>
                  </label>
                </div>

                <div className="py-3 border-b border-[#E5E5E5]">
                  <label className="text-sm font-medium text-[#1A1A1A] block mb-2">
                    Minimum Incoming DR
                  </label>
                  <input
                    type="number"
                    value={data.settings.minIncomingDR}
                    className="w-24 px-3 py-2 border border-[#E5E5E5] rounded-md text-sm"
                    readOnly
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Only accept links from sites with DR above this</p>
                </div>

                <div className="py-3 border-b border-[#E5E5E5]">
                  <label className="text-sm font-medium text-[#1A1A1A] block mb-2">
                    Minimum Hop Distance
                  </label>
                  <input
                    type="number"
                    value={data.settings.minHopDistance}
                    className="w-24 px-3 py-2 border border-[#E5E5E5] rounded-md text-sm"
                    readOnly
                  />
                  <p className="text-xs text-[#6B7280] mt-1">Minimum graph distance between source and target (3+ recommended)</p>
                </div>

                <div className="py-3">
                  <p className="text-sm font-medium text-[#1A1A1A] mb-3">Enabled Tiers</p>
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.settings.tier1Enabled} readOnly className="rounded" />
                      Tier 1 (Money Sites)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.settings.tier2Enabled} readOnly className="rounded" />
                      Tier 2 (Buffer)
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={data.settings.tier3Enabled} readOnly className="rounded" />
                      Tier 3 (Amplification)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-[#1A1A1A]">Safety Guidelines</h3>
                  <ul className="mt-2 text-sm text-[#4B5563] space-y-1">
                    <li>Direct A↔B exchanges are automatically blocked</li>
                    <li>Short loops (A→B→A) are detected and prevented</li>
                    <li>Credits decay by 5% monthly if unused</li>
                    <li>Links must stay live for 30 days for full credit</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
