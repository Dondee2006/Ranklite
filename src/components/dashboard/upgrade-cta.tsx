"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  name: string;
  posts_per_month: number;
  backlinks_per_post: number;
};

export function UpgradeCTA() {
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: userPlan } = await supabase
          .from("user_plans")
          .select(`
            *,
            plans (*)
          `)
          .eq("user_id", user.id)
          .single();

        if (userPlan && userPlan.plans) {
          setCurrentPlan(userPlan.plans);
          setShouldShow(userPlan.plans.name !== "Authority");
        } else {
          setShouldShow(true);
        }
      } catch (error) {
        console.error("Failed to load plan:", error);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading || !shouldShow) return null;

  return (
    <div className="bg-gradient-to-r from-[#10B981] to-[#059669] rounded-lg p-6 text-white">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-5 w-5" />
            <h3 className="font-semibold text-lg">Upgrade Your Plan</h3>
          </div>
          <p className="text-sm text-white/90 mb-4">
            {currentPlan 
              ? `You're on the ${currentPlan.name} plan. Unlock more features with a higher tier plan.`
              : "Get started with a plan to unlock all features and boost your SEO performance."
            }
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-[#10B981] rounded-md font-medium text-sm hover:bg-gray-50 transition-colors"
          >
            View Plans
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {currentPlan && (
          <div className="hidden md:block bg-white/10 backdrop-blur-sm rounded-lg p-4 ml-6">
            <div className="text-xs text-white/70 mb-1">Current Plan</div>
            <div className="font-semibold">{currentPlan.name}</div>
          </div>
        )}
      </div>
    </div>
  );
}