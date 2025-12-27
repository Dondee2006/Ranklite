import { supabaseAdmin } from "@/lib/supabase/admin";

export interface IndexationStatus {
  url: string;
  isIndexed: boolean;
  lastChecked: string;
  checkCount: number;
  firstIndexedAt?: string;
  deIndexedAt?: string;
}

export interface HealthCheckResult {
  linkId: string;
  url: string;
  isLive: boolean;
  isIndexed: boolean;
  statusCode?: number;
  loadTime?: number;
  errorMessage?: string;
}

export interface LinkHealthSummary {
  totalLinks: number;
  liveLinks: number;
  indexedLinks: number;
  deIndexedLinks: number;
  deadLinks: number;
  indexRate: number;
  liveRate: number;
}

const GOOGLE_CACHE_URL = "https://webcache.googleusercontent.com/search?q=cache:";
const MIN_CHECK_INTERVAL_HOURS = 24;
const MAX_REINDEX_ATTEMPTS = 5;

export class IndexationMonitor {
  static async checkIndexation(url: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://www.google.com/search?q=site:${encodeURIComponent(url)}`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        }
      );

      if (!response.ok) return false;

      const text = await response.text();
      const hasResults = !text.includes("did not match any documents") && 
                        !text.includes("No results found");
      
      return hasResults;
    } catch (error) {
      console.error("Indexation check failed:", error);
      return false;
    }
  }

  static async checkLinkHealth(linkUrl: string): Promise<{
    isLive: boolean;
    statusCode?: number;
    loadTime?: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(linkUrl, {
        method: "HEAD",
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      return {
        isLive: response.ok,
        statusCode: response.status,
        loadTime: Date.now() - startTime,
      };
    } catch (error) {
      return {
        isLive: false,
        error: error instanceof Error ? error.message : "Unknown error",
        loadTime: Date.now() - startTime,
      };
    }
  }

  static async performFullHealthCheck(
    linkId: string,
    linkUrl: string,
    sourceModule: "distribution" | "exchange"
  ): Promise<HealthCheckResult> {
    const healthCheck = await this.checkLinkHealth(linkUrl);
    const isIndexed = healthCheck.isLive ? await this.checkIndexation(linkUrl) : false;

    const result: HealthCheckResult = {
      linkId,
      url: linkUrl,
      isLive: healthCheck.isLive,
      isIndexed,
      statusCode: healthCheck.statusCode,
      loadTime: healthCheck.loadTime,
      errorMessage: healthCheck.error,
    };

    if (sourceModule === "distribution") {
      await this.updateDistributionLinkHealth(linkId, result);
    } else {
      await this.updateExchangeLinkHealth(linkId, result);
    }

    return result;
  }

  private static async updateDistributionLinkHealth(linkId: string, result: HealthCheckResult): Promise<void> {
    const status = result.isLive ? "Live" : "Failed";
    
    await supabaseAdmin
      .from("backlinks")
      .update({
        status,
        is_indexed: result.isIndexed,
        last_checked: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", linkId);

    await this.logHealthCheck(linkId, "distribution", result);
  }

  private static async updateExchangeLinkHealth(linkId: string, result: HealthCheckResult): Promise<void> {
    await supabaseAdmin
      .from("exchange_link_graph")
      .update({
        is_live: result.isLive,
        is_indexed: result.isIndexed,
        last_verified_at: new Date().toISOString(),
        verification_count: supabaseAdmin.rpc("increment_field", { row_id: linkId, field_name: "verification_count" }),
      })
      .eq("id", linkId);

    await this.logHealthCheck(linkId, "exchange", result);
  }

  private static async logHealthCheck(
    linkId: string,
    module: "distribution" | "exchange",
    result: HealthCheckResult
  ): Promise<void> {
    await supabaseAdmin.from("link_health_logs").insert({
      link_id: linkId,
      module,
      url: result.url,
      is_live: result.isLive,
      is_indexed: result.isIndexed,
      status_code: result.statusCode,
      load_time_ms: result.loadTime,
      error_message: result.errorMessage,
      checked_at: new Date().toISOString(),
    });
  }

  static async getLinksNeedingCheck(
    module: "distribution" | "exchange",
    limit: number = 100
  ): Promise<{ id: string; url: string }[]> {
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - MIN_CHECK_INTERVAL_HOURS);

    if (module === "distribution") {
      const { data } = await supabaseAdmin
        .from("backlinks")
        .select("id, linking_url")
        .or(`last_checked.is.null,last_checked.lt.${cutoffTime.toISOString()}`)
        .eq("status", "Live")
        .limit(limit);

      return data?.map(d => ({ id: d.id, url: d.linking_url })) || [];
    } else {
      const { data } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("id, link_url")
        .or(`last_verified_at.is.null,last_verified_at.lt.${cutoffTime.toISOString()}`)
        .eq("is_live", true)
        .limit(limit);

      return data?.map(d => ({ id: d.id, url: d.link_url })) || [];
    }
  }

  static async getHealthSummary(
    userId: string,
    module: "distribution" | "exchange" | "all"
  ): Promise<LinkHealthSummary> {
    let distributionStats = { total: 0, live: 0, indexed: 0 };
    let exchangeStats = { total: 0, live: 0, indexed: 0 };

    if (module === "distribution" || module === "all") {
      const { data: distLinks } = await supabaseAdmin
        .from("backlinks")
        .select("status, is_indexed")
        .eq("user_id", userId);

      if (distLinks) {
        distributionStats.total = distLinks.length;
        distributionStats.live = distLinks.filter(l => l.status === "Live").length;
        distributionStats.indexed = distLinks.filter(l => l.is_indexed).length;
      }
    }

    if (module === "exchange" || module === "all") {
      const { data: exchLinks } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("is_live, is_indexed")
        .eq("target_user_id", userId);

      if (exchLinks) {
        exchangeStats.total = exchLinks.length;
        exchangeStats.live = exchLinks.filter(l => l.is_live).length;
        exchangeStats.indexed = exchLinks.filter(l => l.is_indexed).length;
      }
    }

    const total = distributionStats.total + exchangeStats.total;
    const live = distributionStats.live + exchangeStats.live;
    const indexed = distributionStats.indexed + exchangeStats.indexed;

    return {
      totalLinks: total,
      liveLinks: live,
      indexedLinks: indexed,
      deIndexedLinks: live - indexed,
      deadLinks: total - live,
      indexRate: total > 0 ? Math.round((indexed / total) * 100) : 0,
      liveRate: total > 0 ? Math.round((live / total) * 100) : 0,
    };
  }

  static async flagDeIndexedLinks(
    module: "distribution" | "exchange"
  ): Promise<{ flagged: number; linkIds: string[] }> {
    const links = await this.getLinksNeedingCheck(module, 50);
    const flaggedIds: string[] = [];

    for (const link of links) {
      const result = await this.performFullHealthCheck(link.id, link.url, module);
      
      if (!result.isIndexed && result.isLive) {
        flaggedIds.push(link.id);
      }
    }

    return { flagged: flaggedIds.length, linkIds: flaggedIds };
  }

  static async triggerReindexAttempt(linkId: string, linkUrl: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("link_health_logs")
      .select("id")
      .eq("link_id", linkId)
      .gte("checked_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const recentChecks = data?.length || 0;
    
    if (recentChecks >= MAX_REINDEX_ATTEMPTS) {
      return false;
    }

    await supabaseAdmin.from("reindex_queue").insert({
      link_id: linkId,
      url: linkUrl,
      attempts: recentChecks + 1,
      status: "pending",
      created_at: new Date().toISOString(),
    });

    return true;
  }

  static async runHealthCheckBatch(
    module: "distribution" | "exchange",
    batchSize: number = 20
  ): Promise<{
    checked: number;
    liveCount: number;
    indexedCount: number;
    failures: string[];
  }> {
    const links = await this.getLinksNeedingCheck(module, batchSize);
    
    let liveCount = 0;
    let indexedCount = 0;
    const failures: string[] = [];

    for (const link of links) {
      try {
        const result = await this.performFullHealthCheck(link.id, link.url, module);
        if (result.isLive) liveCount++;
        if (result.isIndexed) indexedCount++;
        if (!result.isLive) failures.push(link.id);
      } catch (error) {
        console.error(`Health check failed for ${link.id}:`, error);
        failures.push(link.id);
      }
    }

    return {
      checked: links.length,
      liveCount,
      indexedCount,
      failures,
    };
  }
}
