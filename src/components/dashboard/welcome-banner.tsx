"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Sparkles, Activity, Target, TrendingUp } from "lucide-react";

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
      <div className="h-[180px] w-full bg-white border border-[#E5E5E5] rounded-xl animate-pulse" />
    );
  }

  return (
    <div className="relative overflow-hidden bg-white border border-[#E5E5E5] rounded-xl p-8 shadow-sm">
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-[#2563EB] mb-3">
          <Sparkles className="h-5 w-5 fill-[#2563EB]/20" />
          <span className="text-sm font-semibold uppercase tracking-wider">Welcome Back</span>
        </div>
        <h2 className="text-3xl font-bold text-[#1A1A1A] mb-3">
          Good to see you, {userName}! 👋
        </h2>
        <p className="text-[#6B7280] max-w-2xl text-lg">
          Your SEO engine is humming. We've optimized your recent content and processed new backlink opportunities.
        </p>
        
        <div className="flex flex-wrap gap-6 mt-8">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#F0FDF4] rounded-lg">
              <TrendingUp className="h-4 w-4 text-[#16A34A]" />
            </div>
            <span className="text-sm font-medium text-[#374151]">Traffic Growing</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#EFF6FF] rounded-lg">
              <Target className="h-4 w-4 text-[#2563EB]" />
            </div>
            <span className="text-sm font-medium text-[#374151]">Keywords Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#FAF5FF] rounded-lg">
              <Activity className="h-4 w-4 text-[#9333EA]" />
            </div>
            <span className="text-sm font-medium text-[#374151]">Active SEO Cycle</span>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-[#2563EB]/5 blur-3xl" />
      <div className="absolute bottom-0 right-0 mb-10 mr-20 h-32 w-32 rounded-full bg-[#2563EB]/10 blur-2xl" />
    </div>
  );
}
