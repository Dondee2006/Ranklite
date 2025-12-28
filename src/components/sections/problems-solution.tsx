import Image from "next/image";
import { TrendingUp, Check } from "lucide-react";

function RankliteLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-white/20 to-white/10">
        <TrendingUp className="h-4 w-4 text-white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-white" style={{ fontFamily: "var(--font-display)" }}>
        Ranklite
      </span>
    </div>
  );
}

export default function ProblemsSolution() {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-40 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-30 blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-[1100px] px-5 md:px-8">
        <div className="mx-auto max-w-[500px] text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
            Problems & Solution
          </span>
          <h2 className="font-display text-[28px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-[36px] lg:text-[44px]">
            Your pain points
            <br />
            <span className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-transparent">→ Our solution engine</span>
          </h2>
        </div>

        <div className="mt-12 grid items-start gap-6 lg:mt-16 lg:grid-cols-2 lg:gap-10">
          <div className="relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-[#FEE2E2]/50 via-transparent to-[#FEF3C7]/50 opacity-60 blur-xl" />
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/ChatGPT-Image-Dec-10-2025-03_48_02-PM-1765370940797.png"
                alt="User problems"
                width={520}
                height={500}
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#15803D] p-6 shadow-2xl shadow-green-500/20 lg:rounded-3xl lg:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#10B981]/20 blur-2xl" />

            <RankliteLogo />

            <div className="relative mt-5 overflow-hidden rounded-xl bg-white p-5 shadow-lg lg:mt-6 lg:rounded-2xl lg:p-6">
              <p className="text-[15px] font-medium text-foreground lg:text-[17px]">
                The AI-powered SEO engine that replaces your entire content toolkit.
              </p>

              <ul className="mt-5 space-y-3">
                {[
                  "Smart Keyword Discovery",
                  "SEO-Optimized Articles",
                  "Automatic Content Scoring",
                  "AI Images & Media",
                  "Multi-Language Publishing",
                  "Automated Link Exchange",
                  "On-Page Recommendations",
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A]">
                      <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[14px] font-medium text-foreground lg:text-[15px]">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}