"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, Link2, CheckCircle2, TrendingUp, Clock, Sparkles, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const CYCLE_STAGES = [
  {
    id: 1,
    name: "PLAN",
    description: "Keyword Research",
    tooltip: "Articles in planning phase. Conducting keyword research, analyzing competition, and identifying content opportunities to target.",
    icon: FileText,
    color: "#8B5CF6",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#6B7280]",
  },
  {
    id: 2,
    name: "CREATE",
    description: "Content Generation",
    tooltip: "AI is actively generating high-quality, SEO-optimized content. Articles are being written, formatted, and prepared for publishing.",
    icon: Upload,
    color: "#3B82F6",
    bgColor: "bg-[#DBEAFE]",
    textColor: "text-[#1E40AF]",
  },
  {
    id: 3,
    name: "PUBLISH",
    description: "CMS Publishing",
    tooltip: "Content is being published to your CMS. Articles are scheduled or live on your website and indexed by search engines.",
    icon: CheckCircle2,
    color: "#10B981",
    bgColor: "bg-[#D1FAE5]",
    textColor: "text-[#065F46]",
  },
  {
    id: 4,
    name: "PROMOTE",
    description: "Backlink Building",
    tooltip: "Actively building backlinks through outreach. AI agent is submitting to directories, forums, and platforms to increase domain authority.",
    icon: Link2,
    color: "#F59E0B",
    bgColor: "bg-[#FEF3C7]",
    textColor: "text-[#92400E]",
  },
  {
    id: 5,
    name: "VALIDATE",
    description: "Quality Checks",
    tooltip: "Verifying backlink quality and live status. Checking domain ratings, ensuring links are indexed, and validating they point to your site.",
    icon: CheckCircle2,
    color: "#06B6D4",
    bgColor: "bg-[#F3F4F6]",
    textColor: "text-[#6B7280]",
  },
  {
    id: 6,
    name: "COMPLETE",
    description: "Ranking Ready",
    tooltip: "Content is fully optimized with verified backlinks. Articles are ranking and driving organic growth to your website.",
    icon: TrendingUp,
    color: "#10B981",
    bgColor: "bg-[#D1FAE5]",
    textColor: "text-[#065F46]",
  },
];

const AGENT_STEPS = [
  { id: 1, text: "Scanning directories" },
  { id: 2, text: "Discovering opportunities" },
  { id: 3, text: "Checking policy compliance" },
  { id: 4, text: "Processing submissions" },
  { id: 5, text: "Verifying backlinks" },
  { id: 6, text: "Updating metrics" },
];

interface SEOCycleData {
  stageCounts: Record<string, number>;
  metrics: {
    totalBacklinks: number;
    uniqueSources: number;
    avgDomainRating: number;
    thisMonthBacklinks: number;
    dailySubmissionCount: number;
    maxDailySubmissions: number;
  };
  agent: {
    status: string;
    currentStep: string;
    isPaused: boolean;
  };
}

export function SEOCycleVisual() {
  const [data, setData] = useState<SEOCycleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fallbackData: SEOCycleData = {
      stageCounts: { PLAN: 0, CREATE: 0, PUBLISH: 0, PROMOTE: 0, VALIDATE: 0, COMPLETE: 0 },
      metrics: {
        totalBacklinks: 0,
        uniqueSources: 0,
        avgDomainRating: 0,
        thisMonthBacklinks: 0,
        dailySubmissionCount: 0,
        maxDailySubmissions: 10,
      },
      agent: {
        status: "idle",
        currentStep: "Awaiting data",
        isPaused: true,
      },
    };

    async function fetchData() {
      try {
        const response = await fetch("/api/seo-cycle");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setError(null);

        const stepIndex = AGENT_STEPS.findIndex(step =>
          step.text.toLowerCase().includes(result.agent.currentStep?.toLowerCase() || "")
        );
        setCurrentStepIndex(stepIndex !== -1 ? stepIndex : 0);
      } catch (err) {
        console.error("Failed to fetch SEO cycle data:", err);
        setError("We couldn't load your SEO cycle data right now. Showing the latest available snapshot.");
        setData((prev) => prev || fallbackData);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!data?.agent.isPaused && data?.agent.status === "scanning") {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => (prev < AGENT_STEPS.length - 1 ? prev + 1 : prev));
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [data?.agent.isPaused, data?.agent.status]);

  if (loading || !data) {
    return (
      <div className="relative w-full rounded-lg border border-[#E5E5E5] bg-white shadow-sm p-8">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
      {error && (
        <div className="px-8 pt-6">
          <div className="rounded-md border border-[#FCA5A5] bg-[#FEF2F2] text-[#991B1B] px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      )}
      <div className="px-8 py-6 border-b border-[#E5E5E5]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[#1A1A1A]">SEO Cycle</h2>
            {!data.agent.isPaused && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                AUTOPILOT ACTIVE
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium text-[#DC2626] border border-[#E5E5E5] rounded-md hover:bg-[#FEF2F2] transition-colors">
              <Clock className="w-4 h-4 inline-block mr-1.5" />
              {data.agent.isPaused ? "Resume" : "Pause"}
            </button>
            <button className="px-4 py-2 text-sm font-medium text-[#6B7280] border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] transition-colors">
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-6 gap-4 mb-8">
          {CYCLE_STAGES.map((stage) => {
            const Icon = stage.icon;
            const count = data.stageCounts[stage.name] || 0;
            return (
              <Tooltip key={stage.id}>
                <TooltipTrigger asChild>
                  <div
                    className="relative rounded-xl border border-[#E5E5E5] bg-white p-4 hover:shadow-md transition-all cursor-help"
                  >
                    <div className="flex flex-col items-center text-center">
                      <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-md ${stage.bgColor} ${stage.textColor} text-xs font-semibold mb-2 uppercase tracking-wide`}>
                        {stage.name}
                      </span>
                      <div className="text-3xl font-bold text-[#1A1A1A] mb-1">
                        {count}
                      </div>
                      <div className="text-xs text-[#6B7280]">
                        {stage.description}
                      </div>
                    </div>
                    <Info className="absolute top-2 right-2 w-3.5 h-3.5 text-[#9CA3AF]" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs bg-[#1A1A1A] text-white">
                  {stage.tooltip}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 rounded-xl border border-[#E5E5E5] bg-white p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
                  AI Agent {data.agent.isPaused ? "Paused" : "Running"}
                  {!data.agent.isPaused && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#D1FAE5] text-[#065F46] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                      LIVE
                    </span>
                  )}
                </h3>
                <p className="text-sm text-[#6B7280]">{data.agent.currentStep}</p>
              </div>
            </div>

            <div className="space-y-3">
              {AGENT_STEPS.map((step, index) => {
                const status = index < currentStepIndex ? "complete" : index === currentStepIndex ? "in-progress" : "pending";

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
                <span>Today: {data.metrics.dailySubmissionCount}/{data.metrics.maxDailySubmissions} submissions</span>
              </div>
              {!data.agent.isPaused && (
                <span className="flex items-center gap-1.5 text-sm text-[#10B981] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Running continuously
                </span>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Total Backlinks</span>
                <Link2 className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{data.metrics.totalBacklinks}</div>
              <div className="text-xs text-[#6B7280]">ALL TIME</div>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Unique Sources</span>
                <TrendingUp className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{data.metrics.uniqueSources}</div>
              <div className="text-xs text-[#6B7280]">DIFFERENT WEBSITES</div>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">Avg. Domain Rating</span>
                <CheckCircle2 className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{Math.round(data.metrics.avgDomainRating)}</div>
              <div className="text-xs text-[#6B7280]">QUALITY SCORE</div>
            </div>

            <div className="rounded-xl border border-[#E5E5E5] bg-white p-5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[#6B7280] uppercase tracking-wide">This Month</span>
                <FileText className="w-4 h-4 text-[#6B7280]" />
              </div>
              <div className="text-3xl font-bold text-[#1A1A1A] mb-1">{data.metrics.thisMonthBacklinks}</div>
              <div className="text-xs text-[#6B7280]">NEW BACKLINKS</div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6">
        <div className="flex items-center gap-2 text-sm text-[#6B7280] bg-[#F9FAFB] px-4 py-3 rounded-lg border border-[#E5E5E5]">
          <Info className="w-4 h-4 flex-shrink-0" />
          <span>The SEO Cycle coordinates content creation and backlink generation with built-in safety checks</span>
        </div>
      </div>
    </div>
  );
}