"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Rocket, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function CtaSection() {
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
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFFFE] py-24 lg:py-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[10%] top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-40 blur-3xl" />
        <div className="absolute -right-[10%] top-1/4 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-30 blur-3xl" />
      </div>

      <div className="container relative mx-auto px-5 md:px-8">
        <div className="relative mx-auto max-w-[1100px] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#1A1F2E] via-[#1E2433] to-[#1A1F2E] p-10 shadow-2xl md:p-16 lg:p-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full bg-[#22C55E]/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-[250px] w-[250px] rounded-full bg-[#10B981]/10 blur-3xl" />
            <div className="absolute right-1/4 top-1/4 h-2 w-2 rounded-full bg-[#22C55E] opacity-60 animate-pulse-soft" />
            <div className="absolute bottom-1/3 left-1/4 h-3 w-3 rounded-full bg-[#10B981] opacity-40 animate-pulse-soft animation-delay-2000" />
            <div className="absolute right-1/3 bottom-1/4 h-2 w-2 rounded-full bg-white opacity-20 animate-pulse-soft animation-delay-4000" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-6 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-[#22C55E]" />
              <span className="text-[13px] font-semibold text-white/90">No credit card required</span>
            </div>

            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-white sm:text-[42px] lg:text-[52px]">
              Ready to 
              <span className="relative mx-2 inline-block">
                <span className="bg-gradient-to-r from-[#22C55E] to-[#86EFAC] bg-clip-text text-transparent">
                  accelerate
                </span>
              </span>
              your
              <br className="hidden sm:block" />
              organic growth?
            </h2>

            <p className="mx-auto mt-5 max-w-[500px] text-[16px] leading-relaxed text-white/60 sm:text-[18px]">
              Join thousands of marketers who are scaling their traffic with AI-powered content that actually ranks.
            </p>

              <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row">
                <Link
                  href="https://whop.com/checkout/ranklite"
                  className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-8 py-4 text-[16px] font-semibold text-white shadow-xl shadow-green-500/20 transition-all hover:shadow-2xl hover:shadow-green-500/30"
                >
                <Rocket className="h-5 w-5" />
                <span className="relative z-10">Start Your Free Trial</span>
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#16A34A] to-[#15803D] opacity-0 transition-opacity group-hover:opacity-100" />
              </Link>

              <Link
                href="#pricing"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-[16px] font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                View Pricing
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {["3-day free trial", "Cancel anytime", "Setup in 2 minutes"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[14px] text-white/50">
                  <CheckCircle2 className="h-4 w-4 text-[#22C55E]" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}