"use client";

import { useState } from "react";
import { Zap, Check, Info, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type GrowthMode = "Safe Growth" | "Balanced Growth" | "Authority Growth";

type Plan = {
  id: string;
  name: string;
  price: number;
  growthMode: GrowthMode;
  features: string[];
  color: "green" | "blue" | "purple";
  isActive: boolean;
};

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 49,
    growthMode: "Safe Growth",
    features: [
      "AI content generation",
      "Automated publishing",
      "Gradual backlink building",
      "Built-in SEO safety controls",
    ],
    color: "green",
    isActive: false,
  },
  {
    id: "growth",
    name: "Growth",
    price: 99,
    growthMode: "Balanced Growth",
    features: [
      "Full 30-day AI content plan",
      "Daily blog publishing",
      "Automated backlink generator",
      "QA validation & indexing checks",
      "Natural, penalty-safe growth",
    ],
    color: "blue",
    isActive: true,
  },
  {
    id: "authority",
    name: "Authority",
    price: 199,
    growthMode: "Authority Growth",
    features: [
      "Accelerated content publishing",
      "Higher backlink capacity",
      "Priority QA validation",
      "Optimized for established sites",
    ],
    color: "purple",
    isActive: false,
  },
];

export default function BillingPage() {
  const [plans, setPlans] = useState<Plan[]>(PLANS);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (planId: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [planId]: !prev[planId],
    }));
  };

  const handleUpgradeClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const confirmUpgrade = () => {
    if (!selectedPlan) return;

    setPlans((prev) =>
      prev.map((p) => ({
        ...p,
        isActive: p.id === selectedPlan.id,
      }))
    );

    setShowModal(false);
    setToastMessage("Plan upgraded successfully");
    setShowToast(true);

    setTimeout(() => setShowToast(false), 3000);
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#DCFCE7] text-[#166534] text-xs font-medium">
          <div className="h-1.5 w-1.5 rounded-full bg-[#16A34A]" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[#6B7280] text-xs font-medium">
        <div className="h-1.5 w-1.5 rounded-full bg-[#9CA3AF]" />
        Inactive
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-2">
            Upgrade your plan
          </h1>
          <p className="text-sm text-[#6B7280]">
            Hands-off SEO growth, safely automated
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mb-6 p-3 rounded-lg bg-[#FEF3C7] border border-[#F59E0B]/20">
          <p className="text-xs text-[#92400E] font-medium">
            Demo billing — MVP mode
          </p>
        </div>

        {/* Plans Table */}
        <div className="bg-white rounded-lg border border-[#E5E5E5] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E5E5]">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      Growth Mode
                      <div className="group relative">
                        <Info className="h-3.5 w-3.5 text-[#9CA3AF] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-[#1F2937] text-white text-xs rounded-lg shadow-lg z-10">
                          Ranklite automatically adjusts publishing and link building to keep your SEO natural and penalty-safe.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#1F2937]" />
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    What's included
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {plans.map((plan) => (
                  <tr
                    key={plan.id}
                    className={cn(
                      "transition-colors",
                      plan.isActive ? "bg-[#F0FDF4]" : "hover:bg-[#F9FAFB]"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-sm text-[#1A1A1A]">
                        {plan.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#1A1A1A]">
                        <span className="font-semibold">${plan.price}</span>
                        <span className="text-[#6B7280]"> / month</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
                          plan.color === "green" && "bg-[#DCFCE7] text-[#166534]",
                          plan.color === "blue" && "bg-[#DBEAFE] text-[#1E40AF]",
                          plan.color === "purple" && "bg-[#F3E8FF] text-[#6B21A8]"
                        )}
                      >
                        {plan.growthMode}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleRow(plan.id)}
                        className="flex items-center gap-2 text-xs font-medium text-[#6B7280] hover:text-[#1A1A1A] transition-colors"
                      >
                        <span>{expandedRows[plan.id] ? "Hide" : "Show"} features</span>
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform",
                            expandedRows[plan.id] && "rotate-180"
                          )}
                        />
                      </button>
                      {expandedRows[plan.id] && (
                        <ul className="space-y-1.5 mt-3">
                          {plan.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-[#4B5563]"
                            >
                              <Check className="h-3.5 w-3.5 text-[#10B981] mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(plan.isActive)}</td>
                    <td className="px-6 py-4 text-right">
                      {plan.isActive ? (
                        <button
                          disabled
                          className="px-4 py-2 text-xs font-medium text-[#9CA3AF] bg-[#F3F4F6] rounded-md cursor-not-allowed"
                        >
                          Current Plan
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpgradeClick(plan)}
                          className="px-4 py-2 text-xs font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors shadow-sm"
                        >
                          Upgrade
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showModal && selectedPlan && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-[#DBEAFE] flex items-center justify-center">
                <Zap className="h-5 w-5 text-[#2563EB]" />
              </div>
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Confirm Upgrade
              </h3>
            </div>
            <p className="text-sm text-[#6B7280] mb-6">
              This is a demo upgrade for MVP testing.
            </p>
            <div className="p-4 rounded-lg bg-[#F9FAFB] border border-[#E5E5E5] mb-6">
              <div className="text-xs text-[#6B7280] mb-1">Upgrading to</div>
              <div className="text-base font-semibold text-[#1A1A1A]">
                {selectedPlan.name} Plan
              </div>
              <div className="text-sm text-[#6B7280] mt-1">
                ${selectedPlan.price}/month • {selectedPlan.growthMode}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-[#6B7280] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors shadow-sm"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5">
          <div className="bg-[#1F2937] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-[#10B981] flex items-center justify-center">
              <Check className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}