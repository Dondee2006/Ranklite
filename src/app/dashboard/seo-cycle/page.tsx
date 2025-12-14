"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SEOCycle {
  id: string;
  name: string;
  status: "Active" | "Paused" | "Completed";
  posts_generated: number;
  backlinks_generated: number;
  started_date: string;
}

const CYCLES: SEOCycle[] = [
  {
    id: "1",
    name: "December SEO Cycle",
    status: "Active",
    posts_generated: 12,
    backlinks_generated: 45,
    started_date: "Dec 1, 2025",
  },
  {
    id: "2",
    name: "November SEO Cycle",
    status: "Completed",
    posts_generated: 15,
    backlinks_generated: 68,
    started_date: "Nov 1, 2025",
  },
];

const STATUS_COLORS = {
  Active: "bg-[#D1FAE5] text-[#065F46]",
  Paused: "bg-[#FEF3C7] text-[#92400E]",
  Completed: "bg-[#E5E7EB] text-[#1F2937]",
};

export default function SEOCyclePage() {
  const [expandedCycle, setExpandedCycle] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">SEO Cycle</h1>
        </div>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Cycle Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Posts Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Backlinks Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Started
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {CYCLES.map((cycle) => (
                  <tr key={cycle.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-[#1A1A1A]">{cycle.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                        STATUS_COLORS[cycle.status]
                      )}>
                        {cycle.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#6B7280]">{cycle.posts_generated}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#6B7280]">{cycle.backlinks_generated}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#6B7280]">{cycle.started_date}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setExpandedCycle(expandedCycle === cycle.id ? null : cycle.id)}
                        className="inline-flex items-center gap-1 text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {expandedCycle && (
          <div className="mt-6 rounded-lg border border-[#E5E5E5] bg-white shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Cycle Tasks</h2>
            <div className="space-y-3">
              {[
                { name: "Content Generation", status: "Completed", timestamp: "Dec 5, 2025" },
                { name: "Publishing", status: "Completed", timestamp: "Dec 7, 2025" },
                { name: "Backlink Generation", status: "In Progress", timestamp: "Dec 10, 2025" },
                { name: "QA Validation", status: "Pending", timestamp: "-" },
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-md border border-[#E5E5E5]">
                  <div>
                    <div className="text-sm font-medium text-[#1A1A1A]">{task.name}</div>
                    <div className="text-xs text-[#6B7280] mt-1">{task.timestamp}</div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                    task.status === "Completed" ? "bg-[#D1FAE5] text-[#065F46]" :
                    task.status === "In Progress" ? "bg-[#DBEAFE] text-[#1E40AF]" :
                    "bg-[#F3F4F6] text-[#6B7280]"
                  )}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
