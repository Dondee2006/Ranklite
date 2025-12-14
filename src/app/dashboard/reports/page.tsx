"use client";

import { Download } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Reports</h1>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Report Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    SEO Cycle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    No reports generated yet
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
