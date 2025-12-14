import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userPlan } = await supabase
      .from("user_plans")
      .select(`
        *,
        plans (*)
      `)
      .eq("user_id", user.id)
      .single();

    if (!userPlan) {
      return NextResponse.json({
        plan: null,
        status: null,
      });
    }

    return NextResponse.json({
      plan: userPlan.plans,
      status: userPlan.status,
      start_date: userPlan.start_date,
      end_date: userPlan.end_date,
    });
  } catch (error) {
    console.error("Failed to get current plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
