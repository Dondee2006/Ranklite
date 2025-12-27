import { supabaseAdmin } from "@/lib/supabase/admin";
import { DistributionEngine } from "./distribution";
import { ExchangeEngine } from "./exchange";
import { IndexationMonitor, AnchorManager, LinkGraphAnalyzer } from "@/lib/backlink-core";

export interface UnifiedStats {
  distribution: {
    tier1Links: number;
    tier2Links: number;
    tier3Links: number;
    indexedCount: number;
    indexRate: number;
    pendingTasks: number;
  };
  exchange: {
    linksGiven: number;
    linksReceived: number;
    pendingRequests: number;
    avgHopDistance: number;
    indexRate: number;
    inventoryCount: number;
    credits: {
      balance: number;
      pending: number;
    };
  };
  combined: {
    totalLinks: number;
    totalIndexed: number;
    overallIndexRate: number;
    linkHealthScore: number;
    graphSafetyScore: number;
  };
  anchorProfile: {
    distribution: Record<string, number>;
    overOptimized: boolean;
    recommendations: string[];
  };
}

export interface ModuleComparison {
  distribution: {
    riskLevel: "low" | "medium" | "high";
    velocity: number;
    avgDomainRating: number;
    enabled: boolean;
  };
  exchange: {
    riskLevel: "low" | "medium" | "high";
    velocity: number;
    avgDomainRating: number;
    enabled: boolean;
  };
}

export interface TimeSeriesData {
  date: string;
  distributionLinks: number;
  exchangeLinks: number;
  indexedLinks: number;
}

export class UnifiedAnalytics {
  static async getStats(userId: string): Promise<UnifiedStats> {
    const [distStats, exchStats, exchCredits, healthSummary, anchorStats, graphPatterns] = await Promise.all([
      DistributionEngine.getStats(userId),
      ExchangeEngine.getStats(userId),
      ExchangeEngine.getCredits(userId),
      IndexationMonitor.getHealthSummary(userId, "all"),
      AnchorManager.getUserAnchorStats(userId, "all"),
      LinkGraphAnalyzer.detectPatterns(userId),
    ]);

    const totalLinks = (distStats.tier1Links + distStats.tier2Links + distStats.tier3Links) +
                      (exchStats.linksGiven + exchStats.linksReceived);
    const totalIndexed = distStats.indexedCount + 
                        Math.round(exchStats.linksReceived * exchStats.indexRate / 100);
    
    const linkHealthScore = healthSummary.liveRate;
    const graphSafetyScore = graphPatterns.riskAssessment === "low" ? 100 :
                            graphPatterns.riskAssessment === "medium" ? 60 : 30;

    return {
      distribution: distStats,
      exchange: {
        ...exchStats,
        credits: {
          balance: exchCredits.balance,
          pending: exchCredits.pendingCredits,
        },
      },
      combined: {
        totalLinks,
        totalIndexed,
        overallIndexRate: totalLinks > 0 ? Math.round((totalIndexed / totalLinks) * 100) : 0,
        linkHealthScore,
        graphSafetyScore,
      },
      anchorProfile: {
        distribution: anchorStats.distribution,
        overOptimized: anchorStats.overOptimized,
        recommendations: anchorStats.recommendations,
      },
    };
  }

  static async getModuleComparison(userId: string): Promise<ModuleComparison> {
    const [distStats, exchStats, graphPatterns] = await Promise.all([
      DistributionEngine.getStats(userId),
      ExchangeEngine.getStats(userId),
      LinkGraphAnalyzer.detectPatterns(userId),
    ]);

    const { data: distBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("domain_rating, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);

    const { data: exchLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("created_at")
      .or(`source_user_id.eq.${userId},target_user_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(30);

    const last7Days = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const distVelocity = distBacklinks?.filter(b => 
      new Date(b.created_at).getTime() > last7Days
    ).length || 0;
    const exchVelocity = exchLinks?.filter(l => 
      new Date(l.created_at).getTime() > last7Days
    ).length || 0;

    const avgDistDR = distBacklinks?.length 
      ? distBacklinks.reduce((sum, b) => sum + (b.domain_rating || 0), 0) / distBacklinks.length 
      : 0;

    return {
      distribution: {
        riskLevel: "low",
        velocity: distVelocity,
        avgDomainRating: Math.round(avgDistDR),
        enabled: true,
      },
      exchange: {
        riskLevel: graphPatterns.riskAssessment,
        velocity: exchVelocity,
        avgDomainRating: 0,
        enabled: exchStats.inventoryCount > 0 || exchStats.linksReceived > 0,
      },
    };
  }

  static async getTimeSeries(userId: string, days: number = 30): Promise<TimeSeriesData[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: distBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("created_at, is_indexed")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    const { data: exchLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("created_at, is_indexed")
      .eq("target_user_id", userId)
      .gte("created_at", startDate.toISOString());

    const dataByDate = new Map<string, TimeSeriesData>();

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      dataByDate.set(dateStr, {
        date: dateStr,
        distributionLinks: 0,
        exchangeLinks: 0,
        indexedLinks: 0,
      });
    }

    distBacklinks?.forEach(link => {
      const dateStr = new Date(link.created_at).toISOString().split("T")[0];
      const entry = dataByDate.get(dateStr);
      if (entry) {
        entry.distributionLinks++;
        if (link.is_indexed) entry.indexedLinks++;
      }
    });

    exchLinks?.forEach(link => {
      const dateStr = new Date(link.created_at).toISOString().split("T")[0];
      const entry = dataByDate.get(dateStr);
      if (entry) {
        entry.exchangeLinks++;
        if (link.is_indexed) entry.indexedLinks++;
      }
    });

    return Array.from(dataByDate.values());
  }

  static async getAuthorityImpact(userId: string): Promise<{
    estimatedDRGain: number;
    linkEquity: number;
    topReferringDomains: { domain: string; dr: number; links: number }[];
    tierDistribution: { tier: number; count: number; indexRate: number }[];
  }> {
    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("source_domain, domain_rating, tier, source_tier, is_indexed")
      .eq("user_id", userId);

    const { data: exchLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("target_site_domain, is_indexed")
      .eq("target_user_id", userId);

    const domainMap = new Map<string, { dr: number; links: number }>();
    backlinks?.forEach(link => {
      const domain = link.source_domain || "unknown";
      const existing = domainMap.get(domain) || { dr: link.domain_rating || 0, links: 0 };
      existing.links++;
      domainMap.set(domain, existing);
    });

    const topDomains = Array.from(domainMap.entries())
      .sort((a, b) => b[1].dr - a[1].dr)
      .slice(0, 10)
      .map(([domain, data]) => ({ domain, dr: data.dr, links: data.links }));

    const tierStats = [1, 2, 3].map(tier => {
      const tierLinks = backlinks?.filter(b => (b.tier || b.source_tier) === tier) || [];
      const indexed = tierLinks.filter(b => b.is_indexed).length;
      return {
        tier,
        count: tierLinks.length,
        indexRate: tierLinks.length > 0 ? Math.round((indexed / tierLinks.length) * 100) : 0,
      };
    });

    const totalDR = backlinks?.reduce((sum, b) => sum + (b.domain_rating || 0), 0) || 0;
    const avgDR = backlinks?.length ? totalDR / backlinks.length : 0;
    const estimatedDRGain = Math.min(avgDR * 0.1, 15);

    const linkEquity = backlinks?.reduce((sum, b) => {
      const dr = b.domain_rating || 0;
      const indexed = b.is_indexed ? 1 : 0.3;
      return sum + (dr * indexed * 0.01);
    }, 0) || 0;

    return {
      estimatedDRGain: Math.round(estimatedDRGain * 10) / 10,
      linkEquity: Math.round(linkEquity * 100) / 100,
      topReferringDomains: topDomains,
      tierDistribution: tierStats,
    };
  }

  static async getRiskReport(userId: string): Promise<{
    overallRisk: "low" | "medium" | "high";
    factors: { name: string; status: "safe" | "warning" | "danger"; description: string }[];
    recommendations: string[];
  }> {
    const [graphPatterns, anchorStats, healthSummary] = await Promise.all([
      LinkGraphAnalyzer.detectPatterns(userId),
      AnchorManager.getUserAnchorStats(userId, "all"),
      IndexationMonitor.getHealthSummary(userId, "all"),
    ]);

    const factors: { name: string; status: "safe" | "warning" | "danger"; description: string }[] = [];
    const recommendations: string[] = [];

    if (graphPatterns.reciprocalCount > 0) {
      factors.push({
        name: "Reciprocal Links",
        status: "danger",
        description: `${graphPatterns.reciprocalCount} reciprocal patterns detected`,
      });
      recommendations.push("Remove reciprocal links to avoid Google penalties");
    } else {
      factors.push({
        name: "Reciprocal Links",
        status: "safe",
        description: "No reciprocal patterns detected",
      });
    }

    if (graphPatterns.avgPathDistance < 3 && graphPatterns.avgPathDistance > 0) {
      factors.push({
        name: "Link Distance",
        status: "warning",
        description: `Average hop distance is ${graphPatterns.avgPathDistance}`,
      });
      recommendations.push("Increase link source diversity");
    } else {
      factors.push({
        name: "Link Distance",
        status: "safe",
        description: "Link distances are healthy",
      });
    }

    if (anchorStats.overOptimized) {
      factors.push({
        name: "Anchor Profile",
        status: "warning",
        description: "Anchor text distribution appears over-optimized",
      });
      recommendations.push(...anchorStats.recommendations);
    } else {
      factors.push({
        name: "Anchor Profile",
        status: "safe",
        description: "Natural anchor text distribution",
      });
    }

    if (healthSummary.indexRate < 50) {
      factors.push({
        name: "Index Rate",
        status: "warning",
        description: `Only ${healthSummary.indexRate}% of links are indexed`,
      });
      recommendations.push("Focus on higher quality link placements");
    } else {
      factors.push({
        name: "Index Rate",
        status: "safe",
        description: `${healthSummary.indexRate}% index rate`,
      });
    }

    if (healthSummary.liveRate < 80) {
      factors.push({
        name: "Link Survival",
        status: "danger",
        description: `${100 - healthSummary.liveRate}% of links have been removed`,
      });
      recommendations.push("Monitor link health more frequently");
    } else {
      factors.push({
        name: "Link Survival",
        status: "safe",
        description: `${healthSummary.liveRate}% of links are still live`,
      });
    }

    const dangerCount = factors.filter(f => f.status === "danger").length;
    const warningCount = factors.filter(f => f.status === "warning").length;

    let overallRisk: "low" | "medium" | "high" = "low";
    if (dangerCount > 0) overallRisk = "high";
    else if (warningCount >= 2) overallRisk = "medium";

    if (recommendations.length === 0) {
      recommendations.push("Your link profile looks healthy. Continue current strategy.");
    }

    return {
      overallRisk,
      factors,
      recommendations,
    };
  }
}
