import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: verifications } = await supabase
      .from("backlink_verification")
      .select("*, backlinks(source_name, linking_url)")
      .eq("user_id", user.id)
      .order("last_checked", { ascending: false })
      .limit(50);

    const records = (verifications || []).map(verification => ({
      id: verification.id,
      source: verification.backlinks?.source_name || "Unknown",
      http_status: verification.http_status || 200,
      anchor_found: verification.anchor_found || false,
      link_type: verification.is_dofollow ? "Dofollow" : "Nofollow",
      indexing_status: verification.is_indexed ? "Indexed" : "Pending",
      verification_status: 
        verification.verification_status === "verified" ? "Verified" :
        verification.verification_status === "warning" ? "Warning" :
        "Failed",
      last_checked: verification.last_checked 
        ? new Date(verification.last_checked).toLocaleDateString()
        : "Never",
    }));

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error loading validation records:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
