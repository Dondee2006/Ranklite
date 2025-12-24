import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { FramerService } from "@/lib/cms/framer";

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

    const framerService = new FramerService({ accessToken: access_token });

    const isValid = await framerService.validateConnection();
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Framer access token" },
        { status: 400 }
      );
    }

    const sites = await framerService.getSites();
    if (sites.length === 0) {
      return NextResponse.json(
        { error: "No Framer sites found for this token" },
        { status: 400 }
      );
    }

    const selectedSite = site_id
      ? sites.find((s) => (s as { id: string }).id === site_id)
      : sites[0];

    if (!selectedSite) {
      return NextResponse.json(
        { error: "Selected site not found" },
        { status: 400 }
      );
    }

    const site = selectedSite as { id: string; url?: string; customDomain?: string; domain?: string; name?: string; displayName?: string };
    const siteUrl = site.customDomain || site.url || site.domain;

    const { data: existingIntegration } = await supabaseAdmin
      .from("cms_integrations")
      .select("id")
      .eq("user_id", user.id)
      .eq("platform", "framer")
      .single();

    if (existingIntegration) {
      const { error: updateError } = await supabaseAdmin
        .from("cms_integrations")
        .update({
          credentials: { access_token },
          site_url: siteUrl,
          status: "active",
          config: {
            site_id: site.id,
            site_name: site.name || site.displayName,
          },
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({
        message: "Framer integration updated successfully",
        integration_id: existingIntegration.id,
        site: selectedSite,
      });
    }

    const { data: integration, error: insertError } = await supabaseAdmin
      .from("cms_integrations")
      .insert({
        user_id: user.id,
        platform: "framer",
        credentials: { access_token },
        site_url: siteUrl,
        status: "active",
        config: {
          site_id: site.id,
          site_name: site.name || site.displayName,
        },
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      message: "Framer connected successfully",
      integration_id: integration.id,
      site: selectedSite,
    });
  } catch (error: unknown) {
    console.error("Framer auth error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to connect Framer";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
