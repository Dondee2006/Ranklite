import Link from "next/link";
import { Check, ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Pricing() {
  const features = [
    "30 SEO-optimized articles monthly",
    "Unlimited team members",
    "Automated keyword research",
    "WordPress, Webflow, Shopify integrations",
    "High DR backlink building",
    "AI-generated custom images",
    "YouTube video integration",
    "150+ language support",
    "Unlimited AI rewrites",
    "Priority feature requests",
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFFFE] to-white py-20 lg:py-32" id="pricing">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-30 blur-3xl" />
        <div className="absolute -right-20 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mx-auto mb-14 max-w-[700px] text-center lg:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
            <Zap className="h-3.5 w-3.5" />
            Pricing
          </span>
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
            Grow organic traffic on{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-transparent">
              autopilot
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-muted-foreground lg:text-[18px]">
            Ranklite scales your SEO rankings while you focus on what matters most — growing your business.
          </p>
        </div>

        <div className="mx-auto max-w-[540px]">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-white p-8 shadow-2xl shadow-black/[0.04] lg:p-10">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#22C55E]/10 to-[#10B981]/10 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br from-[#10B981]/10 to-[#22C55E]/10 blur-2xl" />

            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-lg shadow-green-500/20">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-[22px] font-bold tracking-tight text-foreground">
                    Growth Plan
                  </h3>
                  <p className="text-[14px] text-muted-foreground">For ambitious entrepreneurs</p>
                </div>
              </div>

              <div className="mt-8 flex items-baseline gap-2">
                <span className="font-display text-[56px] font-bold tracking-tight text-foreground">$99</span>
                <span className="text-[20px] text-muted-foreground line-through decoration-muted-foreground/40">$200</span>
                <span className="text-[16px] text-muted-foreground">/month</span>
              </div>

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#DCFCE7] px-3 py-1 text-[13px] font-semibold text-[#16A34A]">
                <Check className="h-3.5 w-3.5" />
                Cancel anytime. No questions asked.
              </div>

              <div className="my-8 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

              <div>
                <p className="mb-5 text-[14px] font-semibold text-foreground">What&apos;s included:</p>
                <ul className="space-y-3.5">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A]">
                        <Check className="h-3 w-3 text-white" strokeWidth={3} />
                      </div>
                      <span className="text-[15px] leading-relaxed text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/login"
                className="group mt-10 flex w-full items-center justify-center gap-2.5 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] py-4 text-[16px] font-semibold text-white shadow-xl shadow-green-500/20 transition-all hover:shadow-2xl hover:shadow-green-500/30"
              >
                Start Your Free Trial
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}