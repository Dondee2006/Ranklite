import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runVerificationCycle, getVerificationStats } from "@/lib/backlink-engine";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getVerificationStats(user.id);

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to get verification stats:", error);
    return NextResponse.json(
      { error: "Failed to get verification stats" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = await runVerificationCycle();

    return NextResponse.json({
      success: true,
      ...results,
    });
  } catch (error) {
    console.error("Verification cycle error:", error);
    return NextResponse.json(
      { error: "Verification cycle failed" },
      { status: 500 }
    );
  }
}
