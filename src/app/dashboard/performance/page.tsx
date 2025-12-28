"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  ArrowUpRight,
  Globe,
  BarChart3,
  Link2,
  ExternalLink,
  FileText,
  TrendingUp,
  MousePointer2,
  Eye,
  ArrowDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GSCData {
  id: string;
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  page_url?: string;
}

interface BacklinkSummary {
  title: string;
  slug: string;
  count: number;
  avgDR: number;
}

export default function PerformancePage() {
  const [data, setData] = useState<{
    gsc: GSCData[];
    backlinks: BacklinkSummary[];
    siteUrl: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, []);

  async function fetchPerformance() {
    try {
      const response = await fetch("/api/dashboard/performance");
      if (!response.ok) throw new Error("Failed to fetch performance data");
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error loading performance data:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
      </div>
    );
  }

  const totalClicks = data?.gsc?.reduce((sum, item) => sum + item.clicks, 0) || 0;
  const totalImpressions = data?.gsc?.reduce((sum, item) => sum + item.impressions, 0) || 0;
  const avgPos = data?.gsc?.length ? (data.gsc.reduce((sum, item) => sum + item.position, 0) / data.gsc.length).toFixed(1) : "0.0";
  const avgCtr = data?.gsc?.length ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div>
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Performance</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            Search console and backlink metrics for {data?.siteUrl}
          </p>
        </div>
      </header>

      <div className="p-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            icon={<MousePointer2 className="h-5 w-5" />}
            color="blue"
          />
          <StatCard
            title="Total Impressions"
            value={totalImpressions.toLocaleString()}
            icon={<Eye className="h-5 w-5" />}
            color="purple"
          />
          <StatCard
            title="Avg. Position"
            value={avgPos}
            icon={<TrendingUp className="h-5 w-5" />}
            color="green"
          />
          <StatCard
            title="Avg. CTR"
            value={`${avgCtr}% `}
            icon={<BarChart3 className="h-5 w-5" />}
            color="orange"
          />
        </div>

        {/* GSC Performance Table */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F9FAFB]">
            <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Search className="h-4 w-4 text-[#22C55E]" />
              Search Performance (Last 30 Days)
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Date</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Clicks</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Impressions</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">CTR</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Position</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {!data?.gsc?.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#6B7280]">
                      No Search Console data available yet.
                    </td>
                  </tr>
                ) : (
                  data?.gsc.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-medium">{item.clicks}</td>
                      <td className="px-6 py-4">{item.impressions.toLocaleString()}</td>
                      <td className="px-6 py-4">{(item.ctr * 100).toFixed(2)}%</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-bold",
                          item.position <= 10 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                        )}>
                          {item.position.toFixed(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Backlinks Summary Table */}
        <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E5E5] bg-[#F9FAFB]">
            <h2 className="font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Link2 className="h-4 w-4 text-[#22C55E]" />
              Backlinks per Page Summary
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Article</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Total Backlinks</th>
                  <th className="px-6 py-3 text-left font-medium text-[#6B7280]">Avg. Domain Rating</th>
                  <th className="px-6 py-3 text-right font-medium text-[#6B7280]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {!data?.backlinks?.length ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#6B7280]">
                      No backlink data available yet.
                    </td>
                  </tr>
                ) : (
                  data?.backlinks.map((item, i) => (
                    <tr key={i} className="hover:bg-[#F9FAFB]">
                      <td className="px-6 py-4">
                        <p className="font-medium text-[#1A1A1A]">{item.title}</p>
                        <p className="text-xs text-[#6B7280]">/{item.slug}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#22C55E]">{item.count}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2 py-1 rounded-md text-xs font-bold",
                          item.avgDR >= 50 ? "bg-green-100 text-green-700" : "bg-green-50 text-[#22C55E]"
                        )}>
                          DR {item.avgDR}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => window.open(`${data?.siteUrl}/${item.slug}`, '_blank')}
                          className="text-[#22C55E] hover:text-[#16A34A] transition-colors p-2 rounded-lg hover:bg-green-50"
                        >
                          <FileText className="h-5 w-5 text-[#22C55E]" />
                        </button >
                      </td >
                    </tr >
                  ))
                )}
              </tbody >
            </table >
          </div >
        </div >
      </div >
    </div >
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-green-50 text-[#22C55E]",
    purple: "bg-emerald-50 text-emerald-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E5E5E5] shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={cn("p-2 rounded-lg", colors[color])}>
          {icon}
        </div>
        <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
          <ArrowUpRight className="h-3 w-3" />
          <span>+12%</span>
        </div>
      </div>
      <p className="text-sm font-medium text-[#6B7280]">{title}</p>
      <p className="text-2xl font-bold text-[#1A1A1A] mt-1">{value}</p>
    </div>
  );
}
