"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, AlertCircle, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ValidationRecord {
  id: string;
  source: string;
  http_status: number;
  anchor_found: boolean;
  link_type: "Dofollow" | "Nofollow";
  indexing_status: "Indexed" | "Pending" | "Not Indexed";
  verification_status: "Verified" | "Warning" | "Failed";
  last_checked: string;
}

const VERIFICATION_COLORS = {
  Verified: "bg-[#D1FAE5] text-[#065F46]",
  Warning: "bg-[#FEF3C7] text-[#92400E]",
  Failed: "bg-[#FEE2E2] text-[#991B1B]",
};

const VERIFICATION_ICONS = {
  Verified: CheckCircle,
  Warning: AlertTriangle,
  Failed: AlertCircle,
};

export default function QAValidationPage() {
  const [records, setRecords] = useState<ValidationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  useEffect(() => {
    loadRecords();
  }, []);

  async function loadRecords() {
    setLoading(true);
    try {
      const response = await fetch("/api/qa-validation");
      const data = await response.json();
      setRecords(data.records || []);
    } catch (error) {
      console.error("Failed to load validation records:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredRecords = records.filter(r => {
    if (filterStatus && r.verification_status !== filterStatus) return false;
    return true;
  });

  const stats = {
    verified: records.filter(r => r.verification_status === "Verified").length,
    warning: records.filter(r => r.verification_status === "Warning").length,
    failed: records.filter(r => r.verification_status === "Failed").length,
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">QA & Validation</h1>
          <select
            value={filterStatus || ""}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-1.5 text-sm border border-[#E5E5E5] rounded-md bg-white text-[#6B7280]"
          >
            <option value="">All Status</option>
            <option value="Verified">Verified</option>
            <option value="Warning">Warning</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-lg border border-[#D1FAE5] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Verified</p>
                <p className="text-2xl font-bold text-[#065F46]">{stats.verified}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-[#10B981]" />
            </div>
          </div>
          <div className="rounded-lg border border-[#FEF3C7] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Warning</p>
                <p className="text-2xl font-bold text-[#92400E]">{stats.warning}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-[#FCD34D]" />
            </div>
          </div>
          <div className="rounded-lg border border-[#FEE2E2] bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#6B7280]">Failed</p>
                <p className="text-2xl font-bold text-[#991B1B]">{stats.failed}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-[#F87171]" />
            </div>
          </div>
        </div>

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
                      HTTP Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Anchor Found
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Link Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Indexing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Verification
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Last Checked
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                        No validation records found
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => {
                      const Icon = VERIFICATION_ICONS[record.verification_status];
                      return (
                        <tr key={record.id} className="hover:bg-[#F9FAFB] transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-[#1A1A1A]">{record.source}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                              record.http_status === 200 ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#FEE2E2] text-[#991B1B]"
                            )}>
                              {record.http_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-sm font-medium",
                              record.anchor_found ? "text-[#10B981]" : "text-[#DC2626]"
                            )}>
                              {record.anchor_found ? "Yes" : "No"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                              record.link_type === "Dofollow" ? "bg-[#D1FAE5] text-[#065F46]" : "bg-[#F3F4F6] text-[#6B7280]"
                            )}>
                              {record.link_type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                              record.indexing_status === "Indexed" ? "bg-[#D1FAE5] text-[#065F46]" :
                              record.indexing_status === "Pending" ? "bg-[#FEF3C7] text-[#92400E]" :
                              "bg-[#F3F4F6] text-[#6B7280]"
                            )}>
                              {record.indexing_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-medium",
                              VERIFICATION_COLORS[record.verification_status]
                            )}>
                              <Icon className="h-3.5 w-3.5" />
                              {record.verification_status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-[#6B7280]">{record.last_checked}</div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              href={`/dashboard/qa-validation/${record.id}`}
                              className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
                            >
                              View Details
                            </Link>
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
