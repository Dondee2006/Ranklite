import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/gsc/callback`;

    if (!clientId) {
      return NextResponse.json(
        { error: "Google OAuth not configured. Please add GOOGLE_CLIENT_ID to environment variables." },
        { status: 500 }
      );
    }

    // Generate state parameter for CSRF protection
    const state = Buffer.from(JSON.stringify({ userId: user.id })).toString("base64");

    // Build OAuth URL
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", clientId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", "https://www.googleapis.com/auth/webmasters.readonly");
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    return NextResponse.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error("Error initiating GSC OAuth:", error);
    return NextResponse.json(
      { error: "Failed to initiate OAuth flow" },
      { status: 500 }
    );
  }
}
