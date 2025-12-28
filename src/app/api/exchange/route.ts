import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CreditSystem, LinkInventoryPool, SmartLinkRouter } from "@/lib/services/exchange";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const balance = await CreditSystem.getBalance(user.id);
    const transactions = await CreditSystem.getTransactionHistory(user.id, 20);
    const inventory = await LinkInventoryPool.getUserInventory(user.id);
    const exchangeStats = await SmartLinkRouter.getExchangeStats(user.id);
    const settings = await SmartLinkRouter.getUserSettings(user.id);

    const verifiedInventory = inventory.filter(i => i.verification_status === "verified");
    const pendingInventory = inventory.filter(i => i.verification_status === "pending");

    return NextResponse.json({
      credits: {
        balance: balance.balance,
        pending: balance.pendingCredits,
        lifetimeEarned: balance.lifetimeEarned,
        lifetimeSpent: balance.lifetimeSpent,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: parseFloat(t.amount),
        balanceAfter: parseFloat(t.balance_after),
        reason: t.reason,
        createdAt: t.created_at,
      })),
      inventory: {
        total: inventory.length,
        verified: verifiedInventory.length,
        pending: pendingInventory.length,
        pages: inventory.map(i => ({
          id: i.id,
          pageUrl: i.page_url,
          domain: i.domain,
          domainRating: i.domain_rating,
          qualityScore: parseFloat(i.quality_score),
          creditsPerLink: parseFloat(i.credits_per_link),
          currentLinks: i.current_outbound_links,
          maxLinks: i.max_outbound_links,
          status: i.verification_status,
          tier: i.tier,
          isIndexed: i.is_indexed,
        })),
      },
      stats: {
        linksGiven: exchangeStats.linksGiven,
        linksReceived: exchangeStats.linksReceived,
        pendingRequests: exchangeStats.pendingRequests,
        avgHopDistance: exchangeStats.avgHopDistance,
        indexRate: exchangeStats.indexRate,
      },
      settings: {
        autoAccept: settings.auto_accept_requests,
        minIncomingDR: settings.min_incoming_dr,
        maxOutgoingPerDay: settings.max_outgoing_per_day,
        minHopDistance: settings.min_hop_distance,
        tier1Enabled: settings.tier1_enabled,
        tier2Enabled: settings.tier2_enabled,
        tier3Enabled: settings.tier3_enabled,
        autoExchangeEnabled: settings.auto_exchange_enabled,
        automationRiskLevel: settings.automation_risk_level,
      },
    });
  } catch (error) {
    console.error("Exchange GET error:", error);
    return NextResponse.json({ error: "Failed to fetch exchange data" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "submit_inventory": {
        const { siteId, pages } = body;

        if (!pages || !Array.isArray(pages) || pages.length === 0) {
          return NextResponse.json({ error: "Pages array is required" }, { status: 400 });
        }

        const result = await LinkInventoryPool.submitInventory(user.id, siteId, pages);

        return NextResponse.json({
          success: true,
          submitted: result.submitted,
          rejected: result.rejected,
          errors: result.errors,
        });
      }

      case "find_routes": {
        const { targetDomain, minDomainRating, maxRiskScore, niche, tier } = body;

        if (!targetDomain) {
          return NextResponse.json({ error: "Target domain is required" }, { status: 400 });
        }

        const routes = await SmartLinkRouter.findMatchingRoutes(user.id, targetDomain, {
          minDomainRating,
          maxRiskScore,
          niche,
          tier,
          limit: 20,
        });

        return NextResponse.json({
          success: true,
          routes: routes.map(r => ({
            inventoryId: r.inventoryId,
            domain: r.domain,
            pageUrl: r.pageUrl,
            domainRating: r.domainRating,
            qualityScore: r.qualityScore,
            creditsRequired: r.creditsRequired,
            hopDistance: r.hopDistance,
            tier: r.tier,
          })),
        });
      }

      case "request_link": {
        const { inventoryId, targetUrl, anchorText, anchorType } = body;

        if (!inventoryId || !targetUrl) {
          return NextResponse.json({ error: "Inventory ID and target URL are required" }, { status: 400 });
        }

        const routes = await SmartLinkRouter.findMatchingRoutes(user.id, new URL(targetUrl).hostname, {
          limit: 100,
        });

        const matchedRoute = routes.find(r => r.inventoryId === inventoryId);
        if (!matchedRoute) {
          return NextResponse.json({ error: "Invalid or unavailable route" }, { status: 400 });
        }

        const result = await SmartLinkRouter.executeExchange(
          user.id,
          matchedRoute,
          targetUrl,
          anchorText || new URL(targetUrl).hostname,
          anchorType || "branded"
        );

        if (!result.success) {
          return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
          success: true,
          linkId: result.linkId,
          creditsSpent: matchedRoute.creditsRequired,
        });
      }

      case "update_settings": {
        const { settings } = body;

        await SmartLinkRouter.updateUserSettings(user.id, {
          auto_accept_requests: settings.autoAccept,
          min_incoming_dr: settings.minIncomingDR,
          max_outgoing_per_day: settings.maxOutgoingPerDay,
          min_hop_distance: settings.minHopDistance,
          tier1_enabled: settings.tier1Enabled,
          tier2_enabled: settings.tier2Enabled,
          tier3_enabled: settings.tier3Enabled,
          auto_exchange_enabled: settings.autoExchangeEnabled,
          automation_risk_level: settings.automationRiskLevel,
        });

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Exchange POST error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}
