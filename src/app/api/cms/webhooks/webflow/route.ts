import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { triggerType, siteId, data } = body;

    if (!siteId || !triggerType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: integration } = await supabase
      .from("cms_integrations")
      .select("*")
      .eq("cms_type", "webflow")
      .eq("settings->>site_id", siteId)
      .single();

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (triggerType === 'collection_item_created' || 
        triggerType === 'collection_item_changed' || 
        triggerType === 'collection_item_deleted') {
      await supabase
        .from("cms_integrations")
        .update({
          last_sync_at: new Date().toISOString(),
        })
        .eq("id", integration.id);
    }

    return NextResponse.json({ success: true, message: "Webhook processed" });
  } catch (error) {
    console.error("Webflow webhook error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
