import { supabaseAdmin } from "@/lib/supabase/admin";
import type { ModuleType, LinkTier } from "../backlink-core/types";

export interface ModuleConflictCheck {
  hasConflict: boolean;
  reason?: string;
  conflictType?: "page_isolation" | "reciprocity" | "tier_violation" | "velocity";
}

export interface ModuleUsageRecord {
  pageUrl: string;
  module: ModuleType;
  userId: string;
  createdAt: string;
}

export class ModuleCoordinator {
  static async checkPageAvailability(
    pageUrl: string,
    requestingModule: ModuleType,
    userId: string
  ): Promise<ModuleConflictCheck> {
    if (requestingModule === "distribution") {
      const { data: exchangeUsage } = await supabaseAdmin
        .from("link_inventory")
        .select("id, user_id")
        .eq("page_url", pageUrl)
        .eq("source_module", "exchange")
        .limit(1);

      if (exchangeUsage && exchangeUsage.length > 0) {
        return {
          hasConflict: true,
          reason: "Page is already registered in the Exchange module",
          conflictType: "page_isolation",
        };
      }
    }

    if (requestingModule === "exchange") {
      const { data: distributionUsage } = await supabaseAdmin
        .from("content_derivatives")
        .select("id")
        .eq("target_url", pageUrl)
        .eq("source_module", "distribution")
        .limit(1);

      if (distributionUsage && distributionUsage.length > 0) {
        return {
          hasConflict: true,
          reason: "Page is already used as a target in the Distribution module",
          conflictType: "page_isolation",
        };
      }
    }

    return { hasConflict: false };
  }

  static async checkReciprocityViolation(
    sourceUserId: string,
    targetUserId: string,
    targetDomain: string
  ): Promise<ModuleConflictCheck> {
    const { data: distributionLinks } = await supabaseAdmin
      .from("backlinks")
      .select("id, source_domain, target_domain")
      .eq("user_id", targetUserId)
      .ilike("target_domain", `%${targetDomain}%`);

    if (distributionLinks && distributionLinks.length > 0) {
      for (const link of distributionLinks) {
        const { data: reverseLinks } = await supabaseAdmin
          .from("backlinks")
          .select("id")
          .eq("user_id", sourceUserId)
          .ilike("source_domain", `%${link.source_domain}%`)
          .limit(1);

        if (reverseLinks && reverseLinks.length > 0) {
          return {
            hasConflict: true,
            reason: "Cross-module reciprocal pattern detected between Distribution links",
            conflictType: "reciprocity",
          };
        }
      }
    }

    const { data: exchangeToDistribution } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, source_inventory:link_inventory(domain)")
      .eq("target_user_id", sourceUserId)
      .eq("is_live", true);

    for (const link of exchangeToDistribution || []) {
      const inv = link.source_inventory as { domain?: string } | null;
      if (!inv?.domain) continue;

      const { data: distributionToExchange } = await supabaseAdmin
        .from("backlinks")
        .select("id")
        .eq("user_id", targetUserId)
        .ilike("source_domain", `%${inv.domain}%`)
        .limit(1);

      if (distributionToExchange && distributionToExchange.length > 0) {
        return {
          hasConflict: true,
          reason: "Cross-module reciprocal pattern detected (Exchange ↔ Distribution)",
          conflictType: "reciprocity",
        };
      }
    }

    return { hasConflict: false };
  }

  static async validateTierRules(
    sourceModule: ModuleType,
    sourceTier: LinkTier,
    targetTier: LinkTier
  ): Promise<ModuleConflictCheck> {
    if (sourceTier === 3 && targetTier === 1) {
      return {
        hasConflict: true,
        reason: "Tier 3 cannot link directly to Tier 1",
        conflictType: "tier_violation",
      };
    }

    if (sourceModule === "exchange" && sourceTier === 1 && targetTier === 1) {
      return {
        hasConflict: true,
        reason: "Exchange module cannot create Tier 1 → Tier 1 links",
        conflictType: "tier_violation",
      };
    }

    return { hasConflict: false };
  }

  static async checkCombinedVelocity(
    userId: string,
    tier: LinkTier
  ): Promise<{
    allowed: boolean;
    distributionCount: number;
    exchangeCount: number;
    combinedLimit: number;
    reason?: string;
  }> {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { data: distributionLinks } = await supabaseAdmin
      .from("backlinks")
      .select("id")
      .eq("user_id", userId)
      .eq("source_tier", tier)
      .gte("created_at", todayStart.toISOString());

    const { data: exchangeLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("target_user_id", userId)
      .gte("created_at", todayStart.toISOString());

    const distributionCount = distributionLinks?.length || 0;
    const exchangeCount = exchangeLinks?.length || 0;
    const totalToday = distributionCount + exchangeCount;

    const combinedLimits: Record<LinkTier, number> = {
      1: 3,
      2: 8,
      3: 15,
    };

    const combinedLimit = combinedLimits[tier];

    if (totalToday >= combinedLimit) {
      return {
        allowed: false,
        distributionCount,
        exchangeCount,
        combinedLimit,
        reason: `Combined daily limit of ${combinedLimit} Tier ${tier} links reached`,
      };
    }

    return {
      allowed: true,
      distributionCount,
      exchangeCount,
      combinedLimit,
    };
  }

  static async getModuleUsageForPage(pageUrl: string): Promise<{
    distribution: boolean;
    exchange: boolean;
    details: ModuleUsageRecord[];
  }> {
    const details: ModuleUsageRecord[] = [];

    const { data: derivatives } = await supabaseAdmin
      .from("content_derivatives")
      .select("id, user_id, target_url, source_module, created_at")
      .eq("target_url", pageUrl);

    derivatives?.forEach((d) => {
      details.push({
        pageUrl,
        module: d.source_module || "distribution",
        userId: d.user_id,
        createdAt: d.created_at,
      });
    });

    const { data: inventory } = await supabaseAdmin
      .from("link_inventory")
      .select("id, user_id, page_url, source_module, created_at")
      .eq("page_url", pageUrl);

    inventory?.forEach((i) => {
      details.push({
        pageUrl,
        module: i.source_module || "exchange",
        userId: i.user_id,
        createdAt: i.created_at,
      });
    });

    return {
      distribution: details.some((d) => d.module === "distribution"),
      exchange: details.some((d) => d.module === "exchange"),
      details,
    };
  }

  static async canModuleUsePage(
    pageUrl: string,
    module: ModuleType,
    userId: string
  ): Promise<{ canUse: boolean; reason?: string }> {
    const pageAvailability = await this.checkPageAvailability(pageUrl, module, userId);

    if (pageAvailability.hasConflict) {
      return { canUse: false, reason: pageAvailability.reason };
    }

    return { canUse: true };
  }

  static async validateFullExchange(
    requesterId: string,
    sourceUserId: string,
    targetUrl: string,
    sourceTier: LinkTier,
    targetTier: LinkTier
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    const tierCheck = await this.validateTierRules("exchange", sourceTier, targetTier);
    if (tierCheck.hasConflict) {
      errors.push(tierCheck.reason!);
    }

    const targetDomain = new URL(targetUrl).hostname;
    const reciprocityCheck = await this.checkReciprocityViolation(
      sourceUserId,
      requesterId,
      targetDomain
    );
    if (reciprocityCheck.hasConflict) {
      errors.push(reciprocityCheck.reason!);
    }

    const velocityCheck = await this.checkCombinedVelocity(requesterId, targetTier);
    if (!velocityCheck.allowed) {
      errors.push(velocityCheck.reason!);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async logModuleActivity(
    userId: string,
    module: ModuleType,
    action: string,
    details: Record<string, unknown>
  ): Promise<void> {
    await supabaseAdmin.from("activity_logs").insert({
      user_id: userId,
      type: `backlink_${module}`,
      action,
      details: JSON.stringify(details),
      created_at: new Date().toISOString(),
    });
  }

  static async getModuleHealth(userId: string): Promise<{
    distribution: { status: "healthy" | "warning" | "critical"; issues: string[] };
    exchange: { status: "healthy" | "warning" | "critical"; issues: string[] };
    crossModuleIssues: string[];
  }> {
    const distributionIssues: string[] = [];
    const exchangeIssues: string[] = [];
    const crossModuleIssues: string[] = [];

    const { data: distributionBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("is_indexed")
      .eq("user_id", userId);

    if (distributionBacklinks) {
      const indexRate = distributionBacklinks.filter((b) => b.is_indexed).length / distributionBacklinks.length;
      if (indexRate < 0.5) {
        distributionIssues.push("Distribution index rate below 50%");
      }
    }

    const { data: exchangeLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("is_indexed")
      .eq("target_user_id", userId);

    if (exchangeLinks) {
      const indexRate = exchangeLinks.filter((l) => l.is_indexed).length / exchangeLinks.length;
      if (indexRate < 0.5) {
        exchangeIssues.push("Exchange index rate below 50%");
      }
    }

    const getStatus = (issues: string[]): "healthy" | "warning" | "critical" => {
      if (issues.length === 0) return "healthy";
      if (issues.length <= 2) return "warning";
      return "critical";
    };

    return {
      distribution: { status: getStatus(distributionIssues), issues: distributionIssues },
      exchange: { status: getStatus(exchangeIssues), issues: exchangeIssues },
      crossModuleIssues,
    };
  }
}
