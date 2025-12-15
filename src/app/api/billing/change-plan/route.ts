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

    const { data: newPlan, error: planError } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (planError || !newPlan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const { data: existingUserPlan } = await supabase
      .from("user_plans")
      .select(`*, plans(*)`)
      .eq("user_id", user.id)
      .single();

    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (existingUserPlan) {
      const { error: updateError } = await supabase
        .from("user_plans")
        .update({
          plan_id: planId,
          status: "active",
          current_period_start: now,
          current_period_end: periodEnd,
          updated_at: now,
        })
        .eq("id", existingUserPlan.id);

      if (updateError) {
        console.error("Failed to update plan:", updateError);
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
          current_period_start: now,
          current_period_end: periodEnd,
        });

      if (insertError) {
        console.error("Failed to create plan:", insertError);
        return NextResponse.json(
          { error: "Failed to create plan" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully changed to ${newPlan.name} plan`,
    });
  } catch (error) {
    console.error("Failed to change plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
