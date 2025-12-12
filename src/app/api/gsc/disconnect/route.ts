import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/gsc/client";

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

    const { error } = await supabaseAdmin
      .from("gsc_integrations")
      .delete()
      .eq("site_id", site.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      message: "GSC disconnected successfully" 
    });
  } catch (error) {
    console.error("GSC disconnect error:", error);
    return NextResponse.json(
      { error: "Failed to disconnect GSC" },
      { status: 500 }
    );
  }
}
