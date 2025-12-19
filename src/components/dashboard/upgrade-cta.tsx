"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  name: string;
  posts_per_month: number;
  backlinks_per_post: number;
};

export function WelcomeBanner() {
  const [websiteName, setWebsiteName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: site } = await supabase
          .from("sites")
          .select("name")
          .eq("user_id", user.id)
          .single();

        if (site) {
          setWebsiteName(site.name);
        }
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return null;

  return (
    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg p-6 text-white shadow-sm border border-[#059669]/20">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-white" />
            <h3 className="font-semibold text-lg">
              Welcome back to Ranklite{websiteName ? `, ${websiteName}` : ""}!
            </h3>
          </div>
          <p className="text-sm text-white/90 mb-4 max-w-2xl">
            Your SEO engine is currently running on autopilot. We're actively building quality backlinks
            and optimizing your content to boost your search visibility naturally.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/seo-cycle"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#10B981] rounded-md font-medium text-sm hover:bg-gray-50 transition-colors shadow-sm"
            >
              View SEO Cycle
              <ArrowRight className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-white/80 font-medium">
              <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              Agent Active
            </div>
          </div>
        </div>
        <div className="hidden lg:block bg-white/10 backdrop-blur-sm rounded-lg p-4 ml-6 border border-white/10">
          <div className="text-xs text-white/70 mb-1">Performance Plan</div>
          <div className="font-semibold flex items-center gap-2 text-sm">
            <Zap className="h-4 w-4 fill-white" />
            Full Access Active
          </div>
        </div>
      </div>
    </div>
  );
}
