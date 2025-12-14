"use client";

export default function AuditLogsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Audit Logs</h1>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Resource
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                    No audit logs yet
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
