"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { WelcomeBanner } from "@/components/dashboard/upgrade-cta";

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
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/dashboard/activities");
      if (!response.ok) {
        throw new Error("Failed to fetch activities");
      }
      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      setError("Unable to load activities. Please try again.");
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
      <header className="border-b border-[#E5E5E5] bg-white px-4 sm:px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-semibold text-[#1A1A1A]">Dashboard</h1>
        </div>
      </header>

      <div className="p-4 sm:p-8">
        <div className="mb-6">
          <WelcomeBanner />
        </div>

        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#6B7280]" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 px-4">
              <AlertCircle className="h-12 w-12 text-[#EF4444]" />
              <p className="text-sm text-[#6B7280] text-center">{error}</p>
              <button
                onClick={loadActivities}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF]"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden sm:table-cell">
                        Type
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden md:table-cell">
                        SEO Cycle
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider hidden lg:table-cell">
                        Last Updated
                      </th>
                      <th className="px-3 sm:px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E5E5E5]">
                    {currentActivities.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-sm text-[#6B7280]">
                          No SEO activities yet. Start by creating your first article or backlink campaign.
                        </td>
                      </tr>
                    ) : (
                      currentActivities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A] truncate max-w-[150px] sm:max-w-none">{activity.name}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden sm:table-cell">
                            <div className="text-sm text-[#6B7280]">{activity.type}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-md text-xs font-medium",
                              STATUS_COLORS[activity.status]
                            )}>
                              {activity.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden md:table-cell">
                            <div className="text-sm text-[#6B7280]">{activity.cycle}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 hidden lg:table-cell">
                            <div className="text-sm text-[#6B7280]">{activity.last_updated}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-right">
                            <Link
                              href={
                                activity.type === "Content"
                                  ? `/dashboard/content`
                                  : activity.type === "Backlink"
                                    ? `/dashboard/backlinks`
                                    : `/dashboard/content-planner`
                              }
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
                <div className="flex flex-col sm:flex-row items-center justify-between border-t border-[#E5E5E5] px-4 sm:px-6 py-4 gap-4">
                  <div className="text-sm text-[#6B7280]">
                    Showing {startIndex + 1} to {Math.min(endIndex, activities.length)} of {activities.length} results
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
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