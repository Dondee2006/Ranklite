"use client";

import { useState } from "react";
import { Zap, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type GrowthMode = "Safe Growth" | "Balanced Growth" | "Authority Growth";

type Plan = {
  id: string;
  name: string;
  price: number;
  growthMode: GrowthMode;
  features: string[];
  isActive: boolean;
};

const PLANS: Plan[] = [
  {
    id: "pro",
    name: "Pro Tier",
    price: 59,
    growthMode: "Authority Growth",
    features: [
      "30 SEO articles per month",
      "AI-generated images included",
      "Auto-publishing to WordPress/Wix/Webflow",
      "Full keyword research & optimization",
      "Performance dashboard access",
      "High-quality backlink starter pack",
      "Optional light human QA",
      "3-day trial ($1 activation fee)",
    ],
    isActive: true,
  },
];

export default function BillingPage() {
  const [plans] = useState<Plan[]>(PLANS);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleUpgradeClick = () => {
    window.location.href = "https://whop.com/checkout/plan_VU6iG0GPMen3j";
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-[#1A1A1A] mb-2">
            Your Subscription
          </h1>
          <p className="text-sm text-[#6B7280]">
            Manage your SEO automation plan and billing
          </p>
        </div>

        {/* Single Plan Card */}
        {plans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white rounded-xl border border-[#E5E5E5] shadow-sm overflow-hidden"
          >
            <div className="p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-bold text-[#1A1A1A]">
                      {plan.name}
                    </h2>
                    {getStatusBadge(plan.isActive)}
                  </div>
                  <p className="text-sm text-[#6B7280]">
                    Ranklite Authority Growth Mode enabled
                  </p>
                </div>
                <div className="text-left md:text-right">
                  <div className="text-3xl font-bold text-[#10B981]">
                    ${plan.price}
                    <span className="text-sm font-normal text-[#6B7280]">
                      /month
                    </span>
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">
                    Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4 uppercase tracking-wider">
                    What&apos;s included
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 text-sm text-[#4B5563]"
                      >
                        <div className="mt-1 h-4 w-4 rounded-full bg-[#DCFCE7] flex items-center justify-center flex-shrink-0">
                          <Check className="h-2.5 w-2.5 text-[#16A34A]" />
                        </div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#F9FAFB] rounded-lg p-6 border border-[#E5E5E5]">
                  <h3 className="text-sm font-semibold text-[#1A1A1A] mb-4">
                    Subscription Actions
                  </h3>
                  <div className="space-y-3">
                    {plan.isActive ? (
                      <>
                        <button
                          disabled
                          className="w-full px-4 py-2.5 text-sm font-medium text-[#9CA3AF] bg-[#F3F4F6] rounded-md cursor-not-allowed border border-[#E5E5E5]"
                        >
                          Plan is Active
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = "https://whop.com/hub/";
                          }}
                          className="w-full px-4 py-2.5 text-sm font-medium text-[#4B5563] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] transition-colors"
                        >
                          Manage Payment Method
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleUpgradeClick}
                        className="w-full px-4 py-2.5 text-sm font-medium text-white bg-[#10B981] hover:bg-[#059669] rounded-md transition-colors shadow-sm"
                      >
                        Activate Plan
                      </button>
                    )}
                  </div>
                  <div className="mt-4 p-3 rounded bg-blue-50 border border-blue-100">
                    <div className="flex gap-2">
                      <Info className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <p className="text-[11px] text-blue-700 leading-relaxed">
                        Ranklite automatically adjusts publishing and link
                        building to keep your SEO natural and penalty-safe.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
