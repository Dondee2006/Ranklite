"use client";

import { useState, useEffect } from "react";
import { Loader2, Check, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Plan = {
  id: string;
  name: string;
  price: string;
  posts_per_month: number;
  backlinks_per_post: number;
  qa_validation: boolean;
  integrations_limit: number;
};

type UserPlan = {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string | null;
  plans: Plan;
};

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [changingPlan, setChangingPlan] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setPlans([]);
        setUserPlan(null);
        setLoading(false);
        return;
      }

      const { data: plansData } = await supabase
        .from("plans")
        .select("*")
        .order("price", { ascending: true });

      const { data: userPlanData } = await supabase
        .from("user_plans")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .single();

      setPlans(Array.isArray(plansData) ? plansData : []);
      setUserPlan(userPlanData || null);
    } catch (error) {
      console.error("Error loading billing data:", error);
      setPlans([]);
      setUserPlan(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleChangePlan(planId: string) {
    setChangingPlan(planId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date().toISOString();
      const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      if (userPlan) {
        await supabase
          .from("user_plans")
          .update({
            plan_id: planId,
            status: "active",
            current_period_start: now,
            current_period_end: periodEnd,
            updated_at: now,
          })
          .eq("id", userPlan.id);
      } else {
        await supabase
          .from("user_plans")
          .insert({
            user_id: user.id,
            plan_id: planId,
            status: "active",
            current_period_start: now,
            current_period_end: periodEnd,
          });
      }

      await loadData();
    } catch (error) {
      console.error("Error changing plan:", error);
      alert("Failed to change plan");
    } finally {
      setChangingPlan(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Choose Your Plan
          </h1>
          <p className="text-lg text-slate-600">
            Select the perfect plan for your SEO needs
          </p>
        </div>

        {userPlan?.plans && (
          <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm border border-indigo-200 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Current Plan</p>
                <p className="text-2xl font-bold text-indigo-900">
                  {userPlan.plans.name}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-600">Billing Cycle</p>
                <p className="text-sm font-medium text-slate-900">
                  {userPlan.current_period_end
                    ? `Renews ${new Date(userPlan.current_period_end).toLocaleDateString()}`
                    : "No renewal date"}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Array.isArray(plans) && plans.map((plan) => {
            const isCurrent = userPlan?.plan_id === plan.id && userPlan.status === "active";
            const isChanging = changingPlan === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative p-8 rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl ${
                  isCurrent
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-600 text-white scale-105"
                    : "bg-white/80 backdrop-blur-sm border-slate-200 hover:border-indigo-300"
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-amber-400 text-amber-900 text-xs font-bold rounded-full">
                    CURRENT PLAN
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${isCurrent ? "text-white" : "text-slate-900"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className={`text-5xl font-extrabold ${isCurrent ? "text-white" : "text-indigo-600"}`}>
                      ${plan.price}
                    </span>
                    <span className={`text-lg ${isCurrent ? "text-white/80" : "text-slate-600"}`}>
                      /month
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-center gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-white" : "text-green-500"}`} />
                    <span className={`text-sm ${isCurrent ? "text-white" : "text-slate-700"}`}>
                      {plan.posts_per_month} posts per month
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-white" : "text-green-500"}`} />
                    <span className={`text-sm ${isCurrent ? "text-white" : "text-slate-700"}`}>
                      {plan.backlinks_per_post} backlinks per post
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    {plan.qa_validation ? (
                      <Check className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-white" : "text-green-500"}`} />
                    ) : (
                      <X className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-white/60" : "text-red-500"}`} />
                    )}
                    <span className={`text-sm ${isCurrent ? "text-white" : "text-slate-700"}`}>
                      QA validation
                    </span>
                  </li>
                  <li className="flex items-center gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${isCurrent ? "text-white" : "text-green-500"}`} />
                    <span className={`text-sm ${isCurrent ? "text-white" : "text-slate-700"}`}>
                      {plan.integrations_limit === -1 ? "Unlimited" : plan.integrations_limit} integrations
                    </span>
                  </li>
                </ul>

                <button
                  onClick={() => handleChangePlan(plan.id)}
                  disabled={isCurrent || isChanging}
                  className={`w-full py-3 px-6 rounded-xl font-semibold transition-all duration-200 ${
                    isCurrent
                      ? "bg-white/20 text-white cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-95"
                  } ${isChanging ? "opacity-50 cursor-wait" : ""}`}
                >
                  {isChanging ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </span>
                  ) : isCurrent ? (
                    "Current Plan"
                  ) : (
                    "Select Plan"
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}