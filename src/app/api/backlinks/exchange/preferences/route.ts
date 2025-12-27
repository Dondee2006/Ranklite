import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { participant_id, min_dr_preference, min_traffic_preference, niche_preference } = body;

    const { error } = await supabase
      .from('exchange_participants')
      .update({
        min_dr_preference,
        min_traffic_preference,
        niche_preference
      })
      .eq('id', participant_id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update preferences failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
