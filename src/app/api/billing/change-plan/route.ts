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

    const now = new Date();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const isUpgrade = existingUserPlan && 
      existingUserPlan.plans && 
      newPlan.price > existingUserPlan.plans.price;

    if (existingUserPlan) {
      const updates: Record<string, unknown> = {
        plan_id: planId,
        status: "active",
        updated_at: now.toISOString(),
      };

      if (isUpgrade) {
        updates.current_period_start = now.toISOString();
        updates.current_period_end = periodEnd.toISOString();
      } else {
        updates.current_period_end = periodEnd.toISOString();
      }

      const { error: updateError } = await supabase
        .from("user_plans")
        .update(updates)
        .eq("id", existingUserPlan.id);

      if (updateError) {
        console.error("Failed to update user plan:", updateError);
        return NextResponse.json(
          { error: "Failed to update plan" },
          { status: 500 }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from("user_plans")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: "active",
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
        });

      if (insertError) {
        console.error("Failed to create user plan:", insertError);
        return NextResponse.json(
          { error: "Failed to create plan" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Plan ${isUpgrade ? 'upgraded' : 'changed'} successfully. ${isUpgrade ? 'Changes are effective immediately.' : 'Changes will take effect at the next billing cycle.'}`,
      immediate: isUpgrade,
    });
  } catch (error) {
    console.error("Failed to change plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}