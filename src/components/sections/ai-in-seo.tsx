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
            Make AI recommending <br className="hidden md:block" />
            <span className="text-[#4ADE80]">Your Business</span>
          </h2>
          <p className="text-[#64748B] text-base sm:text-lg md:text-xl leading-relaxed max-w-[500px] mx-auto">
            AI chooses businesses based on SEO. Learn how and get ahead
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 xl:gap-10">
          {/* Left Card - Dark */}
          <div className="rounded-[24px] md:rounded-[32px] bg-[#0B0F17] p-6 sm:p-8 md:p-10 lg:p-[48px] flex flex-col justify-between items-start text-left relative overflow-hidden group shadow-2xl transition-transform duration-300 hover:-translate-y-1">
            <div className="w-full z-10">
              <div className="w-12 h-12 bg-white/10 rounded-[14px] flex items-center justify-center mb-6 sm:mb-8 backdrop-blur-md border border-white/5 shadow-inner">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.3] mb-4 text-[#FFD233] tracking-tight">
                How AI chooses what to recommend?
              </h3>
              <p className="text-white/70 text-base sm:text-[17px] leading-[1.6] mb-8 sm:mb-12 max-w-[90%]">
                When users ask questions to AI assistants, these tools scan web
                search results. Pages with better SEO rankings appear more often
                in AI responses.
              </p>
            </div>
            <div className="w-full relative rounded-xl overflow-hidden shadow-2xl border border-white/10 mt-auto">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/images_26.png"
                alt="ChatGPT search result example showing top rankings"
                width={600}
                height={400}
                className="w-full h-auto object-cover transform group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            </div>
          </div>

          {/* Right Card - Light */}
          <div className="rounded-[24px] md:rounded-[32px] bg-white border border-gray-200 p-6 sm:p-8 md:p-10 lg:p-[48px] flex flex-col justify-between items-start text-left relative overflow-hidden group shadow-sm transition-transform duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="w-full z-10">
              <div className="w-12 h-12 bg-[#F0FDF4] rounded-[14px] flex items-center justify-center mb-6 sm:mb-8 border border-[#BBF7D0]">
                <Rocket className="w-6 h-6 text-[#4ADE80]" strokeWidth={1.5} />
              </div>
              <h3 className="font-display text-[24px] sm:text-[28px] lg:text-[32px] font-bold leading-[1.3] mb-4 text-[#4ADE80] tracking-tight">
                What we create for your SEO?
              </h3>
              <p className="text-[#64748B] text-base sm:text-[17px] leading-[1.6] mb-8 sm:mb-12 max-w-[95%]">
                We create two types of content - articles and SEO tools based on
                keywords that work for your business. One well-researched article
                or SEO tool can appear in thousands of AI responses. It&apos;s
                strategic promotion that works 24/7 worldwide.
              </p>
            </div>
            <div className="w-full relative mt-auto pl-2">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/images_27.png"
                alt="Flowchart showing content distribution to various AI models like Claude, Bard and ChatGPT"
                width={600}
                height={400}
                className="w-full h-auto object-contain transform group-hover:scale-[1.03] transition-transform duration-500 ease-out"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}