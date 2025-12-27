import { supabaseAdmin } from "@/lib/supabase/admin";

export type AnchorType = "branded" | "naked" | "keyword" | "partial" | "generic" | "lsi";

export interface AnchorDistribution {
  branded: number;
  naked: number;
  keyword: number;
  partial: number;
  generic: number;
  lsi: number;
}

export interface AnchorSelection {
  text: string;
  type: AnchorType;
  reason: string;
}

export interface AnchorStats {
  total: number;
  byType: Record<AnchorType, number>;
  distribution: AnchorDistribution;
  overOptimized: boolean;
  recommendations: string[];
}

const SAFE_ANCHOR_DISTRIBUTION: Record<number, AnchorDistribution> = {
  1: { branded: 0.45, naked: 0.35, keyword: 0.05, partial: 0.05, generic: 0.05, lsi: 0.05 },
  2: { branded: 0.35, naked: 0.30, keyword: 0.15, partial: 0.10, generic: 0.05, lsi: 0.05 },
  3: { branded: 0.30, naked: 0.40, keyword: 0.10, partial: 0.05, generic: 0.10, lsi: 0.05 },
};

const GENERIC_ANCHORS = [
  "click here",
  "read more",
  "learn more",
  "this article",
  "this guide",
  "source",
  "here",
  "website",
  "official site",
  "check it out",
];

const PARTIAL_TEMPLATES = [
  "{keyword} guide",
  "learn about {keyword}",
  "{keyword} tips",
  "best {keyword}",
  "{keyword} explained",
  "more on {keyword}",
  "about {keyword}",
];

export class AnchorManager {
  static async selectAnchor(params: {
    userId: string;
    targetUrl: string;
    keyword: string;
    siteName: string;
    tier: number;
    module: "distribution" | "exchange";
  }): Promise<AnchorSelection> {
    const currentStats = await this.getUserAnchorStats(params.userId, params.module);
    const targetDistribution = SAFE_ANCHOR_DISTRIBUTION[params.tier] || SAFE_ANCHOR_DISTRIBUTION[2];

    const selectedType = this.determineOptimalAnchorType(currentStats, targetDistribution);
    const text = this.generateAnchorText(selectedType, params);

    await this.logAnchorUsage(params.userId, params.targetUrl, text, selectedType, params.module);

    return {
      text,
      type: selectedType,
      reason: `Selected ${selectedType} to balance distribution (current: ${Math.round(currentStats.distribution[selectedType] * 100)}%, target: ${Math.round(targetDistribution[selectedType] * 100)}%)`,
    };
  }

  private static determineOptimalAnchorType(
    stats: AnchorStats,
    target: AnchorDistribution
  ): AnchorType {
    if (stats.total === 0) {
      const rand = Math.random();
      if (rand < 0.45) return "branded";
      if (rand < 0.80) return "naked";
      if (rand < 0.85) return "partial";
      return "generic";
    }

    let maxDeficit = -1;
    let selectedType: AnchorType = "branded";

    for (const type of Object.keys(target) as AnchorType[]) {
      const currentRatio = stats.distribution[type] || 0;
      const targetRatio = target[type];
      const deficit = targetRatio - currentRatio;

      if (deficit > maxDeficit) {
        maxDeficit = deficit;
        selectedType = type;
      }
    }

    if (stats.distribution.keyword > target.keyword * 1.5) {
      if (selectedType === "keyword") {
        selectedType = "branded";
      }
    }

    return selectedType;
  }

  private static generateAnchorText(type: AnchorType, params: {
    keyword: string;
    siteName: string;
    targetUrl: string;
  }): string {
    const siteUrl = params.targetUrl
      .replace(/^https?:\/\//, "")
      .replace(/\/$/, "")
      .split("/")[0];

    switch (type) {
      case "branded":
        return params.siteName;
      case "naked":
        return siteUrl;
      case "keyword":
        return params.keyword;
      case "partial":
        const template = PARTIAL_TEMPLATES[Math.floor(Math.random() * PARTIAL_TEMPLATES.length)];
        return template.replace("{keyword}", params.keyword.toLowerCase());
      case "generic":
        return GENERIC_ANCHORS[Math.floor(Math.random() * GENERIC_ANCHORS.length)];
      case "lsi":
        return this.generateLSIAnchor(params.keyword);
      default:
        return params.siteName;
    }
  }

  private static generateLSIAnchor(keyword: string): string {
    const words = keyword.toLowerCase().split(" ");
    if (words.length > 2) {
      return words.slice(0, 2).join(" ");
    }
    return `${keyword} resource`;
  }

  static async getUserAnchorStats(
    userId: string,
    module: "distribution" | "exchange" | "all"
  ): Promise<AnchorStats> {
    let anchors: { anchor_type: string }[] = [];

    if (module === "distribution" || module === "all") {
      const { data: distAnchors } = await supabaseAdmin
        .from("backlinks")
        .select("anchor_type")
        .eq("user_id", userId);
      
      if (distAnchors) anchors.push(...distAnchors);
    }

    if (module === "exchange" || module === "all") {
      const { data: exchAnchors } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("anchor_type")
        .eq("target_user_id", userId);
      
      if (exchAnchors) anchors.push(...exchAnchors);
    }

    const byType: Record<AnchorType, number> = {
      branded: 0, naked: 0, keyword: 0, partial: 0, generic: 0, lsi: 0,
    };

    for (const anchor of anchors) {
      const type = (anchor.anchor_type || "generic") as AnchorType;
      if (byType[type] !== undefined) {
        byType[type]++;
      }
    }

    const total = anchors.length;
    const distribution: AnchorDistribution = {
      branded: total > 0 ? byType.branded / total : 0,
      naked: total > 0 ? byType.naked / total : 0,
      keyword: total > 0 ? byType.keyword / total : 0,
      partial: total > 0 ? byType.partial / total : 0,
      generic: total > 0 ? byType.generic / total : 0,
      lsi: total > 0 ? byType.lsi / total : 0,
    };

    const overOptimized = distribution.keyword > 0.25;
    const recommendations = this.generateRecommendations(distribution);

    return {
      total,
      byType,
      distribution,
      overOptimized,
      recommendations,
    };
  }

  private static generateRecommendations(distribution: AnchorDistribution): string[] {
    const recommendations: string[] = [];

    if (distribution.keyword > 0.20) {
      recommendations.push("Reduce keyword-rich anchors to avoid over-optimization penalty");
    }
    if (distribution.branded < 0.30) {
      recommendations.push("Increase branded anchor usage for a more natural profile");
    }
    if (distribution.naked < 0.20) {
      recommendations.push("Add more naked URL anchors to diversify your profile");
    }
    if (distribution.generic < 0.05) {
      recommendations.push("Include generic anchors like 'click here' for natural variation");
    }

    return recommendations;
  }

  private static async logAnchorUsage(
    userId: string,
    targetUrl: string,
    anchorText: string,
    anchorType: AnchorType,
    module: "distribution" | "exchange"
  ): Promise<void> {
    await supabaseAdmin.from("anchor_usage_log").insert({
      user_id: userId,
      target_url: targetUrl,
      anchor_text: anchorText,
      anchor_type: anchorType,
      module,
      created_at: new Date().toISOString(),
    });
  }

  static async checkAnchorSafety(params: {
    userId: string;
    targetUrl: string;
    proposedAnchor: string;
    proposedType: AnchorType;
    module: "distribution" | "exchange";
  }): Promise<{
    isSafe: boolean;
    risk: "low" | "medium" | "high";
    reason?: string;
    suggestedAlternative?: AnchorSelection;
  }> {
    const stats = await this.getUserAnchorStats(params.userId, params.module);
    
    const { data: recentSameAnchor } = await supabaseAdmin
      .from("anchor_usage_log")
      .select("id")
      .eq("user_id", params.userId)
      .eq("anchor_text", params.proposedAnchor.toLowerCase())
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if ((recentSameAnchor?.length || 0) >= 3) {
      return {
        isSafe: false,
        risk: "high",
        reason: "Same anchor text used too frequently in last 30 days",
        suggestedAlternative: await this.selectAnchor({
          userId: params.userId,
          targetUrl: params.targetUrl,
          keyword: params.proposedAnchor,
          siteName: "Site",
          tier: 2,
          module: params.module,
        }),
      };
    }

    if (params.proposedType === "keyword" && stats.distribution.keyword > 0.20) {
      return {
        isSafe: false,
        risk: "medium",
        reason: "Keyword anchor distribution already exceeds safe threshold",
        suggestedAlternative: await this.selectAnchor({
          userId: params.userId,
          targetUrl: params.targetUrl,
          keyword: params.proposedAnchor,
          siteName: "Site",
          tier: 2,
          module: params.module,
        }),
      };
    }

    if (stats.overOptimized) {
      return {
        isSafe: params.proposedType !== "keyword",
        risk: "medium",
        reason: "Overall anchor profile is over-optimized",
      };
    }

    return {
      isSafe: true,
      risk: "low",
    };
  }

  static async getUserAnchorCaps(userId: string): Promise<{
    dailyKeywordCap: number;
    dailyPartialCap: number;
    remainingKeyword: number;
    remainingPartial: number;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const { data: todayAnchors } = await supabaseAdmin
      .from("anchor_usage_log")
      .select("anchor_type")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    const keywordToday = todayAnchors?.filter(a => a.anchor_type === "keyword").length || 0;
    const partialToday = todayAnchors?.filter(a => a.anchor_type === "partial").length || 0;

    const dailyKeywordCap = 2;
    const dailyPartialCap = 3;

    return {
      dailyKeywordCap,
      dailyPartialCap,
      remainingKeyword: Math.max(0, dailyKeywordCap - keywordToday),
      remainingPartial: Math.max(0, dailyPartialCap - partialToday),
    };
  }
}
