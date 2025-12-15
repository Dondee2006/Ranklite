"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { UpgradeCTA } from "@/components/dashboard/upgrade-cta";
import { SEOCycleVisual } from "@/components/dashboard/seo-cycle-visual";

interface Activity {
  id: string;
  name: string;
  type: "Content" | "Backlink" | "Validation";
  status: "Planned" | "Published" | "Promoted" | "Verified" | "Pending" | "Failed";
  cycle: string;
  last_updated: string;
}

const STATUS_COLORS = {
  Planned: "bg-[#F3F4F6] text-[#6B7280]",
  Published: "bg-[#DBEAFE] text-[#1E40AF]",
  Promoted: "bg-[#D1FAE5] text-[#065F46]",
  Verified: "bg-[#D1FAE5] text-[#065F46]",
  Pending: "bg-[#FEF3C7] text-[#92400E]",
  Failed: "bg-[#FEE2E2] text-[#991B1B]",
};

export default function DashboardOverviewPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    try {
      const response = await fetch("/api/dashboard/activities");
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to load activities:", error);
    } finally {
      setLoading(false);
    }
  }

  const totalPages = Math.ceil(activities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentActivities = activities.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Dashboard</h1>
        </div>
      </header>

      <div className="p-8">
        <div className="mb-6">
          <SEOCycleVisual />
        </div>

        <div className="mb-6">
          <UpgradeCTA />
        </div>
        
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        SEO Cycle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Last Updated
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {currentActivities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                          No SEO activities yet
                        </td>
                      </tr>
                    ) : (
                      currentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A]">{activity.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#6B7280]">{activity.type}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                              STATUS_COLORS[activity.status]
                            )}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#6B7280]">{activity.cycle}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#6B7280]">{activity.last_updated}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/dashboard/${activity.type.toLowerCase()}/${activity.id}`}
                              className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {activities.length > itemsPerPage && (
                <div className="flex items-center justify-between border-t border-[#E5E5E5] px-6 py-4">
                  <div className="text-sm text-[#6B7280]">
                    Showing {startIndex + 1} to {Math.min(endIndex, activities.length)} of {activities.length} results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "px-3 py-1.5 text-sm font-medium rounded-md",
                            currentPage === page
                              ? "bg-[#2563EB] text-white"
                              : "text-[#6B7280] bg-white border border-[#E5E5E5] hover:bg-[#F9FAFB]"
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}