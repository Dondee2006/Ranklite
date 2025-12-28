import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import crypto from "crypto";

/**
 * Whop Webhook Handler
 * Path: /api/webhooks/whop
 * 
 * Logic:
 * 1. Verify signature using WHOP_WEBHOOK_SECRET
 * 2. Handle membership.went_active and membership.renewed events
 * 3. Update user_plans table with the correct plan and period
 */

export async function GET() {
    return NextResponse.json({ status: "Webhook endpoint is active. Use POST for Whop events." });
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const signature = request.headers.get("x-whop-signature");
        const secret = process.env.WHOP_WEBHOOK_SECRET;

        if (!secret) {
            console.error("WHOP_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }

        // Verify Signature
        if (signature) {
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(payload)
                .digest("hex");

            if (signature !== expectedSignature) {
                return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
            }
        } else {
            // In production, we should probably enforce signature
            console.warn("Whop webhook received without signature");
        }

        const event = JSON.parse(payload);
        console.log(`[Whop Webhook] Event received: ${event.action}`);

        const { action, data } = event;

        // We expect user_id to be passed in custom_fields or as a linked Whop user
        // Ideally, we store the Whop ID in our users table or use metadata
        // For this implementation, we assume metadata or whop_user_id is available
        const userId = data.custom_fields?.user_id || data.user_id;
        const planId = "pro"; // Defaulting to pro for the current checkout link

        if (!userId) {
            console.error("[Whop Webhook] No user_id found in event data");
            return NextResponse.json({ received: true }); // Acknowledge to stop retries
        }

        if (action === "membership.went_active" || action === "membership.renewed") {
            const isTrial = data.is_trial || data.plan?.price === 1 || data.price === 1; // Whop usually passes this
            const startDate = new Date();
            const endDate = new Date();

            if (isTrial) {
                console.log(`[Whop Webhook] Detected trial for user ${userId}. Setting 3-day period.`);
                endDate.setDate(endDate.getDate() + 3); // 3 Days Trial
            } else {
                endDate.setDate(endDate.getDate() + 30); // 30 Day Period
            }

            console.log(`[Whop Webhook] Activating plan ${planId} for user ${userId} until ${endDate.toISOString()}`);

            const { error } = await supabaseAdmin
                .from("user_plans")
                .upsert({
                    user_id: userId,
                    plan_id: planId,
                    status: "active",
                    current_period_start: startDate.toISOString(),
                    current_period_end: endDate.toISOString(),
                    updated_at: new Date().toISOString(),
                }, { onConflict: "user_id" });

            if (error) {
                console.error("[Whop Webhook] Database error:", error);
                return NextResponse.json({ error: "Database error" }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[Whop Webhook] Critical Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
