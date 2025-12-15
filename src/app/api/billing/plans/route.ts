import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: plans } = await supabase
      .from("plans")
      .select("*")
      .order("price", { ascending: true });

    return NextResponse.json({ plans: plans || [] });
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json({ plans: [] });
  }
}
