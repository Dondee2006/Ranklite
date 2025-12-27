import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DistributionEngine, ExchangeEngine, UnifiedAnalytics } from "@/lib/modules";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const view = searchParams.get("view") || "unified";

    if (view === "unified") {
      const stats = await UnifiedAnalytics.getStats(user.id);
      const comparison = await UnifiedAnalytics.getModuleComparison(user.id);
      const riskReport = await UnifiedAnalytics.getRiskReport(user.id);
      
      return NextResponse.json({
        stats,
        comparison,
        riskReport,
      });
    }

    if (view === "distribution") {
      const stats = await DistributionEngine.getStats(user.id);
      return NextResponse.json({ distribution: stats });
    }

    if (view === "exchange") {
      const [stats, credits, settings] = await Promise.all([
        ExchangeEngine.getStats(user.id),
        ExchangeEngine.getCredits(user.id),
        ExchangeEngine.getSettings(user.id),
      ]);
      return NextResponse.json({ exchange: { ...stats, credits, settings } });
    }

    if (view === "timeseries") {
      const days = parseInt(searchParams.get("days") || "30");
      const timeseries = await UnifiedAnalytics.getTimeSeries(user.id, days);
      return NextResponse.json({ timeseries });
    }

    if (view === "authority") {
      const impact = await UnifiedAnalytics.getAuthorityImpact(user.id);
      return NextResponse.json({ authority: impact });
    }

    return NextResponse.json({ error: "Invalid view parameter" }, { status: 400 });
  } catch (error) {
    console.error("Unified backlinks API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch backlink data" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, module } = body;

    if (module === "distribution") {
      if (action === "distribute") {
        const { articleId, siteUrl } = body;
        if (!articleId || !siteUrl) {
          return NextResponse.json({ error: "articleId and siteUrl required" }, { status: 400 });
        }
        const result = await DistributionEngine.distributeArticle(articleId, user.id, siteUrl);
        return NextResponse.json({ success: true, ...result });
      }

      if (action === "check-velocity") {
        const { tier } = body;
        const result = await DistributionEngine.checkVelocity(user.id, tier || 2);
        return NextResponse.json(result);
      }

      if (action === "health-check") {
        const result = await DistributionEngine.runHealthCheck(body.batchSize || 20);
        return NextResponse.json({ success: true, ...result });
      }
    }

    if (module === "exchange") {
      if (action === "submit-inventory") {
        const { domain, pageUrl, domainRating, niche, maxOutboundLinks } = body;
        if (!domain || !pageUrl) {
          return NextResponse.json({ error: "domain and pageUrl required" }, { status: 400 });
        }
        const result = await ExchangeEngine.submitInventory({
          userId: user.id,
          domain,
          pageUrl,
          domainRating: domainRating || 0,
          niche,
          maxOutboundLinks,
        });
        return NextResponse.json(result);
      }

      if (action === "find-matches") {
        const { targetDomain, minDomainRating, niche, tier, limit } = body;
        const matches = await ExchangeEngine.findMatches(user.id, targetDomain || "", {
          minDomainRating,
          niche,
          tier,
          limit,
        });
        return NextResponse.json({ matches });
      }

      if (action === "execute") {
        const { match, targetUrl, keyword, siteName } = body;
        if (!match || !targetUrl || !keyword || !siteName) {
          return NextResponse.json({ error: "match, targetUrl, keyword, and siteName required" }, { status: 400 });
        }
        const result = await ExchangeEngine.executeExchange(
          user.id,
          match,
          targetUrl,
          keyword,
          siteName
        );
        return NextResponse.json(result);
      }

      if (action === "update-settings") {
        const { settings } = body;
        await ExchangeEngine.updateSettings(user.id, settings);
        return NextResponse.json({ success: true });
      }

      if (action === "get-transactions") {
        const transactions = await ExchangeEngine.getTransactionHistory(user.id, body.limit || 50);
        return NextResponse.json({ transactions });
      }

      if (action === "health-check") {
        const result = await ExchangeEngine.runHealthCheck(body.batchSize || 20);
        return NextResponse.json({ success: true, ...result });
      }

      if (action === "process-verifications") {
        const result = await ExchangeEngine.processLinkVerifications();
        return NextResponse.json({ success: true, ...result });
      }
    }

    return NextResponse.json({ error: "Invalid action or module" }, { status: 400 });
  } catch (error) {
    console.error("Unified backlinks API error:", error);
    return NextResponse.json(
      { error: "Action failed" },
      { status: 500 }
    );
  }
}
