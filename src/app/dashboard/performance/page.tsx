"use client";

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Performance</h1>
      </header>

      <div className="p-8">
        <div className="space-y-6">
          <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
            <div className="border-b border-[#E5E5E5] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Indexed Pages</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Page URL</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Impressions</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Position</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6B7280]">
                      No performance data available yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
            <div className="border-b border-[#E5E5E5] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Top Pages by Impressions</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Page</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Impressions</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Clicks</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-[#6B7280]">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
            <div className="border-b border-[#E5E5E5] px-6 py-4">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Backlinks per Page Summary</h2>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Page</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Backlinks</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-[#6B7280] uppercase">Avg DR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-[#6B7280]">
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-[#FEF3C7] bg-[#FFFBEB] p-4">
            <p className="text-sm text-[#92400E]">
              <strong>Note:</strong> Performance metrics are SEO signals, not guarantees. Rankings and traffic depend on many factors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
