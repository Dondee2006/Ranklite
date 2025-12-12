import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: platforms, error } = await supabaseAdmin
      .from("backlink_platforms")
      .select("*")
      .order("domain_rating", { ascending: false });

    if (error) throw error;

    const categorized = {
      automated: platforms?.filter(p => p.automation_allowed && !p.has_captcha) || [],
      manual_required: platforms?.filter(p => !p.automation_allowed || p.has_captcha) || [],
    };

    return NextResponse.json({
      platforms: platforms || [],
      categorized,
      total: platforms?.length || 0,
    });
  } catch (error) {
    console.error("Failed to fetch platforms:", error);
    return NextResponse.json(
      { error: "Failed to fetch platforms" },
      { status: 500 }
    );
  }
}
