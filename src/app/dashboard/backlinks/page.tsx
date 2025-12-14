"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Backlink {
  id: string;
  source_name: string;
  linking_url: string;
  target_post: string;
  anchor_text: string;
  domain_rating: number;
  status: "Live" | "Pending" | "Failed";
  added_date: string;
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

export default function BacklinksPage() {
  const [backlinks, setBacklinks] = useState<Backlink[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterDR, setFilterDR] = useState<number | null>(null);

  useEffect(() => {
    loadBacklinks();
  }, []);

  async function loadBacklinks() {
    setLoading(true);
    try {
      const response = await fetch("/api/backlinks");
      const data = await response.json();
      setBacklinks(data.backlinks || []);
    } catch (error) {
      console.error("Failed to load backlinks:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredBacklinks = backlinks.filter(b => {
    if (filterStatus && b.status !== filterStatus) return false;
    if (filterDR && b.domain_rating < filterDR) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Backlinks</h1>
          <div className="flex items-center gap-3">
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
            <select
              value={filterDR || ""}
              onChange={(e) => setFilterDR(e.target.value ? parseInt(e.target.value) : null)}
              className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-md bg-white text-[#6B7280]"
            >
              <option value="">All DR</option>
              <option value="50">DR 50+</option>
              <option value="70">DR 70+</option>
            </select>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Linking URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Target Post
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Anchor Text
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      DR
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Added
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredBacklinks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                        No backlinks found
                      </td>
                    </tr>
                  ) : (
                    filteredBacklinks.map((backlink) => (
                      <tr key={backlink.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1A1A1A]">{backlink.source_name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={backlink.linking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#2563EB] hover:text-[#1E40AF] underline"
                          >
                            {backlink.linking_url.slice(0, 40)}...
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{backlink.target_post}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{backlink.anchor_text}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold w-10",
                            getDRColor(backlink.domain_rating)
                          )}>
                            {backlink.domain_rating}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                            STATUS_COLORS[backlink.status]
                          )}>
                            {backlink.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{backlink.added_date}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/backlinks/${backlink.id}`}
                              className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
                            >
                              View
                            </Link>
                            {backlink.status === "Failed" && (
                              <button className="text-sm font-medium text-[#DC2626] hover:text-[#991B1B]">
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
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
