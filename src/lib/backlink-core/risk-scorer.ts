import { supabaseAdmin } from "@/lib/supabase/admin";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export interface DomainScore {
  domain: string;
  trustScore: number;
  riskScore: number;
  riskLevel: RiskLevel;
  domainRating: number;
  spamScore: number;
  isEligible: boolean;
  factors: RiskFactor[];
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  reason?: string;
  riskLevel: RiskLevel;
  trustScore: number;
  recommendations: string[];
}

const SPAM_KEYWORDS = [
  "casino", "gambling", "poker", "slots",
  "viagra", "cialis", "pharmacy", "pills",
  "porn", "xxx", "adult", "sex",
  "payday", "loan", "debt",
  "crypto", "bitcoin", "forex", "trading",
];

const RISKY_TLDS = [
  ".xyz", ".top", ".tk", ".pw", ".cc", ".ws", ".cf", ".ga", ".gq", ".ml",
];

const TRUST_INDICATORS = [
  { pattern: /\.gov$/, boost: 30 },
  { pattern: /\.edu$/, boost: 25 },
  { pattern: /\.org$/, boost: 10 },
  { pattern: /\.com$/, boost: 5 },
];

export class RiskScorer {
  static async scoreDomain(domain: string): Promise<DomainScore> {
    const factors: RiskFactor[] = [];
    let baseScore = 50;

    const spamCheck = this.checkSpamKeywords(domain);
    if (spamCheck.isSpam) {
      factors.push({
        name: "Spam Keywords",
        impact: -40,
        description: `Contains risky keyword: ${spamCheck.keyword}`,
      });
      baseScore -= 40;
    }

    const tldCheck = this.checkRiskyTLD(domain);
    if (tldCheck.isRisky) {
      factors.push({
        name: "Risky TLD",
        impact: -20,
        description: `Uses risky TLD: ${tldCheck.tld}`,
      });
      baseScore -= 20;
    }

    for (const indicator of TRUST_INDICATORS) {
      if (indicator.pattern.test(domain)) {
        factors.push({
          name: "Trusted TLD",
          impact: indicator.boost,
          description: `Has trusted domain extension`,
        });
        baseScore += indicator.boost;
        break;
      }
    }

    const domainAge = await this.estimateDomainAge(domain);
    if (domainAge < 6) {
      factors.push({
        name: "New Domain",
        impact: -15,
        description: "Domain is less than 6 months old",
      });
      baseScore -= 15;
    } else if (domainAge > 24) {
      factors.push({
        name: "Established Domain",
        impact: 10,
        description: "Domain is over 2 years old",
      });
      baseScore += 10;
    }

    const { data: existingData } = await supabaseAdmin
      .from("domain_scores")
      .select("domain_rating, spam_score")
      .eq("domain", domain)
      .single();

    let domainRating = existingData?.domain_rating || 0;
    let spamScore = existingData?.spam_score || 0;

    if (domainRating >= 50) {
      factors.push({
        name: "High Authority",
        impact: 15,
        description: `Domain Rating: ${domainRating}`,
      });
      baseScore += 15;
    } else if (domainRating < 20) {
      factors.push({
        name: "Low Authority",
        impact: -10,
        description: `Domain Rating: ${domainRating}`,
      });
      baseScore -= 10;
    }

    const trustScore = Math.max(0, Math.min(100, baseScore));
    const riskScore = 100 - trustScore;
    const riskLevel = this.determineRiskLevel(riskScore);
    const isEligible = riskLevel !== "critical" && trustScore >= 30;

    return {
      domain,
      trustScore,
      riskScore,
      riskLevel,
      domainRating,
      spamScore,
      isEligible,
      factors,
    };
  }

  private static checkSpamKeywords(domain: string): { isSpam: boolean; keyword?: string } {
    const lowerDomain = domain.toLowerCase();
    for (const keyword of SPAM_KEYWORDS) {
      if (lowerDomain.includes(keyword)) {
        return { isSpam: true, keyword };
      }
    }
    return { isSpam: false };
  }

  private static checkRiskyTLD(domain: string): { isRisky: boolean; tld?: string } {
    for (const tld of RISKY_TLDS) {
      if (domain.endsWith(tld)) {
        return { isRisky: true, tld };
      }
    }
    return { isRisky: false };
  }

  private static async estimateDomainAge(domain: string): Promise<number> {
    return 12;
  }

  private static determineRiskLevel(riskScore: number): RiskLevel {
    if (riskScore >= 70) return "critical";
    if (riskScore >= 50) return "high";
    if (riskScore >= 30) return "medium";
    return "low";
  }

  static async checkEligibility(
    domain: string,
    module: "distribution" | "exchange"
  ): Promise<EligibilityResult> {
    const score = await this.scoreDomain(domain);
    const recommendations: string[] = [];

    if (!score.isEligible) {
      recommendations.push("Domain does not meet minimum trust requirements");
    }

    if (score.riskLevel === "high") {
      recommendations.push("Consider using this domain only for Tier 3 links");
    }

    if (module === "exchange" && score.domainRating < 20) {
      recommendations.push("Low DR domains earn fewer credits in the exchange");
    }

    if (score.spamScore > 20) {
      recommendations.push("High spam score detected - monitor link performance closely");
    }

    const minTrustScore = module === "exchange" ? 40 : 30;
    const eligible = score.trustScore >= minTrustScore && score.riskLevel !== "critical";

    return {
      isEligible: eligible,
      reason: eligible ? undefined : "Domain does not meet eligibility requirements",
      riskLevel: score.riskLevel,
      trustScore: score.trustScore,
      recommendations,
    };
  }

  static async scorePage(pageUrl: string): Promise<{
    pageScore: number;
    domainScore: DomainScore;
    placementQuality: "high" | "medium" | "low";
    factors: RiskFactor[];
  }> {
    const url = new URL(pageUrl);
    const domain = url.hostname;
    const domainScore = await this.scoreDomain(domain);
    const factors: RiskFactor[] = [...domainScore.factors];

    let pageScore = domainScore.trustScore;

    if (url.pathname === "/" || url.pathname === "") {
      factors.push({
        name: "Homepage Link",
        impact: -10,
        description: "Link on homepage may appear less natural",
      });
      pageScore -= 10;
    }

    const pathDepth = url.pathname.split("/").filter(Boolean).length;
    if (pathDepth >= 2) {
      factors.push({
        name: "Deep Page",
        impact: 5,
        description: "Link is on an inner page (more natural)",
      });
      pageScore += 5;
    }

    const hasQueryParams = url.search.length > 0;
    if (hasQueryParams) {
      factors.push({
        name: "Dynamic URL",
        impact: -5,
        description: "URL contains query parameters",
      });
      pageScore -= 5;
    }

    let placementQuality: "high" | "medium" | "low" = "medium";
    if (pageScore >= 60) placementQuality = "high";
    else if (pageScore < 40) placementQuality = "low";

    return {
      pageScore: Math.max(0, Math.min(100, pageScore)),
      domainScore,
      placementQuality,
      factors,
    };
  }

  static async calculateCreditValue(
    domain: string,
    domainRating: number,
    isIndexed: boolean,
    tier: number
  ): Promise<{
    baseCredits: number;
    multiplier: number;
    finalCredits: number;
    breakdown: { factor: string; value: number }[];
  }> {
    const score = await this.scoreDomain(domain);
    const breakdown: { factor: string; value: number }[] = [];

    let baseCredits = 10;
    breakdown.push({ factor: "Base Value", value: baseCredits });

    let drMultiplier = 1;
    if (domainRating >= 70) drMultiplier = 2.5;
    else if (domainRating >= 50) drMultiplier = 1.8;
    else if (domainRating >= 30) drMultiplier = 1.3;
    else if (domainRating < 20) drMultiplier = 0.7;
    breakdown.push({ factor: `DR ${domainRating}`, value: drMultiplier });

    let trustMultiplier = score.trustScore / 50;
    breakdown.push({ factor: `Trust Score ${score.trustScore}`, value: trustMultiplier });

    let indexMultiplier = isIndexed ? 1.5 : 0.5;
    breakdown.push({ factor: isIndexed ? "Indexed" : "Not Indexed", value: indexMultiplier });

    let tierMultiplier = tier === 3 ? 1.3 : tier === 1 ? 0.5 : 1;
    breakdown.push({ factor: `Tier ${tier}`, value: tierMultiplier });

    const multiplier = drMultiplier * trustMultiplier * indexMultiplier * tierMultiplier;
    const finalCredits = Math.round(baseCredits * multiplier * 100) / 100;

    return {
      baseCredits,
      multiplier: Math.round(multiplier * 100) / 100,
      finalCredits,
      breakdown,
    };
  }

  static async saveDomainScore(domain: string, score: DomainScore): Promise<void> {
    await supabaseAdmin.from("domain_scores").upsert({
      domain,
      trust_score: score.trustScore,
      risk_score: score.riskScore,
      risk_level: score.riskLevel,
      domain_rating: score.domainRating,
      spam_score: score.spamScore,
      is_eligible: score.isEligible,
      factors: score.factors,
      last_scored_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "domain" });
  }

  static async batchScoreDomains(domains: string[]): Promise<Map<string, DomainScore>> {
    const results = new Map<string, DomainScore>();
    
    for (const domain of domains) {
      const score = await this.scoreDomain(domain);
      results.set(domain, score);
      await this.saveDomainScore(domain, score);
    }

    return results;
  }
}
