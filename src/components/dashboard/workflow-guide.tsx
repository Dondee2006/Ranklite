"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, CheckCircle, Circle, ChevronRight, Sparkles, FileText, Link as LinkIcon, Shield, TrendingUp, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  completed: boolean;
  optional?: boolean;
}

interface WorkflowGuideProps {
  onDismiss?: () => void;
  compact?: boolean;
}

export function WorkflowGuide({ onDismiss, compact = false }: WorkflowGuideProps) {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: "settings",
      title: "Configure Settings",
      description: "Set up your site, keywords, brand voice, and CMS connection",
      icon: SettingsIcon,
      href: "/dashboard/settings",
      completed: false,
    },
    {
      id: "planner",
      title: "Generate Content Calendar",
      description: "Create 30-day calendar of SEO-optimized topics",
      icon: FileText,
      href: "/dashboard/content-planner",
      completed: false,
    },
    {
      id: "content",
      title: "Enable Autopilot",
      description: "Auto-generate and publish articles daily",
      icon: Sparkles,
      href: "/dashboard/settings?tab=autopilot",
      completed: false,
    },
    {
      id: "backlinks",
      title: "Start Backlink Campaign",
      description: "AI agent builds backlinks for each article",
      icon: LinkIcon,
      href: "/dashboard/backlink-generator",
      completed: false,
    },
    {
      id: "qa",
      title: "Monitor QA Reports",
      description: "Verify backlinks are indexed and live",
      icon: Shield,
      href: "/dashboard/qa-validation",
      completed: false,
      optional: true,
    },
    {
      id: "performance",
      title: "Track Performance",
      description: "Monitor GSC metrics and rankings",
      icon: TrendingUp,
      href: "/dashboard/performance",
      completed: false,
      optional: true,
    },
  ]);

  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem("workflow_guide_dismissed");
    if (isDismissed) {
      setDismissed(true);
    }
    loadWorkflowStatus();
  }, []);

  async function loadWorkflowStatus() {
    try {
      const response = await fetch("/api/workflow/status");
      const data = await response.json();
      
      if (data.steps) {
        setSteps(prev => prev.map(step => ({
          ...step,
          completed: data.steps[step.id] || false,
        })));
      }
    } catch (error) {
      console.error("Failed to load workflow status:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDismiss = () => {
    localStorage.setItem("workflow_guide_dismissed", "true");
    setDismissed(true);
    onDismiss?.();
  };

  const completedCount = steps.filter(s => s.completed).length;
  const totalSteps = steps.filter(s => !s.optional).length;
  const progress = (completedCount / totalSteps) * 100;

  if (dismissed && !compact) return null;

  if (compact) {
    return (
      <div className="rounded-xl border border-[#22C55E]/30 bg-gradient-to-br from-[#F0FDF4] to-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#22C55E]">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">Quick Start Guide</h3>
              <p className="text-xs text-[#6B7280]">
                {completedCount} of {totalSteps} steps completed
              </p>
            </div>
          </div>
          <div className="text-lg font-bold text-[#22C55E]">{Math.round(progress)}%</div>
        </div>
        <div className="h-2 rounded-full bg-[#E5E7EB] overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-2">
          {steps.filter(s => !s.completed && !s.optional).slice(0, 2).map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className="flex items-center justify-between rounded-lg border border-[#E5E5E5] bg-white p-3 transition-all hover:border-[#22C55E] hover:shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Icon className="h-4 w-4 text-[#22C55E]" />
                  <span className="text-sm font-medium text-[#1A1A1A]">{step.title}</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[#6B7280]" />
              </Link>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#E5E5E5] bg-white shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">SEO Workflow Guide</h2>
              <p className="text-sm text-white/90">Follow these steps to accelerate your SEO growth</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="rounded-lg p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-white/90 mb-2">
            <span>Progress</span>
            <span className="font-semibold">{completedCount} of {totalSteps} steps completed</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.id}
                href={step.href}
                className={cn(
                  "flex items-start gap-4 rounded-lg border p-4 transition-all",
                  step.completed
                    ? "border-[#D1FAE5] bg-[#F0FDF4]"
                    : "border-[#E5E5E5] bg-white hover:border-[#22C55E] hover:shadow-md"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {step.completed ? (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#22C55E]">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#E5E5E5]">
                      <span className="text-xs font-semibold text-[#6B7280]">{index + 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-[#1A1A1A]">{step.title}</h3>
                    {step.optional && (
                      <span className="rounded bg-[#F3F4F6] px-2 py-0.5 text-xs font-medium text-[#6B7280]">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7280]">{step.description}</p>
                </div>
                <Icon className={cn(
                  "h-5 w-5 flex-shrink-0 mt-1",
                  step.completed ? "text-[#22C55E]" : "text-[#9CA3AF]"
                )} />
              </Link>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-[#E5E5E5] bg-[#F9FAFB] p-4">
          <h4 className="mb-2 font-semibold text-[#1A1A1A]">Efficient Mode</h4>
          <p className="text-sm text-[#6B7280] mb-3">
            Complete steps 1-3, enable autopilot, then monitor your overview dashboard. The system handles content generation, publishing, backlink building, and verification automatically.
          </p>
          <Button asChild className="w-full rounded-lg bg-[#22C55E] hover:bg-[#16A34A]">
            <Link href="/dashboard/settings">Go to Settings</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}