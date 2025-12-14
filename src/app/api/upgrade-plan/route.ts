import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    const { data: newPlan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!newPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const { data: existingUserPlan } = await supabase
      .from("user_plans")
      .select("*, plans(*)")
      .eq("user_id", user.id)
      .single();

    if (!existingUserPlan || !existingUserPlan.plans) {
      return NextResponse.json(
        { error: "No existing plan found. Please subscribe first." },
        { status: 400 }
      );
    }

    if (newPlan.price <= existingUserPlan.plans.price) {
      return NextResponse.json(
        { error: "This is not an upgrade. Use /api/downgrade-plan instead." },
        { status: 400 }
      );
    }

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const { error: updateError } = await supabase
      .from("user_plans")
      .update({
        plan_id: planId,
        status: "active",
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", existingUserPlan.id);

    if (updateError) {
      console.error("Failed to upgrade plan:", updateError);
      return NextResponse.json(
        { error: "Failed to upgrade plan" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${newPlan.name}. Changes are effective immediately.`,
      immediate: true,
      newPlan: {
        name: newPlan.name,
        price: newPlan.price,
        limits: {
          posts_per_month: newPlan.posts_per_month,
          backlinks_per_post: newPlan.backlinks_per_post,
        },
      },
    });
  } catch (error) {
    console.error("Failed to upgrade plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
