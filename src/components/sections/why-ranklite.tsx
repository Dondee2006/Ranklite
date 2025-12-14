export default function WhyRanklite() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-[#FAFFFE] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-[1200px]">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="font-display text-[32px] sm:text-[40px] lg:text-[52px] font-bold leading-[1.1] tracking-tight text-[#0D0D12] mb-4">
            WHY <span className="text-[#22C55E]">RANKLITE</span>
          </h2>
          <p className="text-[#64748B] text-lg sm:text-xl max-w-[600px] mx-auto">
            Most SEO tools give you data. Ranklite does the work.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="bg-white rounded-[24px] md:rounded-[32px] border border-gray-200 shadow-lg overflow-hidden">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-[#FAFFFE] to-[#F0FDF4]">
                  <th className="text-left py-6 px-8 font-display text-lg font-bold text-[#0D0D12]">
                    Feature
                  </th>
                  <th className="text-center py-6 px-8 font-display text-lg font-bold text-[#64748B]">
                    Traditional SEO
                  </th>
                  <th className="text-center py-6 px-8 font-display text-lg font-bold text-[#22C55E]">
                    Ranklite
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-5 px-8 text-[#0D0D12] font-medium">Content Planning</td>
                  <td className="py-5 px-8 text-center text-[#64748B]">You plan content</td>
                  <td className="py-5 px-8 text-center text-[#22C55E] font-semibold">Content auto-planned</td>
                </tr>
                <tr className="border-b border-gray-100 bg-[#FAFFFE]/50">
                  <td className="py-5 px-8 text-[#0D0D12] font-medium">Content Creation</td>
                  <td className="py-5 px-8 text-center text-[#64748B]">You write or hire writers</td>
                  <td className="py-5 px-8 text-center text-[#22C55E] font-semibold">Content auto-generated</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-5 px-8 text-[#0D0D12] font-medium">Publishing</td>
                  <td className="py-5 px-8 text-center text-[#64748B]">You publish manually</td>
                  <td className="py-5 px-8 text-center text-[#22C55E] font-semibold">Auto-published</td>
                </tr>
                <tr className="border-b border-gray-100 bg-[#FAFFFE]/50">
                  <td className="py-5 px-8 text-[#0D0D12] font-medium">Backlinks</td>
                  <td className="py-5 px-8 text-center text-[#64748B]">You chase backlinks</td>
                  <td className="py-5 px-8 text-center text-[#22C55E] font-semibold">Backlinks auto-built</td>
                </tr>
                <tr>
                  <td className="py-5 px-8 text-[#0D0D12] font-medium">Link Verification</td>
                  <td className="py-5 px-8 text-center text-[#64748B]">You hope links work</td>
                  <td className="py-5 px-8 text-center text-[#22C55E] font-semibold">Links verified & tracked</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-gray-100">
            <div className="p-6">
              <div className="mb-3 font-display text-base font-bold text-[#0D0D12]">Content Planning</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Traditional SEO:</span>
                  <span className="text-sm text-[#64748B]">You plan content</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#22C55E]">Ranklite:</span>
                  <span className="text-sm font-semibold text-[#22C55E]">Content auto-planned</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#FAFFFE]/50">
              <div className="mb-3 font-display text-base font-bold text-[#0D0D12]">Content Creation</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Traditional SEO:</span>
                  <span className="text-sm text-[#64748B]">You write or hire writers</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#22C55E]">Ranklite:</span>
                  <span className="text-sm font-semibold text-[#22C55E]">Content auto-generated</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-3 font-display text-base font-bold text-[#0D0D12]">Publishing</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Traditional SEO:</span>
                  <span className="text-sm text-[#64748B]">You publish manually</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#22C55E]">Ranklite:</span>
                  <span className="text-sm font-semibold text-[#22C55E]">Auto-published</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-[#FAFFFE]/50">
              <div className="mb-3 font-display text-base font-bold text-[#0D0D12]">Backlinks</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Traditional SEO:</span>
                  <span className="text-sm text-[#64748B]">You chase backlinks</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#22C55E]">Ranklite:</span>
                  <span className="text-sm font-semibold text-[#22C55E]">Backlinks auto-built</span>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-3 font-display text-base font-bold text-[#0D0D12]">Link Verification</div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[#64748B]">Traditional SEO:</span>
                  <span className="text-sm text-[#64748B]">You hope links work</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-[#22C55E]">Ranklite:</span>
                  <span className="text-sm font-semibold text-[#22C55E]">Links verified & tracked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
