"use client";

import Link from "next/link";
import { ArrowRight, Link2, BarChart3, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function BoostVisibility() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleAuthClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault();
      window.location.href = "/dashboard/overview";
    }
  };

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 top-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-30 blur-3xl" />
        <div className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-20 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mb-14 flex flex-col justify-between gap-8 lg:mb-20 lg:flex-row lg:items-end">
          <div className="max-w-[700px]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
              <Link2 className="h-3.5 w-3.5" />
              Boost Visibility
            </span>
            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
              Boost your domain authority with{" "}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                AI-Powered Backlink Generation
              </span>
            </h2>
            <p className="mt-5 max-w-[550px] text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]">
              Join Ranklite&apos;s automated backlink generator and build high-quality links that increase your rankings, domain trust, and organic traffic — without cold outreach or manual submissions.
            </p>
            <p className="mt-4 flex items-center gap-2 text-[15px] font-medium text-foreground">
              <Link2 className="h-4 w-4 text-[#22C55E]" />
              Publish content → Ranklite generates backlinks → You grow.
            </p>
          </div>
<a
              href="https://whop.com/checkout/plan_VU6iG0GPMen3j"
              className="group flex w-fit items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-4 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30"
            >
              Generate Backlinks Instantly →
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
          <div className="group overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.02] transition-all hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl">
            <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#FAFFFE] to-[#F0FDF4] p-5">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
                <div>
                  <span className="text-[14px] font-semibold text-foreground">Backlink Generator</span>
                  <span className="block text-[11px] text-muted-foreground">AI-Powered Links</span>
                </div>
                <div className="relative h-5 w-9 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] shadow-inner">
                  <div className="absolute right-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm" />
                </div>
              </div>
              <div className="mt-4 space-y-2.5">
                <div className="h-2.5 w-3/4 rounded-full bg-[#DCFCE7]" />
                <div className="h-2.5 w-full rounded-full bg-[#DCFCE7]" />
                <div className="h-2.5 w-5/6 rounded-full bg-[#E2E8F0]" />
              </div>
            </div>
            <h4 className="mb-2 font-display text-[20px] font-bold tracking-tight text-foreground">
              Automatic Backlink Generation
            </h4>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Ranklite&apos;s AI automatically generates high-quality backlinks to your content. No cold outreach or manual submissions required.
            </p>
          </div>

          <div className="group overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.02] transition-all hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl">
            <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#FAFFFE] to-[#F0FDF4] p-5">
              <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#DCFCE7] px-2.5 py-1 text-[11px] font-semibold text-[#16A34A]">
                <BarChart3 className="h-3 w-3" />
                Earned Backlinks
              </div>
              <div className="space-y-2">
                {[
                  { name: "REACH Influencers", initial: "R", color: "orange", dr: 54 },
                  { name: "Shiny UI", initial: "S", color: "blue", dr: 32 },
                  { name: "Refgrow", initial: "R", color: "green", dr: 44 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-white p-2 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full bg-${item.color}-100 text-[9px] font-bold text-${item.color}-600`}>
                        {item.initial}
                      </div>
                      <span className="text-[12px] font-medium text-foreground">{item.name}</span>
                    </div>
                    <span className="rounded bg-[#DCFCE7] px-1.5 py-0.5 text-[10px] font-bold text-[#16A34A]">
                      {item.dr}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <h4 className="mb-2 font-display text-[20px] font-bold tracking-tight text-foreground">
              Track Articles & Results
            </h4>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Monitor where your links are referenced and see your domain authority grow. Track backlinks and their direct impact on your SEO rating.
            </p>
          </div>

          <div className="group overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.02] transition-all hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl">
            <div className="mb-5 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-[#FAFFFE] to-[#F0FDF4] p-5">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Domain Rating</span>
                  <div className="text-[28px] font-bold text-foreground">75</div>
                </div>
                <div className="flex items-center gap-1 rounded-full bg-[#DCFCE7] px-2 py-1 text-[11px] font-bold text-[#16A34A]">
                  <TrendingUp className="h-3 w-3" />
                  +12%
                </div>
              </div>
              <div className="flex h-20 items-end gap-1.5 px-1">
                {[30, 45, 40, 60, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm transition-all group-hover:scale-y-105"
                    style={{
                      height: `${h}%`,
                      background: i === 5
                        ? "linear-gradient(to top, #22C55E, #16A34A)"
                        : `rgba(34, 197, 94, ${0.15 + i * 0.1})`,
                    }}
                  />
                ))}
              </div>
            </div>
            <h4 className="mb-2 font-display text-[20px] font-bold tracking-tight text-foreground">
              Your Domain Rating Grows
            </h4>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Quality backlinks increase your Domain Rating, directly boosting your business growth. Higher DR brings more qualified visitors who convert.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}