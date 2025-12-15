"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Link2, CheckCircle2, TrendingUp, Clock, Sparkles } from "lucide-react";

const CYCLE_STAGES = [
  {
    id: 1,
    name: "PLAN",
    count: 0,
    description: "Keyword Research",
    icon: FileText,
    color: "#8B5CF6",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#6B7280]",
  },
  {
    id: 2,
    name: "CREATE",
    count: 0,
    description: "Content Generation",
    icon: Upload,
    color: "#3B82F6",
    bgColor: "bg-[#DBEAFE]",
    textColor: "text-[#1E40AF]",
  },
  {
    id: 3,
    name: "PUBLISH",
    count: 2,
    description: "CMS Publishing",
    icon: CheckCircle2,
    color: "#10B981",
    bgColor: "bg-[#D1FAE5]",
    textColor: "text-[#065F46]",
  },
  {
    id: 4,
    name: "PROMOTE",
    count: 11,
    description: "Backlink Building",
    icon: Link2,
    color: "#F59E0B",
    bgColor: "bg-[#FEF3C7]",
    textColor: "text-[#92400E]",
  },
  {
    id: 5,
    name: "VALIDATE",
    count: 0,
    description: "Quality Checks",
    icon: CheckCircle2,
    color: "#06B6D4",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#6B7280]",
  },
  {
    id: 6,
    name: "COMPLETE",
    count: 4,
    description: "Ranking Ready",
    icon: TrendingUp,
    color: "#10B981",
    bgColor: "bg-[#D1FAE5]",
    textColor: "text-[#065F46]",
  },
];

const AGENT_STEPS = [
  { id: 1, text: "Scanning directories", status: "complete" },
  { id: 2, text: "Discovering opportunities", status: "complete" },
  { id: 3, text: "Checking policy compliance ...", status: "in-progress" },
  { id: 4, text: "Processing submissions", status: "pending" },
  { id: 5, text: "Verifying backlinks", status: "pending" },
  { id: 6, text: "Updating metrics", status: "pending" },
];

export function SEOCycleVisual() {
  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
      <div className="px-8 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">SEO Cycle</h2>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              AUTOPILOT ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-[#DC2626] border border-[#E5E5E5] rounded-md hover:bg-[#FEF2F2] transition-colors">
              <Clock className="w-4 h-4 inline-block mr-1.5" />
              Pause
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Status Cards Grid */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {CYCLE_STAGES.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.id}
                className="relative rounded-xl border border-[#E5E5E5] bg-white p-4 hover:shadow-md transition-all"
              >
                <div className="flex flex-col items-center text-center">
                  <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md ${stage.bgColor} ${stage.textColor} text-xs font-semibold mb-2 uppercase tracking-wide`}>
                    {stage.name}
                  </span>
                  <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
                    {stage.count}
                  </div>
                  <div className="text-xs text-[#6B7280]">
                    {stage.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-3 gap-6">
          {/* AI Agent Running Panel */}
          <div className="col-span-2 rounded-xl border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
                  AI Agent Running
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                    LIVE
                  </span>
                </h3>
                <p className="text-sm text-[#6B7280]">Building backlinks for your website</p>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3">
              {AGENT_STEPS.map((step, index) => {
                const status = index < currentStep ? "complete" : index === currentStep ? "in-progress" : "pending";
                
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: status === "pending" ? 0.4 : 1 }}
                    className="flex items-center gap-3"
                  >
                    {status === "complete" && (
                      <CheckCircle2 className="w-5 h-5 text-[#10B981] flex-shrink-0" />
                    )}
                    {status === "in-progress" && (
                      <div className="w-5 h-5 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin flex-shrink-0" />
                    )}
                    {status === "pending" && (
                      <div className="w-5 h-5 rounded-full border-2 border-[#E5E5E5] flex-shrink-0" />
                    )}
                    <span className={`text-sm ${status === "pending" ? "text-[#9CA3AF]" : "text-[#1A1A1A]"}`}>
                      {step.text}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                <Clock className="w-4 h-4" />
                <span>Today: 2/10 submissions</span>
              </div>
              <span className="flex items-center gap-1.5 text-sm text-[#10B981] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                Running continuously
              </span>
            </div>
          </div>

          {/* Metrics Sidebar */}
          <div className="space-y-4">
            {/* Total Backlinks */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Backlinks</span>
                <Link2 className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">2</div>
              <div className="text-xs text-[#6B7280]">ALL TIME</div>
            </div>

            {/* Unique Sources */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Unique Sources</span>
                <TrendingUp className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">2</div>
              <div className="text-xs text-[#6B7280]">DIFFERENT WEBSITES</div>
            </div>

            {/* Domain Rating */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Avg. Domain Rating</span>
                <CheckCircle2 className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">51</div>
              <div className="text-xs text-[#6B7280]">QUALITY SCORE</div>
            </div>

            {/* This Month */}
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">This Month</span>
                <FileText className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">2</div>
              <div className="text-xs text-[#6B7280]">NEW BACKLINKS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}