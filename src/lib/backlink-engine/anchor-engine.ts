import { supabaseAdmin } from "@/lib/supabase/admin";

export type AnchorType = "branded" | "naked" | "generic" | "partial_match" | "exact_match";

interface AnchorDistribution {
  branded: number;
  naked: number;
  generic: number;
  partial_match: number;
  exact_match: number;
}

const TIER1_ANCHOR_DISTRIBUTION: AnchorDistribution = {
  branded: 0.60,
  naked: 0.25,
  generic: 0.10,
  partial_match: 0.04,
  exact_match: 0.01,
};

const TIER2_ANCHOR_DISTRIBUTION: AnchorDistribution = {
  branded: 0.40,
  naked: 0.20,
  generic: 0.20,
  partial_match: 0.15,
  exact_match: 0.05,
};

const TIER3_ANCHOR_DISTRIBUTION: AnchorDistribution = {
  branded: 0.0,
  naked: 0.30,
  generic: 0.70,
  partial_match: 0.0,
  exact_match: 0.0,
};

export class AnchorEngine {
  static async getNextAnchorType(userId: string, tier: number): Promise<AnchorType> {
    const { data: campaign } = await supabaseAdmin
      .from("backlink_campaigns")
      .select("risk_level")
      .eq("user_id", userId)
      .single();

    const { data: existingLinks } = await supabaseAdmin
      .from("backlinks")
      .select("anchor_type")
      .eq("user_id", userId)
      .eq("tier", tier);

    const total = existingLinks?.length || 0;
    if (total === 0) return "branded";

    const counts = {
      branded: existingLinks?.filter(l => l.anchor_type === "branded").length || 0,
      naked: existingLinks?.filter(l => l.anchor_type === "naked").length || 0,
      generic: existingLinks?.filter(l => l.anchor_type === "generic").length || 0,
      partial_match: existingLinks?.filter(l => l.anchor_type === "partial_match").length || 0,
      exact_match: existingLinks?.filter(l => l.anchor_type === "exact_match").length || 0,
    };

    // Clone distribution to avoid mutating global constants
    const dist = { ...(tier === 1 ? TIER1_ANCHOR_DISTRIBUTION : 
                   tier === 2 ? TIER2_ANCHOR_DISTRIBUTION : 
                   TIER3_ANCHOR_DISTRIBUTION) };

    // Adjust distribution based on risk level
    if (campaign?.risk_level === "Conservative" && tier === 1) {
      dist.branded = 0.80; // Safer
      dist.naked = 0.15;
      dist.generic = 0.05;
      dist.partial_match = 0.0;
      dist.exact_match = 0.0;
    } else if (campaign?.risk_level === "Boost" && tier === 1) {
      dist.branded = 0.40; // More aggressive
      dist.naked = 0.20;
      dist.generic = 0.10;
      dist.partial_match = 0.20;
      dist.exact_match = 0.10;
    }

    // Find the type that is most behind its target percentage
    let bestType: AnchorType = "branded";
    let maxGap = -Infinity;

    for (const [type, target] of Object.entries(dist)) {
      const current = counts[type as keyof typeof counts] / total;
      const gap = target - current;
      if (gap > maxGap) {
        maxGap = gap;
        bestType = type as AnchorType;
      }
    }

    return bestType;
  }

  static generateAnchorText(
    type: AnchorType,
    brandedTerms: string[],
    keywords: string[],
    targetUrl: string
  ): string {
    const brand = brandedTerms.length > 0 ? brandedTerms[Math.floor(Math.random() * brandedTerms.length)] : "Our Site";
    const keyword = keywords.length > 0 ? keywords[Math.floor(Math.random() * keywords.length)] : "details";
    const naked = targetUrl.replace(/https?:\/\//, "").replace(/\/$/, "");

    switch (type) {
      case "branded":
        return brand;
      case "naked":
        return naked;
      case "generic":
        const generics = ["click here", "learn more", "source", "read more", "this post", "visit website", "check this out"];
        return generics[Math.floor(Math.random() * generics.length)];
      case "partial_match":
        const partials = [`${keyword} tips`, `best ${keyword}`, `how to ${keyword}`, `top ${keyword} guide`];
        return partials[Math.floor(Math.random() * partials.length)];
      case "exact_match":
        return keyword;
      default:
        return brand;
    }
  }
}
