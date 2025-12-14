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

    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .eq("id", planId)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: "Plan not found" },
        { status: 404 }
      );
    }

    const { data: existingUserPlan } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (existingUserPlan) {
      const { error: updateError } = await supabase
        .from("user_plans")
        .update({
          plan_id: planId,
          status: "active",
          start_date: new Date().toISOString(),
          end_date: null,
          updated_at: new Date().toISOString(),
        })
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
          start_date: new Date().toISOString(),
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
      message: "Plan updated successfully",
    });
  } catch (error) {
    console.error("Failed to change plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
