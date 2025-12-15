import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    if (error) {
      console.error("Error fetching plans:", error);
      return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    console.error("Error in /api/billing/plans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}