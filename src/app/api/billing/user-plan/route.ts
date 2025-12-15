import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ userPlan: null });
    }

    const { data: userPlan } = await supabase
      .from("user_plans")
      .select("*, plans(*)")
      .eq("user_id", user.id)
      .single();

    return NextResponse.json({ userPlan: userPlan || null });
  } catch (error) {
    console.error("Error fetching user plan:", error);
    return NextResponse.json({ userPlan: null });
  }
}
