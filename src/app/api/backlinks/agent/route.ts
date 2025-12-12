import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runWorkerCycle, getQueueStats, logAction, createTasksForUser } from "@/lib/backlink-engine";

const AGENT_STEPS = [
  { step: "Scanning directories", duration: 3000 },
  { step: "Discovering opportunities", duration: 4000 },
  { step: "Checking policy compliance", duration: 5000 },
  { step: "Processing submissions", duration: 3000 },
  { step: "Verifying backlinks", duration: 4000 },
  { step: "Updating metrics", duration: 3000 },
];

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("url, name, description")
      .eq("user_id", user.id)
      .single();

    const websiteUrl = site?.url || null;
    const siteName = site?.name || "My Website";
    const siteDescription = site?.description || "";

    let { data: campaign } = await supabaseAdmin
      .from("backlink_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!campaign) {
      const { data: newCampaign } = await supabaseAdmin
        .from("backlink_campaigns")
        .insert({
          user_id: user.id,
          website_url: websiteUrl,
          status: "active",
          agent_status: "scanning",
          current_step: AGENT_STEPS[0].step,
          total_backlinks: 0,
          unique_sources: 0,
          avg_domain_rating: 0,
          this_month_backlinks: 0,
          is_paused: false,
          daily_submission_count: 0,
        })
        .select()
        .single();
      campaign = newCampaign;
    }

    if (!campaign) {
      return NextResponse.json({ error: "No campaign found" }, { status: 404 });
    }

    if (campaign.is_paused) {
      return NextResponse.json({
        success: true,
        paused: true,
        current_step: campaign.current_step,
      });
    }

    const currentStepIndex = AGENT_STEPS.findIndex(s => s.step === campaign.current_step);
    const nextStepIndex = (currentStepIndex + 1) % AGENT_STEPS.length;
    const nextStep = AGENT_STEPS[nextStepIndex];

    let workerResult = null;
    let newBacklink = null;
    let taskCreationResult = null;

    if (nextStep.step === "Discovering opportunities" && websiteUrl) {
      const stats = await getQueueStats(user.id);
      if (stats.pending === 0 && stats.processing === 0) {
        taskCreationResult = await createTasksForUser(
          user.id,
          websiteUrl,
          siteName,
          siteDescription
        );
        await logAction(user.id, "tasks_created", taskCreationResult);
      }
    }

    if (nextStep.step === "Processing submissions") {
      workerResult = await runWorkerCycle(user.id);
      
      if (workerResult?.success && workerResult.backlink_url) {
        const { data: backlink } = await supabaseAdmin
          .from("backlinks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();
        
        newBacklink = backlink;
      }
    }

    const stats = await getQueueStats(user.id);

    const { data: allBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("domain_rating, source_domain")
      .eq("user_id", user.id);

    const totalBacklinks = allBacklinks?.length || 0;
    const uniqueSources = new Set(allBacklinks?.map(b => b.source_domain)).size;
    const avgDR = totalBacklinks > 0
      ? Math.round(allBacklinks.reduce((sum, b) => sum + (b.domain_rating || 0), 0) / totalBacklinks)
      : 0;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: thisMonthCount } = await supabaseAdmin
      .from("backlinks")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("date_added", startOfMonth.toISOString());

    await supabaseAdmin
      .from("backlink_campaigns")
      .update({
        current_step: nextStep.step,
        agent_status: "scanning",
        total_backlinks: totalBacklinks,
        unique_sources: uniqueSources,
        avg_domain_rating: avgDR,
        this_month_backlinks: thisMonthCount || 0,
        pending_tasks: stats.pending,
        manual_review_count: stats.require_manual,
        failed_tasks: stats.failed,
        last_scan_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    return NextResponse.json({
      success: true,
      current_step: nextStep.step,
      new_backlink: newBacklink,
      worker_result: workerResult,
      task_creation: taskCreationResult,
      stats,
    });
  } catch (error) {
    console.error("Agent error:", error);
    return NextResponse.json(
      { error: "Agent processing failed" },
      { status: 500 }
    );
  }
}