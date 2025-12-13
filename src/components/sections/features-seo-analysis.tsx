import Image from "next/image";
import Link from "next/link";

export default function FeaturesSeoAnalysis() {
  return (
    <section className="container mx-auto max-w-[1376px] px-4 py-8 md:py-12 lg:py-20">
      <div className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-between">
        <div className="space-y-4 rounded-[40px] bg-gradient-to-br from-[#F0FDF4] to-[#BBF7D0] px-5 py-6 md:max-w-[451px] lg:max-w-[531px] lg:space-y-8 lg:px-10 lg:py-11">
          <div className="space-y-4">
            <h4 className="font-['Plus_Jakarta_Sans',sans-serif] text-2xl font-semibold leading-[1.3] tracking-[-1.2px] text-black lg:text-[40px]">
              Find high-value keywords & grow traffic effortlessly
            </h4>
            <p className="font-['Inter',sans-serif] text-base font-normal leading-[1.6] tracking-[-0.09px] text-[#64748B] lg:text-lg">
              Get instant keyword suggestions, content ideas, and SEO improvement tips — powered by real-time AI intelligence.
            </p>
          </div>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 rounded-full bg-[#4ADE80] px-3 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-[#22C55E] sm:px-4 sm:text-sm"
          >
            <span>Start for Free</span>
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/svgs/white-arrow_dd1ae13e-3.svg"
              alt="btn arrow"
              width={20}
              height={20}
              className="h-[14px] w-[14px] sm:h-5 sm:w-5"
            />
          </Link>
        </div>
        <div className="w-full xl:max-w-[598px]">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Untitled-design-2-1765615394881.png?width=8000&height=8000&resize=contain"
            alt="feature image"
            width={800}
            height={600}
            className="h-auto w-full max-w-full"
            priority
          />
        </div>
      </div>
    </section>
  );
}