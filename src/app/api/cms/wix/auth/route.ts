import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WixService } from "@/lib/cms/wix";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { app_id, app_secret, instance_id, site_url } = body;

    if (!app_id || !app_secret || !instance_id) {
      return NextResponse.json(
        { error: "Missing required fields: app_id, app_secret, instance_id" },
        { status: 400 }
      );
    }

    const wixService = new WixService({
      appId: app_id,
      appSecret: app_secret,
      instanceId: instance_id,
    });

    const accessToken = await wixService.authenticate();
    const isValid = await wixService.validateConnection(accessToken);

    if (!isValid) {
      return NextResponse.json(
        { error: "Failed to validate Wix connection" },
        { status: 400 }
      );
    }

    const siteInfo = await wixService.getSiteInfo(accessToken);
    const finalSiteUrl = site_url || siteInfo?.url || `wix-site-${instance_id}`;

    const { data: existingIntegration } = await supabase
      .from("cms_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", "wix")
      .single();

    if (existingIntegration) {
      const { error: updateError } = await supabase
        .from("cms_integrations")
        .update({
          credentials: { access_token: accessToken },
          site_url: finalSiteUrl,
          status: "connected",
          config: {
            app_id,
            instance_id,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        message: "Wix integration updated successfully",
        integration_id: existingIntegration.id,
      });
    }

    const { data: integration, error: insertError } = await supabase
      .from("cms_integrations")
      .insert({
        user_id: user.id,
        platform: "wix",
        credentials: { access_token: accessToken },
        site_url: finalSiteUrl,
        status: "connected",
        config: {
          app_id,
          instance_id,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      message: "Wix connected successfully",
      integration_id: integration.id,
    });
  } catch (error: any) {
    console.error("Wix auth error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect Wix" },
      { status: 500 }
    );
  }
}