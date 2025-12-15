"use client";

import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

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
  status: "active" | "inactive" | "expired";
  start_date: string;
  end_date: string | null;
};

type Filter = "all" | "active" | "expired" | "starter" | "growth" | "authority";

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: plansData } = await supabase
          .from("plans")
          .select("*")
          .order("price", { ascending: true });

        const { data: userPlanData } = await supabase
          .from("user_plans")
          .select("*")
          .eq("user_id", user.id)
          .single();

        setPlans(plansData || []);
        setUserPlan(userPlanData);
      } catch (error) {
        console.error("Failed to load billing data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPlans = Array.isArray(plans) ? plans.filter((plan) => {
    if (filter === "all") return true;
    if (filter === "active") return userPlan?.plan_id === plan.id && userPlan.status === "active";
    if (filter === "expired") return userPlan?.plan_id === plan.id && userPlan.status === "expired";
    if (filter === "starter") return plan.name === "Starter";
    if (filter === "growth") return plan.name === "Growth";
    if (filter === "authority") return plan.name === "Authority";
    return true;
  }) : [];

  const safeFilteredPlansLength = filteredPlans?.length || 0;
  const totalPages = Math.max(1, Math.ceil(safeFilteredPlansLength / itemsPerPage));
  const paginatedPlans = (filteredPlans || []).slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch("/api/billing/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to change plan:", error);
    }
  };

  const getPlanStatus = (plan: Plan) => {
    if (!userPlan) return null;
    if (userPlan.plan_id === plan.id) {
      if (userPlan.status === "active") return "active";
      if (userPlan.status === "expired") return "expired";
    }
    return null;
  };

  const isHighestTier = (plan: Plan) => {
    return plan.name === "Authority" && userPlan?.plan_id === plan.id && userPlan.status === "active";
  };

  const canUpgrade = (plan: Plan) => {
    if (!userPlan) return true;
    const currentPlan = plans.find(p => p.id === userPlan.plan_id);
    if (!currentPlan) return true;
    return parseFloat(plan.price) > parseFloat(currentPlan.price);
  };

  const canDowngrade = (plan: Plan) => {
    if (!userPlan) return false;
    const currentPlan = plans.find(p => p.id === userPlan.plan_id);
    if (!currentPlan) return false;
    return parseFloat(plan.price) < parseFloat(currentPlan.price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#FAFAFA] p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-[#1A1A1A] mb-2">Pricing Plans</h1>
            <p className="text-sm text-[#6B7280]">Manage your subscription and features</p>
          </div>

          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "all"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              All
            </button>
            <button
              onClick={() => setFilter("active")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "active"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              Active
            </button>
            <button
              onClick={() => setFilter("expired")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "expired"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              Expired
            </button>
            <div className="w-px h-6 bg-[#E5E5E5]" />
            <button
              onClick={() => setFilter("starter")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "starter"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              Starter
            </button>
            <button
              onClick={() => setFilter("growth")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "growth"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              Growth
            </button>
            <button
              onClick={() => setFilter("authority")}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === "authority"
                  ? "bg-[#1F2937] text-white"
                  : "bg-white text-[#6B7280] hover:text-[#1A1A1A] border border-[#E5E5E5]"
              )}
            >
              Authority
            </button>
          </div>

          <div className="bg-white border border-[#E5E5E5] rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F7F7F7] border-b border-[#E5E5E5]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Plan Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Posts/Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Backlinks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      QA Validation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Integrations
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {paginatedPlans.map((plan) => {
                    const status = getPlanStatus(plan);
                    return (
                      <tr key={plan.id} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-[#1A1A1A]">{plan.name}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#1A1A1A]">${plan.price}/mo</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280]">{plan.posts_per_month}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280]">{plan.backlinks_per_post} per post</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-[#6B7280]">
                            {plan.qa_validation ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-sm text-[#6B7280]">
                                <span>{plan.integrations_limit === -1 ? 'Unlimited' : `${plan.integrations_limit} platforms`}</span>
                                <Info className="h-3.5 w-3.5" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-xs">
                                {plan.integrations_limit === -1 ? 'Unlimited' : `${plan.integrations_limit} platforms`}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </td>
                        <td className="px-6 py-4">
                          {status === "active" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                          {status === "expired" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expired
                            </span>
                          )}
                          {!status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status === "active" && isHighestTier(plan) ? (
                              <button
                                disabled
                                className="px-4 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
                              >
                                Current Plan
                              </button>
                            ) : status === "expired" ? (
                              <button
                                onClick={() => handleUpgrade(plan.id)}
                                className="px-4 py-1.5 text-xs font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors"
                              >
                                Reactivate
                              </button>
                            ) : canUpgrade(plan) ? (
                              <button
                                onClick={() => handleUpgrade(plan.id)}
                                className="px-4 py-1.5 text-xs font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors"
                              >
                                Upgrade
                              </button>
                            ) : canDowngrade(plan) ? (
                              <button
                                onClick={() => handleUpgrade(plan.id)}
                                className="px-4 py-1.5 text-xs font-medium text-[#1A1A1A] bg-white border border-[#E5E5E5] hover:bg-[#F7F7F7] rounded-md transition-colors"
                              >
                                Downgrade
                              </button>
                            ) : status === "active" ? (
                              <button
                                disabled
                                className="px-4 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-md cursor-not-allowed"
                              >
                                Current Plan
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUpgrade(plan.id)}
                                className="px-4 py-1.5 text-xs font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors"
                              >
                                Select Plan
                              </button>
                            )}
                            <Tooltip>
                              <TooltipTrigger>
                                <button className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] rounded transition-colors">
                                  <Info className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="text-xs max-w-xs">
                                  <div className="font-semibold mb-1">{plan.name} Plan Details</div>
                                  <div className="space-y-1">
                                    <div>• {plan.posts_per_month} posts per month</div>
                                    <div>• {plan.backlinks_per_post} backlinks per post</div>
                                    <div>• QA validation included</div>
                                    <div>• {plan.integrations_limit === -1 ? 'Unlimited' : plan.integrations_limit} integrations</div>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <div className="text-sm text-[#6B7280]">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredPlans.length)} of{" "}
                  {filteredPlans.length} plans
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium rounded transition-colors",
                          currentPage === page
                            ? "bg-[#1F2937] text-white"
                            : "text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F7F7]"
                        )}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-[#6B7280] hover:text-[#1A1A1A] hover:bg-[#F7F7F7] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}