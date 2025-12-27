import { supabaseAdmin } from "@/lib/supabase/admin";
import type { RiskAssessment, RiskFactor, ModuleType } from "./types";

const SPAM_PATTERNS = [
  { pattern: /casino|gambling|poker/i, name: "Gambling content", impact: 50 },
  { pattern: /payday|loan|debt/i, name: "Predatory finance", impact: 40 },
  { pattern: /xxx|porn|adult/i, name: "Adult content", impact: 60 },
  { pattern: /pharma|viagra|cialis/i, name: "Pharmaceutical spam", impact: 50 },
  { pattern: /crypto.*scam|nft.*free/i, name: "Crypto scam", impact: 45 },
];

const RISKY_TLDS = [
  { tld: ".ru", impact: 15, name: "Russian TLD" },
  { tld: ".cn", impact: 15, name: "Chinese TLD" },
  { tld: ".tk", impact: 25, name: "Free TLD (Tokelau)" },
  { tld: ".ml", impact: 25, name: "Free TLD (Mali)" },
  { tld: ".ga", impact: 25, name: "Free TLD (Gabon)" },
  { tld: ".cf", impact: 25, name: "Free TLD (CAR)" },
  { tld: ".gq", impact: 25, name: "Free TLD (Eq. Guinea)" },
];

const DR_THRESHOLDS = {
  minimum: 10,
  low: 20,
  medium: 40,
  good: 60,
  excellent: 80,
};

const PLACEMENT_RISKS: Record<string, number> = {
  contextual: 0,
  author_bio: 5,
  sidebar: 15,
  footer: 20,
};

export class RiskScoring {
  static assessDomain(
    domain: string,
    domainRating: number,
    options?: {
      trustFlow?: number;
      traffic?: number;
      placement?: string;
      linkType?: string;
    }
  ): RiskAssessment {
    const factors: RiskFactor[] = [];
    let totalScore = 0;

    for (const spam of SPAM_PATTERNS) {
      if (spam.pattern.test(domain)) {
        factors.push({
          name: spam.name,
          impact: spam.impact,
          description: `Domain matches ${spam.name.toLowerCase()} pattern`,
        });
        totalScore += spam.impact;
      }
    }

    for (const risky of RISKY_TLDS) {
      if (domain.endsWith(risky.tld)) {
        factors.push({
          name: risky.name,
          impact: risky.impact,
          description: `Domain uses ${risky.tld} TLD`,
        });
        totalScore += risky.impact;
      }
    }

    if (domainRating < DR_THRESHOLDS.minimum) {
      factors.push({
        name: "Very low DR",
        impact: 25,
        description: `Domain rating ${domainRating} is below minimum (${DR_THRESHOLDS.minimum})`,
      });
      totalScore += 25;
    } else if (domainRating < DR_THRESHOLDS.low) {
      factors.push({
        name: "Low DR",
        impact: 15,
        description: `Domain rating ${domainRating} is low`,
      });
      totalScore += 15;
    }

    if (options?.trustFlow !== undefined && options.trustFlow < 10) {
      factors.push({
        name: "Low trust flow",
        impact: 10,
        description: `Trust flow ${options.trustFlow} indicates low authority`,
      });
      totalScore += 10;
    }

    if (options?.traffic !== undefined && options.traffic < 100) {
      factors.push({
        name: "No organic traffic",
        impact: 10,
        description: "Site has minimal organic traffic",
      });
      totalScore += 10;
    }

    if (options?.placement) {
      const placementRisk = PLACEMENT_RISKS[options.placement] || 0;
      if (placementRisk > 0) {
        factors.push({
          name: `${options.placement} placement`,
          impact: placementRisk,
          description: `Link placement in ${options.placement} is less valuable`,
        });
        totalScore += placementRisk;
      }
    }

    if (options?.linkType === "nofollow") {
      factors.push({
        name: "Nofollow link",
        impact: 5,
        description: "Link is nofollow and passes less authority",
      });
      totalScore += 5;
    }

    totalScore = Math.min(100, totalScore);

    let recommendation = "Safe to use";
    if (totalScore >= 50) {
      recommendation = "Reject - risk too high";
    } else if (totalScore >= 30) {
      recommendation = "Use with caution - monitor closely";
    } else if (totalScore >= 15) {
      recommendation = "Acceptable - minor concerns";
    }

    return {
      score: totalScore,
      factors,
      isAcceptable: totalScore < 50,
      recommendation,
    };
  }

  static async assessInventoryPage(inventoryId: string): Promise<RiskAssessment> {
    const { data: page } = await supabaseAdmin
      .from("link_inventory")
      .select("*")
      .eq("id", inventoryId)
      .single();

    if (!page) {
      return {
        score: 100,
        factors: [{ name: "Not found", impact: 100, description: "Inventory page not found" }],
        isAcceptable: false,
        recommendation: "Reject - page not found",
      };
    }

    return this.assessDomain(page.domain, page.domain_rating || 0, {
      trustFlow: page.trust_flow,
      traffic: page.traffic_estimate,
      placement: page.content_placement,
      linkType: page.link_type,
    });
  }

  static async assessPlatform(platformId: string): Promise<RiskAssessment> {
    const { data: platform } = await supabaseAdmin
      .from("backlink_platforms")
      .select("*")
      .eq("id", platformId)
      .single();

    if (!platform) {
      return {
        score: 100,
        factors: [{ name: "Not found", impact: 100, description: "Platform not found" }],
        isAcceptable: false,
        recommendation: "Reject - platform not found",
      };
    }

    const domain = platform.url
      ? new URL(platform.url).hostname
      : platform.name.toLowerCase().replace(/\s+/g, "");

    return this.assessDomain(domain, platform.domain_rating || 0);
  }

  static calculateQualityScore(
    domainRating: number,
    options?: {
      trustFlow?: number;
      traffic?: number;
      placement?: string;
      isIndexed?: boolean;
    }
  ): number {
    let score = 50;

    if (domainRating >= DR_THRESHOLDS.excellent) {
      score += 40;
    } else if (domainRating >= DR_THRESHOLDS.good) {
      score += 30;
    } else if (domainRating >= DR_THRESHOLDS.medium) {
      score += 20;
    } else if (domainRating >= DR_THRESHOLDS.low) {
      score += 10;
    } else {
      score -= 10;
    }

    if (options?.trustFlow) {
      if (options.trustFlow >= 40) score += 15;
      else if (options.trustFlow >= 20) score += 5;
      else if (options.trustFlow < 10) score -= 5;
    }

    if (options?.traffic) {
      if (options.traffic >= 10000) score += 10;
      else if (options.traffic >= 1000) score += 5;
      else if (options.traffic < 100) score -= 5;
    }

    if (options?.placement === "contextual") {
      score += 10;
    } else if (options?.placement === "sidebar" || options?.placement === "footer") {
      score -= 10;
    }

    if (options?.isIndexed) {
      score += 10;
    }

    return Math.max(0, Math.min(100, score));
  }

  static async getUserRiskProfile(userId: string): Promise<{
    averageRisk: number;
    highRiskCount: number;
    lowRiskCount: number;
    riskDistribution: Record<string, number>;
    recommendation: string;
  }> {
    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("source_domain, domain_rating, risk_score")
      .eq("user_id", userId);

    const { data: exchangeLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_inventory:link_inventory(domain, domain_rating, risk_score)")
      .eq("target_user_id", userId);

    const allRiskScores: number[] = [];

    backlinks?.forEach((b) => {
      if (b.risk_score !== undefined) {
        allRiskScores.push(b.risk_score);
      }
    });

    exchangeLinks?.forEach((l) => {
      const inv = l.source_inventory as { risk_score?: number } | null;
      if (inv?.risk_score !== undefined) {
        allRiskScores.push(inv.risk_score);
      }
    });

    if (allRiskScores.length === 0) {
      return {
        averageRisk: 0,
        highRiskCount: 0,
        lowRiskCount: 0,
        riskDistribution: { safe: 0, caution: 0, high: 0 },
        recommendation: "No backlinks to analyze",
      };
    }

    const averageRisk = allRiskScores.reduce((a, b) => a + b, 0) / allRiskScores.length;
    const highRiskCount = allRiskScores.filter((s) => s >= 30).length;
    const lowRiskCount = allRiskScores.filter((s) => s < 15).length;

    const riskDistribution = {
      safe: allRiskScores.filter((s) => s < 15).length,
      caution: allRiskScores.filter((s) => s >= 15 && s < 30).length,
      high: allRiskScores.filter((s) => s >= 30).length,
    };

    let recommendation = "Profile looks healthy";
    if (averageRisk >= 30) {
      recommendation = "High average risk - review and remove problematic links";
    } else if (averageRisk >= 20) {
      recommendation = "Moderate risk - be more selective with new links";
    } else if (highRiskCount > allRiskScores.length * 0.2) {
      recommendation = "Too many high-risk links - consider diversifying";
    }

    return {
      averageRisk: Math.round(averageRisk),
      highRiskCount,
      lowRiskCount,
      riskDistribution,
      recommendation,
    };
  }

  static isEligibleForExchange(
    riskScore: number,
    qualityScore: number,
    domainRating: number
  ): { eligible: boolean; reason?: string } {
    if (riskScore >= 50) {
      return { eligible: false, reason: "Risk score too high for exchange" };
    }

    if (qualityScore < 30) {
      return { eligible: false, reason: "Quality score too low for exchange" };
    }

    if (domainRating < DR_THRESHOLDS.low) {
      return { eligible: false, reason: `Domain rating below minimum (${DR_THRESHOLDS.low})` };
    }

    return { eligible: true };
  }
}
