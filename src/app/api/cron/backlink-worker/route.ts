
import { NextResponse, NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { runWorkerCycle, getQueueStats, logAction, createTasksForUser } from "@/lib/backlink-engine";

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for processing

const AGENT_STEPS = [
    { step: "Scanning directories", duration: 3000 },
    { step: "Discovering opportunities", duration: 4000 },
    { step: "Checking policy compliance", duration: 5000 },
    { step: "Processing submissions", duration: 3000 },
    { step: "Verifying backlinks", duration: 4000 },
    { step: "Updating metrics", duration: 3000 },
];

export async function GET(request: NextRequest) {
    // 1. Security Check (Optional but recommended for production)
    // const authHeader = request.headers.get('authorization');
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new Response('Unauthorized', { status: 401 });
    // }

    try {
        // 2. Fetch all active campaigns that are not paused
        const { data: campaigns, error } = await supabaseAdmin
            .from("backlink_campaigns")
            .select("*")
            .eq("status", "active")
            .eq("is_paused", false);

        if (error) throw error;
        if (!campaigns || campaigns.length === 0) {
            return NextResponse.json({ message: "No active campaigns found" });
        }

        const results = [];

        // 3. Process each campaign
        for (const campaign of campaigns) {
            const userId = campaign.user_id;

            // Determine Next Step
            const currentStepIndex = AGENT_STEPS.findIndex(s => s.step === campaign.current_step);
            const nextStepIndex = (currentStepIndex + 1) % AGENT_STEPS.length;
            const nextStep = AGENT_STEPS[nextStepIndex];

            let actionResult = "advanced_step";

            // Logic A: Create Tasks
            if (nextStep.step === "Discovering opportunities" && campaign.website_url) {
                const stats = await getQueueStats(userId);
                // Only create tasks if queue is empty to avoid explosion
                if (stats.pending === 0 && stats.processing === 0) {
                    // Fetch site details for description
                    const { data: site } = await supabaseAdmin
                        .from("sites")
                        .select("name, description")
                        .eq("url", campaign.website_url)
                        .single();

                    await createTasksForUser(
                        userId,
                        campaign.website_url,
                        site?.name || "My Website",
                        site?.description || ""
                    );
                    actionResult = "tasks_created";
                }
            }

            // Logic B: Process Worker Cycle
            if (nextStep.step === "Processing submissions") {
                // Run multiple cycles to be efficient
                await runWorkerCycle(userId);
                await runWorkerCycle(userId);
                actionResult = "worker_cycled";
            }

            // 4. Update Campaign State
            await supabaseAdmin
                .from("backlink_campaigns")
                .update({
                    current_step: nextStep.step,
                    agent_status: "scanning", // Always 'active' effectively
                    last_scan_at: new Date().toISOString(),
                })
                .eq("id", campaign.id);

            results.push({
                userId,
                oldStep: campaign.current_step,
                newStep: nextStep.step,
                action: actionResult
            });
        }

        return NextResponse.json({
            success: true,
            processed: campaigns.length,
            results
        });

    } catch (error: any) {
        console.error("Cron Backlink Worker Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
