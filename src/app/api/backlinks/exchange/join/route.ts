import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateVerificationToken, validateSiteMetrics } from "@/lib/backlink-engine/exchange-service";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { site_id, verification_method, niche } = await req.json();

    if (!site_id || !verification_method || !niche) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get site details
    const { data: site, error: siteError } = await supabase
      .from('sites')
      .select('*')
      .eq('id', site_id)
      .eq('user_id', user.id)
      .single();

    if (siteError || !site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 });
    }

    // Validate metrics (DR 20+, Traffic 1k+)
    const siteUrl = site.website_url || site.url;
    if (!siteUrl) {
      return NextResponse.json({ error: "Site URL is missing" }, { status: 400 });
    }
    const { dr, traffic } = await validateSiteMetrics(siteUrl);

    if (dr < 20 || traffic < 1000) {
      return NextResponse.json({ 
        error: "Site does not meet authority requirements",
        metrics: { dr, traffic },
        requirements: { dr: 20, traffic: 1000 }
      }, { status: 403 });
    }

    // Generate token
    const verification_token = await generateVerificationToken();

    // Create participant record
    const { data: participant, error: participantError } = await supabase
      .from('exchange_participants')
      .upsert({
        user_id: user.id,
        site_id: site.id,
        domain_rating: dr,
        monthly_traffic: traffic,
        niche,
        verification_method,
        verification_token,
        verification_status: 'pending'
      }, { onConflict: 'site_id' })
      .select()
      .single();

    if (participantError) {
      throw participantError;
    }

    return NextResponse.json({ 
      success: true, 
      participant,
      verification_instructions: getVerificationInstructions(verification_method, verification_token)
    });

  } catch (error) {
    console.error('Join exchange failed:', error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function getVerificationInstructions(method: string, token: string) {
  if (method === 'meta_tag') {
    return `Add the following meta tag to your site's <head> section: <meta name="ranklite-verification" content="${token}">`;
  } else if (method === 'dns_record') {
    return `Add a TXT record to your domain's DNS settings with the following value: ranklite-verification=${token}`;
  } else {
    return "Ensure your site is connected via CMS integration in the settings page.";
  }
}
