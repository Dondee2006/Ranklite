import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { instanceId, eventType, data } = body;

    if (!instanceId || !eventType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: integration } = await supabase
      .from("cms_integrations")
      .select("*")
      .eq("cms_type", "wix")
      .eq("settings->>instance_id", instanceId)
      .single();

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (eventType === 'posts/updated' || eventType === 'posts/created' || eventType === 'posts/deleted') {
      await supabase
        .from("cms_integrations")
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Wix webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
