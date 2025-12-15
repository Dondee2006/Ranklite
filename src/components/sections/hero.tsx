"use client";

import Link from "next/link";
import { TrendingUp, Zap, Target, BarChart3, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function StatBubble({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  position 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  color: string;
  position: string;
}) {
  return (
    <div className={`absolute ${position} hidden lg:block animate-float`}>
      <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-xl shadow-black/[0.08] ring-1 ring-black/[0.03]">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <div className="text-[13px] font-medium text-muted-foreground">{label}</div>
          <div className="text-lg font-bold text-foreground">{value}</div>
        </div>
      </div>
    </div>
  );
}

function CircularProgress({ value, label }: { value: number; label: string }) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;
  
  return (
    <div className="absolute -left-6 top-24 hidden lg:block animate-float animation-delay-2000">
      <div className="rounded-2xl bg-white p-5 shadow-xl shadow-black/[0.08] ring-1 ring-black/[0.03]">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#F0FDF4" strokeWidth="8" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22C55E" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{value}%</span>
          </div>
        </div>
        <div className="mt-2 text-center text-[13px] font-semibold text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}

function PillTag({ children, variant = "green" }: { children: React.ReactNode; variant?: "green" | "teal" }) {
  const colors = {
    green: "bg-[#DCFCE7] text-[#16A34A]",
    teal: "bg-[#D1FAE5] text-[#10B981]"
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${colors[variant]}`}>
      {children}
    </span>
  );
}

export default function HeroSection() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  const handleButtonClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault();
      window.location.href = "/dashboard/overview";
    }
  };

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-[20%] -top-[30%] h-[700px] w-[700px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-[#F0FDF4] opacity-60 blur-3xl" />
          <div className="absolute -right-[15%] -top-[20%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-[#ECFDF5] opacity-50 blur-3xl" />
          <div className="absolute left-1/2 top-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-[#22C55E]/5 blur-3xl animate-blob" />
          
          <svg className="absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 200" fill="none" preserveAspectRatio="none">
            <path d="M0,100 C360,180 720,20 1080,100 C1260,140 1380,120 1440,100 L1440,200 L0,200 Z" fill="#F0FDF4" fillOpacity="0.5" />
            <path d="M0,140 C240,180 480,100 720,140 C960,180 1200,100 1440,140 L1440,200 L0,200 Z" fill="#FAFFFE" fillOpacity="0.8" />
          </svg>

          <div className="absolute right-[10%] top-[20%] h-3 w-3 rounded-full bg-[#10B981] opacity-40 animate-pulse-soft" />
          <div className="absolute left-[15%] top-[35%] h-2 w-2 rounded-full bg-[#22C55E] opacity-50 animate-pulse-soft animation-delay-2000" />
          <div className="absolute right-[25%] top-[60%] h-4 w-4 rounded-full bg-[#22C55E]/30 animate-pulse-soft animation-delay-4000" />
        </div>

        <section className="relative pb-20 pt-32 lg:pb-32 lg:pt-44">
          <CircularProgress value={94} label="SEO Score" />
          
          <StatBubble 
            icon={TrendingUp} 
            label="Traffic Growth" 
            value="+248%" 
            color="bg-gradient-to-br from-[#22C55E] to-[#16A34A]"
            position="right-[5%] top-32 animation-delay-2000"
          />
          
          <StatBubble 
            icon={Target} 
            label="Keywords Ranked" 
            value="1,247" 
            color="bg-gradient-to-br from-[#10B981] to-[#059669]"
            position="-right-2 top-64 animation-delay-4000"
          />

          <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
            <div className="relative mx-auto max-w-[800px] text-center">
              <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
                <PillTag variant="green">
                  <Zap className="h-3.5 w-3.5" />
                  AI-Powered
                </PillTag>
                <PillTag variant="teal">
                  <BarChart3 className="h-3.5 w-3.5" />
                  SEO Automation
                </PillTag>
              </div>

              <h1 className="font-display text-[42px] font-extrabold leading-[1.08] tracking-[-1.5px] text-foreground sm:text-[52px] lg:text-[68px]">
                Automated <span className="text-[#22C55E]">Backlinks</span> - Without Exchanges
              </h1>

              <p className="mx-auto mt-6 max-w-[600px] text-[17px] leading-relaxed text-muted-foreground sm:text-[19px] lg:mt-8">
                Ranklite creates a 30-day AI content plan, auto-publishes blog posts, builds high-quality backlinks to each post, and validates everything — so your site ranks without manual SEO work.
              </p>

              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:mt-12">
                <Link
                  href="/signup"
                  onClick={handleButtonClick}
                  className="group relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-8 py-4 text-[16px] font-semibold text-white shadow-xl shadow-green-500/25 transition-all hover:shadow-2xl hover:shadow-green-500/30 sm:w-auto"
                >
                  <span className="relative z-10">Start Generating Backlinks</span>
                  <svg className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#16A34A] to-[#15803D] opacity-0 transition-opacity group-hover:opacity-100" />
                </Link>
                
                <Link
                  href="#demo"
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-border bg-white px-8 py-4 text-[16px] font-semibold text-foreground transition-all hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] sm:w-auto"
                >
                  <svg className="h-5 w-5 text-[#10B981]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                  Watch Demo
                </Link>
              </div>

              <div className="mt-12 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:mt-16">
                <div className="flex -space-x-3">
                  {[
                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=80&h=80&fit=crop&crop=face",
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face",
                  ].map((src, i) => (
                    <div
                      key={i}
                      className="h-11 w-11 overflow-hidden rounded-full border-[3px] border-white shadow-md"
                    >
                      <img src={src} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-white bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-xs font-bold text-white shadow-md">
                    +2k
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-1 sm:items-start">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4.5 w-4.5 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                    <span className="ml-1 text-[15px] font-bold text-foreground">4.9</span>
                  </div>
                  <p className="text-[14px] font-medium text-muted-foreground">
                    Trusted by <span className="font-semibold text-foreground">2,400+</span> growing businesses
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}