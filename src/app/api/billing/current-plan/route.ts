import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUserPlanAndUsage } from "@/lib/usage-limits";

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

    const { plan, usage, status, periodEnd } = await getUserPlanAndUsage(user.id);

    if (!plan) {
      return NextResponse.json({
        plan: null,
        usage: null,
        status: null,
      });
    }

    return NextResponse.json({
      plan,
      usage,
      status,
      periodEnd,
    });
  } catch (error) {
    console.error("Failed to get current plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}