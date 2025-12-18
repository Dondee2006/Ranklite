import Link from "next/link";
import { ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "AI creates & publishes content",
    description: "Ranklite generates a 30-day SEO content plan and auto-publishes optimized blog posts directly to your site.",
    subtext: "No writing. No scheduling. No CMS headaches.",
  },
  {
    number: "02",
    title: "Every post gets promoted with backlinks",
    description: "Each article is supported with automated, dofollow backlinks from real websites.",
    subtext: "Not random links. Not exchanges. Backlinks tied directly to ranking pages.",
  },
  {
    number: "03",
    title: "QA, indexing & performance tracking",
    description: "We verify links, check indexing, flag failures, and track quality — so you're never guessing if SEO \"worked\".",
    subtext: "SEO with receipts.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFFFE] py-16 lg:py-28" id="howitworks">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-[#DCFCE7]/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#D1FAE5]/30 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[600px]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#16A34A]">
              How it works
            </span>
            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
              Here&apos;s where the{" "}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                magic
              </span>{" "}
              happens
            </h2>
          </div>

          <div className="flex max-w-[380px] flex-col items-start gap-5 lg:items-end lg:text-right">
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              Leave SEO to us — we generate high-performing content daily to help you outrank competitors effortlessly.
            </p>
            <a
              href="https://whop.com/checkout/plan_VU6iG0GPMen3j"
              target="_blank"
              rel="noopener noreferrer"
              className="group hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 lg:flex"
            >
              Start Generating Backlinks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.03] transition-all hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl"
            >
              <div className="absolute right-4 top-4 text-[48px] font-bold leading-none text-[#F0FDF4] transition-colors group-hover:text-[#DCFCE7]" style={{ fontFamily: "var(--font-display)" }}>
                {step.number}
              </div>

              <div className="pr-16">
                <h4 className="mb-3 font-display text-[20px] font-bold tracking-tight text-foreground lg:text-[22px]">
                  {step.title}
                </h4>
                <p className="mb-4 text-[15px] leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <p className="text-[14px] font-medium leading-relaxed text-[#22C55E]">
                  {step.subtext}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
<a
              href="https://whop.com/checkout/plan_VU6iG0GPMen3j"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20"
            >
              Start Generating Backlinks
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
        </div>
      </div>
    </section>
  );
}