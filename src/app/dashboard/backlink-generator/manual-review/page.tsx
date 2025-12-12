"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  SkipForward,
  ArrowLeft,
  Lock,
  ShieldAlert,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ManualReviewTask {
  id: string;
  website_url: string;
  status: string;
  manual_review_reason: string | null;
  submission_data: {
    business_name?: string;
    website_url?: string;
    description?: string;
  } | null;
  screenshot_url: string | null;
  platform: {
    site_name: string;
    site_domain: string;
    domain_rating: number;
    submission_url?: string;
  } | null;
}

interface Stats {
  pending: number;
  completed: number;
  require_manual: number;
  failed: number;
}

const REVIEW_REASONS: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  CAPTCHA_DETECTED: { label: "CAPTCHA Required", icon: <ShieldAlert className="h-4 w-4" />, color: "text-orange-600" },
  LOGIN_REQUIRED: { label: "Login Required", icon: <Lock className="h-4 w-4" />, color: "text-blue-600" },
  JS_CHALLENGE_DETECTED: { label: "Bot Protection", icon: <ShieldAlert className="h-4 w-4" />, color: "text-red-600" },
  ROBOTS_TXT_BLOCKED: { label: "Blocked by robots.txt", icon: <AlertCircle className="h-4 w-4" />, color: "text-gray-600" },
};

export default function ManualReviewPage() {
  const [tasks, setTasks] = useState<ManualReviewTask[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      const response = await fetch("/api/backlinks/tasks?filter=require_manual&limit=50");
      const data = await response.json();
      setTasks(data.manual_review_tasks || []);
      setStats(data.stats);
    } catch (error) {
      console.error("Failed to load tasks:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  async function handleAction(taskId: string, action: "mark_completed" | "skip") {
    setProcessingId(taskId);
    try {
      await fetch(`/api/backlinks/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      await loadTasks();
    } catch (error) {
      console.error("Failed to process task:", error);
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFFFE] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFFFE]">
      <header className="sticky top-0 z-30 border-b border-border bg-white px-8 py-5">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/backlink-generator"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <h1 className="text-xl font-semibold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            Manual Review Queue
          </h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
            {tasks.length} tasks
          </span>
        </div>
      </header>

      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-2xl border border-border bg-white p-4">
            <p className="text-xs text-muted-foreground mb-1">Pending Auto</p>
            <span className="text-2xl font-bold text-foreground">{stats?.pending || 0}</span>
          </div>
          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs text-orange-600 mb-1">Manual Review</p>
            <span className="text-2xl font-bold text-orange-700">{stats?.require_manual || 0}</span>
          </div>
          <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-600 mb-1">Completed</p>
            <span className="text-2xl font-bold text-green-700">{stats?.completed || 0}</span>
          </div>
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-600 mb-1">Failed</p>
            <span className="text-2xl font-bold text-red-700">{stats?.failed || 0}</span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="p-4 border-b border-border bg-gray-50">
            <p className="text-sm text-muted-foreground">
              These submissions require manual action. Click &quot;Open Submission Form&quot; to go to the platform and complete the submission, then mark as completed.
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
              <p className="font-medium text-foreground">All caught up!</p>
              <p className="text-sm text-muted-foreground mt-1">No tasks require manual review</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {tasks.map((task) => {
                const reasonInfo = REVIEW_REASONS[task.manual_review_reason || ""] || {
                  label: task.manual_review_reason || "Review Required",
                  icon: <AlertCircle className="h-4 w-4" />,
                  color: "text-gray-600",
                };

                return (
                  <div key={task.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-xl bg-white border border-border flex items-center justify-center overflow-hidden">
                          <Image
                            src={`https://www.google.com/s2/favicons?domain=${task.platform?.site_domain}&sz=64`}
                            alt={task.platform?.site_name || "Site"}
                            width={32}
                            height={32}
                            className="object-contain"
                            unoptimized
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{task.platform?.site_name}</h3>
                          <p className="text-sm text-muted-foreground">{task.platform?.site_domain}</p>
                          <div className={cn("flex items-center gap-1.5 mt-2 text-sm", reasonInfo.color)}>
                            {reasonInfo.icon}
                            {reasonInfo.label}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] text-xs font-medium">
                          DR {task.platform?.domain_rating || 0}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 rounded-xl bg-gray-50 p-4">
                      <p className="text-xs text-muted-foreground mb-2">Submission Details</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Business Name:</span>
                          <span className="ml-2 font-medium">{task.submission_data?.business_name || "-"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Website:</span>
                          <span className="ml-2 font-medium">{task.submission_data?.website_url || task.website_url}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Description:</span>
                          <p className="mt-1 text-foreground line-clamp-2">{task.submission_data?.description || "-"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {task.platform?.submission_url && (
                          <a
                            href={task.platform.submission_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white text-sm font-medium hover:bg-[#7C3AED] transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Open Submission Form
                          </a>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction(task.id, "skip")}
                          disabled={processingId === task.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          {processingId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <SkipForward className="h-4 w-4" />
                          )}
                          Skip
                        </button>
                        <button
                          onClick={() => handleAction(task.id, "mark_completed")}
                          disabled={processingId === task.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {processingId === task.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          Mark Completed
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}