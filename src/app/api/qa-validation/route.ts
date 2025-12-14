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
      .select(`
        *,
        backlinks!backlink_verification_backlink_id_fkey (
          source_name, 
          linking_url
        )
      `)
      .eq("user_id", user.id)
      .order("last_verified_at", { ascending: false, nullsFirst: false })
      .limit(50);

    const records = (verifications || []).map(verification => {
      const backlink = Array.isArray(verification.backlinks) 
        ? verification.backlinks[0] 
        : verification.backlinks;
      
      return {
        id: verification.id,
        source: backlink?.source_name || "Unknown",
        http_status: verification.response_status_code || null,
        anchor_found: verification.found_anchor_text ? true : false,
        link_type: verification.is_dofollow ? "Dofollow" : verification.is_dofollow === false ? "Nofollow" : "Unknown",
        indexing_status: verification.is_indexed ? "Indexed" : "Pending",
        verification_status: 
          verification.verification_status === "verified" ? "Verified" :
          verification.verification_status === "warning" ? "Warning" :
          verification.verification_status === "failed" ? "Failed" :
          "Pending",
        last_checked: verification.last_verified_at 
          ? new Date(verification.last_verified_at).toLocaleDateString()
          : "Never",
      };
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error("Error loading validation records:", error);
    return NextResponse.json({ records: [] });
  }
}