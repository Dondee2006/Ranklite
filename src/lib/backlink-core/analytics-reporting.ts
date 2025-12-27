import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ModuleStats, UnifiedReport, ModuleType, AnchorType, LinkTier } from "./types";
import { IndexationMonitor } from "./indexation-monitor";
import { AnchorManager } from "./anchor-manager";

export class AnalyticsReporting {
  static async getModuleStats(userId: string, module: ModuleType): Promise<ModuleStats> {
    if (module === "distribution") {
      return this.getDistributionStats(userId);
    }
    return this.getExchangeStats(userId);
  }

  private static async getDistributionStats(userId: string): Promise<ModuleStats> {
    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("id, tier, source_tier, is_indexed, created_at")
      .eq("user_id", userId);

    const { data: pendingTasks } = await supabaseAdmin
      .from("backlink_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending");

    const links = backlinks || [];
    const tier1 = links.filter((l) => (l.tier || l.source_tier) === 1).length;
    const tier2 = links.filter((l) => (l.tier || l.source_tier) === 2).length;
    const tier3 = links.filter((l) => (l.tier || l.source_tier) === 3).length;
    const indexed = links.filter((l) => l.is_indexed).length;

    const lastActivity = links.length > 0
      ? links.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : undefined;

    return {
      module: "distribution",
      totalLinks: links.length,
      tier1Links: tier1,
      tier2Links: tier2,
      tier3Links: tier3,
      indexedLinks: indexed,
      indexRate: links.length > 0 ? Math.round((indexed / links.length) * 100) : 0,
      pendingTasks: pendingTasks?.length || 0,
      lastActivityAt: lastActivity,
    };
  }

  private static async getExchangeStats(userId: string): Promise<ModuleStats> {
    const { data: received } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, is_indexed, created_at")
      .eq("target_user_id", userId)
      .eq("is_live", true);

    const { data: inventory } = await supabaseAdmin
      .from("link_inventory")
      .select("id, tier")
      .eq("user_id", userId)
      .eq("is_active", true);

    const { data: pendingRequests } = await supabaseAdmin
      .from("exchange_requests")
      .select("id")
      .eq("requester_user_id", userId)
      .eq("status", "pending");

    const links = received || [];
    const indexed = links.filter((l) => l.is_indexed).length;

    const tier2Inventory = inventory?.filter((i) => i.tier === 2).length || 0;
    const tier3Inventory = inventory?.filter((i) => i.tier === 3).length || 0;

    const lastActivity = links.length > 0
      ? links.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
      : undefined;

    return {
      module: "exchange",
      totalLinks: links.length,
      tier1Links: 0,
      tier2Links: tier2Inventory,
      tier3Links: tier3Inventory,
      indexedLinks: indexed,
      indexRate: links.length > 0 ? Math.round((indexed / links.length) * 100) : 0,
      pendingTasks: pendingRequests?.length || 0,
      lastActivityAt: lastActivity,
    };
  }

  static async getUnifiedReport(userId: string): Promise<UnifiedReport> {
    const distribution = await this.getDistributionStats(userId);
    const exchange = await this.getExchangeStats(userId);

    const totalLinks = distribution.totalLinks + exchange.totalLinks;
    const totalIndexed = distribution.indexedLinks + exchange.indexedLinks;

    const anchorProfile = await AnchorManager.getAnchorProfile(userId);
    const anchorData: Record<AnchorType, { count: number; percentage: number }> = {} as Record<AnchorType, { count: number; percentage: number }>;
    for (const type of ["branded", "naked", "keyword", "partial", "generic"] as AnchorType[]) {
      anchorData[type] = anchorProfile.distribution[type] || { count: 0, percentage: 0 };
    }

    const tierDistribution: Record<LinkTier, { count: number; percentage: number }> = {
      1: {
        count: distribution.tier1Links,
        percentage: totalLinks > 0 ? Math.round((distribution.tier1Links / totalLinks) * 100) : 0,
      },
      2: {
        count: distribution.tier2Links + exchange.tier2Links,
        percentage: totalLinks > 0 ? Math.round(((distribution.tier2Links + exchange.tier2Links) / totalLinks) * 100) : 0,
      },
      3: {
        count: distribution.tier3Links + exchange.tier3Links,
        percentage: totalLinks > 0 ? Math.round(((distribution.tier3Links + exchange.tier3Links) / totalLinks) * 100) : 0,
      },
    };

    const recentActivity = await this.getRecentActivity(userId, 30);

    const overallIndexRate = totalLinks > 0 ? Math.round((totalIndexed / totalLinks) * 100) : 0;

    let authorityScore = 0;
    authorityScore += Math.min(40, totalLinks * 2);
    authorityScore += Math.min(30, overallIndexRate * 0.3);
    authorityScore += Math.min(20, distribution.tier1Links * 5);
    authorityScore += Math.min(10, exchange.totalLinks * 2);
    authorityScore = Math.min(100, authorityScore);

    let riskLevel: "low" | "medium" | "high" = "low";
    if (!anchorProfile.isHealthy || anchorProfile.overOptimized) {
      riskLevel = "high";
    } else if (anchorProfile.warnings.length > 0) {
      riskLevel = "medium";
    }

    return {
      userId,
      distribution,
      exchange,
      combined: {
        totalLinks,
        totalIndexed,
        overallIndexRate,
        authorityScore: Math.round(authorityScore),
        riskLevel,
      },
      anchorProfile: anchorData,
      tierDistribution,
      recentActivity,
    };
  }

  private static async getRecentActivity(
    userId: string,
    days: number
  ): Promise<{ date: string; distribution: number; exchange: number }[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", startDate.toISOString());

    const { data: exchangeLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("created_at")
      .eq("target_user_id", userId)
      .gte("created_at", startDate.toISOString());

    const activityByDate: Record<string, { distribution: number; exchange: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      activityByDate[dateStr] = { distribution: 0, exchange: 0 };
    }

    backlinks?.forEach((b) => {
      const dateStr = new Date(b.created_at).toISOString().split("T")[0];
      if (activityByDate[dateStr]) {
        activityByDate[dateStr].distribution++;
      }
    });

    exchangeLinks?.forEach((l) => {
      const dateStr = new Date(l.created_at).toISOString().split("T")[0];
      if (activityByDate[dateStr]) {
        activityByDate[dateStr].exchange++;
      }
    });

    return Object.entries(activityByDate)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  static async getAmplifiedArticles(userId: string): Promise<{
    id: string;
    title: string;
    keyword: string;
    backlinksCount: number;
    status: string;
  }[]> {
    const { data: articles } = await supabaseAdmin
      .from("articles")
      .select("id, title, keyword, backlinks_status, content_amplification_enabled")
      .eq("user_id", userId)
      .eq("content_amplification_enabled", true);

    if (!articles) return [];

    const results = [];

    for (const article of articles) {
      const { count } = await supabaseAdmin
        .from("backlinks")
        .select("id", { count: "exact", head: true })
        .eq("article_id", article.id);

      results.push({
        id: article.id,
        title: article.title,
        keyword: article.keyword,
        backlinksCount: count || 0,
        status: article.backlinks_status || "pending",
      });
    }

    return results;
  }

  static async getDashboardSummary(userId: string): Promise<{
    totalBacklinks: number;
    indexRate: number;
    pendingTasks: number;
    creditsBalance: number;
    healthScore: number;
    tier1Links: number;
    tier2Links: number;
    tier3Links: number;
    distributionEnabled: boolean;
    exchangeEnabled: boolean;
  }> {
    const report = await this.getUnifiedReport(userId);
    const healthReport = await IndexationMonitor.getHealthReport(userId);

    const { data: credits } = await supabaseAdmin
      .from("exchange_credits")
      .select("balance")
      .eq("user_id", userId)
      .single();

    const { data: settings } = await supabaseAdmin
      .from("exchange_settings")
      .select("tier2_enabled, tier3_enabled")
      .eq("user_id", userId)
      .single();

    return {
      totalBacklinks: report.combined.totalLinks,
      indexRate: report.combined.overallIndexRate,
      pendingTasks: report.distribution.pendingTasks + report.exchange.pendingTasks,
      creditsBalance: parseFloat(credits?.balance) || 0,
      healthScore: healthReport.healthScore,
      tier1Links: report.tierDistribution[1].count,
      tier2Links: report.tierDistribution[2].count,
      tier3Links: report.tierDistribution[3].count,
      distributionEnabled: true,
      exchangeEnabled: settings?.tier2_enabled || settings?.tier3_enabled || false,
    };
  }
}
