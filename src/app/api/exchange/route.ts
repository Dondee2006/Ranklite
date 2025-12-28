import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch user's backlink campaign data
    const { data: campaign } = await supabase
      .from("backlink_campaigns")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Fetch backlink tasks (these represent the exchange activity)
    const { data: tasks } = await supabase
      .from("backlink_tasks")
      .select("*, platform:backlink_platforms(*)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch completed backlinks
    const { data: backlinks } = await supabase
      .from("backlinks")
      .select("*")
      .eq("user_id", user.id);

    // Fetch user's published articles (inventory)
    const { data: articles } = await supabase
      .from("articles")
      .select("*, sites!inner(url, name)")
      .eq("sites.user_id", user.id)
      .eq("status", "published");

    // Calculate credits (simplified - based on backlinks given vs received)
    const linksGiven = tasks?.filter(t => t.status === "completed").length || 0;
    const linksReceived = backlinks?.length || 0;
    const creditsBalance = Math.max(0, linksGiven * 10 - linksReceived * 10);

    // Build inventory from published articles
    const inventory = (articles || []).map(article => ({
      id: article.id,
      pageUrl: `${article.sites.url}/${article.slug}`,
      domain: new URL(article.sites.url).hostname,
      domainRating: 50, // Placeholder - would need external API
      qualityScore: 85,
      creditsPerLink: 10,
      currentLinks: 0,
      maxLinks: 5,
      status: "active",
      tier: 2,
      isIndexed: true,
    }));

    // Build transaction history
    const transactions = (tasks || []).slice(0, 20).map(task => ({
      id: task.id,
      type: task.status === "completed" ? "spent" : "pending",
      amount: -10,
      balanceAfter: creditsBalance,
      reason: `Backlink from ${task.platform?.site_name || "Unknown"} - ${task.anchor_type}`,
      createdAt: task.created_at,
    }));

    // Fetch exchange settings
    const { data: settings } = await supabase
      .from("exchange_settings")
      .select("*")
      .eq("user_id", user.id)
      .single();

    const defaultSettings = {
      autoAccept: false,
      minIncomingDR: 30,
      maxOutgoingPerDay: 5,
      minHopDistance: 2,
      tier1Enabled: true,
      tier2Enabled: true,
      tier3Enabled: false,
      autoExchangeEnabled: campaign?.status === "active",
      automationRiskLevel: campaign?.risk_level || "medium",
    };

    return NextResponse.json({
      credits: {
        balance: creditsBalance,
        pending: 0,
        lifetimeEarned: linksGiven * 10,
        lifetimeSpent: linksReceived * 10,
      },
      transactions,
      inventory: {
        total: inventory.length,
        verified: inventory.filter(i => i.isIndexed).length,
        pending: 0,
        pages: inventory,
      },
      stats: {
        linksGiven,
        linksReceived,
        pendingRequests: tasks?.filter(t => t.status === "pending").length || 0,
        avgHopDistance: 2.5,
        indexRate: 0.85,
      },
      settings: settings || defaultSettings,
    });
  } catch (error) {
    console.error("Exchange API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "update_settings") {
      const { settings } = body;

      // Update or create exchange settings
      const { error } = await supabase
        .from("exchange_settings")
        .upsert({
          user_id: user.id,
          ...settings,
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update campaign automation status if changed
      if (settings.autoExchangeEnabled !== undefined) {
        await supabase
          .from("backlink_campaigns")
          .update({
            status: settings.autoExchangeEnabled ? "active" : "paused",
            risk_level: settings.automationRiskLevel || "medium",
          })
          .eq("user_id", user.id);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "find_routes") {
      const { targetDomain } = body;

      // Find available backlink platforms/routes
      const { data: platforms } = await supabase
        .from("backlink_platforms")
        .select("*")
        .eq("automation_allowed", true)
        .limit(10);

      const routes = (platforms || []).map(platform => ({
        inventoryId: platform.id,
        domain: platform.site_domain,
        pageUrl: platform.submission_url || platform.site_domain,
        domainRating: platform.domain_rating || 40,
        qualityScore: 75,
        creditsRequired: Math.ceil((platform.domain_rating || 40) / 10),
        hopDistance: 2,
        tier: platform.domain_rating >= 70 ? 1 : platform.domain_rating >= 40 ? 2 : 3,
      }));

      return NextResponse.json({ routes });
    }

    if (action === "request_link") {
      const { inventoryId, targetUrl, anchorType } = body;

      // Create a backlink task
      const { data: platform } = await supabase
        .from("backlink_platforms")
        .select("*")
        .eq("id", inventoryId)
        .single();

      if (!platform) {
        return NextResponse.json({ error: "Platform not found" }, { status: 404 });
      }

      const { data: site } = await supabase
        .from("sites")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const { error } = await supabase
        .from("backlink_tasks")
        .insert({
          user_id: user.id,
          site_id: site?.id,
          platform_id: inventoryId,
          website_url: targetUrl,
          status: "pending",
          anchor_type: anchorType || "branded",
          scheduled_for: new Date().toISOString(),
          submission_data: {
            target_url: targetUrl,
            requested_via: "exchange",
          },
        });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Exchange POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
