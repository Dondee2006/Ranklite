"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Activity, Target, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function WelcomeBanner() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const name = user.user_metadata?.full_name || user.email?.split('@')[0] || "there";
          // Capitalize first letter
          const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
          setUserName(capitalized);
        }
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="h-[220px] w-full bg-white border border-[#E5E5E5] rounded-2xl animate-pulse" />
    );
  }

  return (
    <div className="relative overflow-hidden bg-white border border-emerald-100 rounded-2xl p-6 sm:p-10 shadow-sm transition-all hover:shadow-md">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-80 w-80 rounded-full bg-emerald-50 blur-3xl opacity-60 animate-blob" />
      <div className="absolute bottom-0 right-0 mb-8 mr-24 h-40 w-40 rounded-full bg-emerald-100/40 blur-2xl opacity-50 animate-blob animation-delay-2000" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-emerald-600 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100/80">
            <Sparkles className="h-4 w-4 fill-emerald-600/20" />
          </div>
          <span className="text-xs font-bold uppercase tracking-[0.1em]">Dashboard Overview</span>
        </div>
        
        <h2 className="text-3xl sm:text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
          Welcome back, <span className="text-emerald-600">{userName}</span>! 👋
        </h2>
        
        <p className="text-[#6B7280] max-w-2xl text-base sm:text-lg leading-relaxed mb-8">
          Your SEO strategy is in full swing. We've identified new ranking opportunities and updated your performance metrics.
        </p>
        
        <div className="flex flex-wrap gap-4 sm:gap-8 mt-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 transition-colors hover:bg-emerald-50">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-900">Growth Tracking</span>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 transition-colors hover:bg-emerald-50">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Target className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-900">Active Goals</span>
          </div>
          
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50/50 rounded-xl border border-emerald-100/50 transition-colors hover:bg-emerald-50">
            <div className="p-1.5 bg-white rounded-lg shadow-sm">
              <Activity className="h-4 w-4 text-emerald-600" />
            </div>
            <span className="text-sm font-semibold text-emerald-900">Health Score: 98%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
