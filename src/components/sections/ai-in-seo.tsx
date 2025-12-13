import Image from "next/image";
import { Sparkles, Rocket } from "lucide-react";

export default function AIInSEO() {
  return (
    <section className="py-20 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 max-w-[1376px]">
        {/* Header Section */}
        <div className="text-center max-w-[800px] mx-auto mb-16 relative">
          <p className="text-xs font-bold tracking-[1.44px] text-[#86EFAC] uppercase mb-4 sm:mb-6">
            AI IN SEO
          </p>
          <h2 className="font-display text-[32px] sm:text-[40px] md:text-5xl lg:text-[56px] font-bold leading-[1.15] tracking-tight mb-6 text-[#0D0D12]">
            Get <span className="text-[#22C55E]">Your Business</span> Recommended by <span className="text-[#22C55E]">AI</span>
          </h2>
          <p className="text-[#64748B] text-base sm:text-lg md:text-xl leading-relaxed max-w-[500px] mx-auto">
            AI surfaces businesses with strong SEO signals. Learn how it works—and how to stay ahead.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 gap-6 lg:gap-8 xl:gap-10">
          {/* Card - Two Column Layout */}
          <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-200 p-6 sm:p-8 md:p-10 lg:p-[48px] relative overflow-hidden group shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Left Column - New Text */}
              <div className="z-10">
                <h3 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.3] mb-4 text-[#22C55E] tracking-tight">
                  How AI decides what to recommend
                </h3>
                <p className="text-[#64748B] text-base sm:text-[17px] leading-[1.6]">
                  AI assistants rely on search engine results to answer questions. Websites that rank higher through strong SEO are more likely to be referenced and recommended in AI-generated responses.
                </p>
              </div>

              {/* Right Column - Existing Content */}
              <div className="z-10">
                <div className="w-12 h-12 bg-[#F0FDF4] rounded-[14px] flex items-center justify-center mb-6 sm:mb-8 border border-[#BBF7D0]">
                  <Rocket className="w-6 h-6 text-[#4ADE80]" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.3] mb-4 text-[#22C55E] tracking-tight">
                  SEO that works beyond search
                </h3>
                <p className="text-[#64748B] text-base sm:text-[17px] leading-[1.6]">
                  We create optimized articles and SEO tools designed around proven keywords. One well-executed asset can power thousands of AI recommendations—giving your brand nonstop exposure across the web.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}