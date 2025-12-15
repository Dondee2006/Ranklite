import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    const { data: existingUserPlan } = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const now = new Date().toISOString();
    const periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    if (existingUserPlan) {
      await supabase
        .from("user_plans")
        .update({
          plan_id: planId,
          status: "active",
          current_period_start: now,
          current_period_end: periodEnd,
          updated_at: now,
        })
        .eq("id", existingUserPlan.id);
    } else {
      await supabase
        .from("user_plans")
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: "active",
          current_period_start: now,
          current_period_end: periodEnd,
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
