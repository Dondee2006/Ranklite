import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data: userPlan, error: planError } = await supabase
      .from("user_plans")
      .select(`
        *,
        plans (*)
      `)
      .eq("user_id", user.id)
      .single();

    if (planError) {
      return NextResponse.json({
        userPlan: null,
        message: "No active plan found"
      });
    }

    return NextResponse.json({ userPlan });
  } catch (error) {
    console.error("Failed to fetch user plan:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
