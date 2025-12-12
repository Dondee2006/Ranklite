import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncGSCData } from "@/lib/gsc/sync";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: site } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    const result = await syncGSCData(site.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Sync failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "GSC data synced successfully" });
  } catch (error) {
    console.error("GSC sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync GSC data" },
      { status: 500 }
    );
  }
}
