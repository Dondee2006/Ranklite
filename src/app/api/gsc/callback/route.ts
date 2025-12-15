import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncGSCData } from "@/lib/gsc/sync";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/settings?tab=gsc&error=${error}`, request.url)
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=missing_code", request.url)
      );
    }

    // Decode state to get user ID
    const { userId } = JSON.parse(Buffer.from(state, "base64").toString());

    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=unauthorized", request.url)
      );
    }

    // Exchange code for tokens
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/gsc/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=config_missing", request.url)
      );
    }

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Token exchange failed:", errorData);
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=token_exchange_failed", request.url)
      );
    }

    const tokens = await tokenResponse.json();

    // Calculate token expiration
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);

    // Get user's site
    const { data: site } = await supabase
      .from("sites")
      .select("id, url")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=no_site", request.url)
      );
    }

    // Store tokens in database
    const { error: dbError } = await supabase
      .from("gsc_integrations")
      .upsert({
        site_id: site.id,
        user_id: user.id,
        property_url: site.url,
        site_url: site.url,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expires_at: expiresAt.toISOString(),
        scope: tokens.scope,
        auto_refresh_enabled: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "site_id",
      });

    if (dbError) {
      console.error("Failed to store GSC tokens:", dbError);
      return NextResponse.redirect(
        new URL("/dashboard/settings?tab=gsc&error=db_error", request.url)
      );
    }

    syncGSCData(site.id).catch((error) => {
      console.error("Initial GSC sync failed:", error);
    });

    return NextResponse.redirect(
      new URL("/dashboard/settings?tab=gsc&success=true", request.url)
    );
  } catch (error) {
    console.error("Error in GSC callback:", error);
    return NextResponse.redirect(
      new URL("/dashboard/settings?tab=gsc&error=unknown", request.url)
    );
  }
}