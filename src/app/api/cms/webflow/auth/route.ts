import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { WebflowService } from "@/lib/cms/webflow";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { access_token, site_id } = body;

    if (!access_token) {
      return NextResponse.json(
        { error: "Missing required field: access_token" },
        { status: 400 }
      );
    }

    const webflowService = new WebflowService({ accessToken: access_token });

    const isValid = await webflowService.validateConnection();
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Webflow access token" },
        { status: 400 }
      );
    }

    const sites = await webflowService.getSites();
    if (sites.length === 0) {
      return NextResponse.json(
        { error: "No Webflow sites found for this token" },
        { status: 400 }
      );
    }

    const selectedSite = site_id 
      ? sites.find(s => s.id === site_id) 
      : sites[0];

    if (!selectedSite) {
      return NextResponse.json(
        { error: "Selected site not found" },
        { status: 400 }
      );
    }

    const siteUrl = selectedSite.customDomains?.[0]?.url || selectedSite.previewUrl;

    const { data: existingIntegration } = await supabase
      .from("cms_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", "webflow")
      .single();

    if (existingIntegration) {
      const { error: updateError } = await supabase
        .from("cms_integrations")
        .update({
          credentials: { access_token },
          site_url: siteUrl,
          status: "connected",
          config: {
            site_id: selectedSite.id,
            site_name: selectedSite.displayName,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        message: "Webflow integration updated successfully",
        integration_id: existingIntegration.id,
        site: selectedSite,
      });
    }

    const { data: integration, error: insertError } = await supabase
      .from("cms_integrations")
      .insert({
        user_id: user.id,
        platform: "webflow",
        credentials: { access_token },
        site_url: siteUrl,
        status: "connected",
        config: {
          site_id: selectedSite.id,
          site_name: selectedSite.displayName,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      message: "Webflow connected successfully",
      integration_id: integration.id,
      site: selectedSite,
    });
  } catch (error: any) {
    console.error("Webflow auth error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to connect Webflow" },
      { status: 500 }
    );
  }
}