import { supabaseAdmin } from "@/lib/supabase/admin";

export interface InventoryPage {
  page_url: string;
  page_title?: string;
  domain: string;
  domain_rating?: number;
  trust_flow?: number;
  traffic_estimate?: number;
  niche?: string;
  topics?: string[];
  max_outbound_links?: number;
  link_type?: "dofollow" | "nofollow" | "ugc" | "sponsored";
  content_placement?: "contextual" | "sidebar" | "footer" | "author_bio";
  tier?: number;
}

export interface InventoryValidation {
  isValid: boolean;
  qualityScore: number;
  riskScore: number;
  creditsPerLink: number;
  rejectionReason?: string;
}

const SPAM_PATTERNS = [
  /casino|gambling|poker/i,
  /payday|loan|debt/i,
  /xxx|porn|adult/i,
  /pharma|viagra|cialis/i,
  /crypto.*scam|nft.*free/i,
];

const RISKY_TLD = [".ru", ".cn", ".tk", ".ml", ".ga", ".cf", ".gq"];

export class LinkInventoryPool {
  static async submitInventory(
    userId: string,
    siteId: string | null,
    pages: InventoryPage[]
  ): Promise<{ submitted: number; rejected: number; errors: string[] }> {
    let submitted = 0;
    let rejected = 0;
    const errors: string[] = [];

    for (const page of pages) {
      const validation = await this.validatePage(page);

      if (!validation.isValid) {
        rejected++;
        errors.push(`${page.page_url}: ${validation.rejectionReason}`);
        continue;
      }

      const { error } = await supabaseAdmin.from("link_inventory").upsert(
        {
          user_id: userId,
          site_id: siteId,
          page_url: page.page_url,
          page_title: page.page_title,
          domain: page.domain,
          domain_rating: page.domain_rating || 0,
          trust_flow: page.trust_flow || 0,
          traffic_estimate: page.traffic_estimate || 0,
          niche: page.niche,
          topics: page.topics || [],
          max_outbound_links: page.max_outbound_links || 2,
          link_type: page.link_type || "dofollow",
          content_placement: page.content_placement || "contextual",
          tier: page.tier || 2,
          quality_score: validation.qualityScore,
          risk_score: validation.riskScore,
          credits_per_link: validation.creditsPerLink,
          verification_status: "pending",
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,page_url" }
      );

      if (error) {
        errors.push(`${page.page_url}: Database error`);
        rejected++;
      } else {
        submitted++;
      }
    }

    return { submitted, rejected, errors };
  }

  static async validatePage(page: InventoryPage): Promise<InventoryValidation> {
    let qualityScore = 50;
    let riskScore = 0;

    if (!page.page_url || !page.domain) {
      return {
        isValid: false,
        qualityScore: 0,
        riskScore: 100,
        creditsPerLink: 0,
        rejectionReason: "Missing URL or domain",
      };
    }

    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(page.page_url) || pattern.test(page.domain)) {
        return {
          isValid: false,
          qualityScore: 0,
          riskScore: 100,
          creditsPerLink: 0,
          rejectionReason: "Spam or prohibited content detected",
        };
      }
    }

    for (const tld of RISKY_TLD) {
      if (page.domain.endsWith(tld)) {
        riskScore += 30;
        qualityScore -= 20;
      }
    }

    const dr = page.domain_rating || 0;
    if (dr >= 70) {
      qualityScore += 40;
    } else if (dr >= 50) {
      qualityScore += 25;
    } else if (dr >= 30) {
      qualityScore += 10;
    } else if (dr < 15) {
      riskScore += 15;
      qualityScore -= 10;
    }

    const tf = page.trust_flow || 0;
    if (tf >= 40) {
      qualityScore += 15;
    } else if (tf >= 20) {
      qualityScore += 5;
    } else if (tf < 10) {
      riskScore += 10;
    }

    const traffic = page.traffic_estimate || 0;
    if (traffic >= 10000) {
      qualityScore += 10;
    } else if (traffic >= 1000) {
      qualityScore += 5;
    } else if (traffic < 100) {
      riskScore += 5;
    }

    if (page.content_placement === "contextual") {
      qualityScore += 10;
    } else if (page.content_placement === "footer" || page.content_placement === "sidebar") {
      qualityScore -= 15;
      riskScore += 10;
    }

    if (page.link_type === "dofollow") {
      qualityScore += 5;
    } else if (page.link_type === "nofollow") {
      qualityScore -= 5;
    }

    qualityScore = Math.max(0, Math.min(100, qualityScore));
    riskScore = Math.max(0, Math.min(100, riskScore));

    if (riskScore >= 50) {
      return {
        isValid: false,
        qualityScore,
        riskScore,
        creditsPerLink: 0,
        rejectionReason: "Risk score too high",
      };
    }

    if (qualityScore < 20) {
      return {
        isValid: false,
        qualityScore,
        riskScore,
        creditsPerLink: 0,
        rejectionReason: "Quality score too low",
      };
    }

    const creditsPerLink = this.calculateCreditsPerLink(qualityScore, dr, page.tier || 2);

    return {
      isValid: true,
      qualityScore,
      riskScore,
      creditsPerLink,
    };
  }

  static calculateCreditsPerLink(qualityScore: number, domainRating: number, tier: number): number {
    let base = 5;

    if (domainRating >= 70) {
      base = 25;
    } else if (domainRating >= 50) {
      base = 15;
    } else if (domainRating >= 30) {
      base = 10;
    }

    const qualityMultiplier = qualityScore / 50;

    const tierMultiplier = tier === 1 ? 0.5 : tier === 3 ? 1.5 : 1;

    return Math.round(base * qualityMultiplier * tierMultiplier * 100) / 100;
  }

  static async verifyIndexation(inventoryId: string): Promise<boolean> {
    const { data: inventory } = await supabaseAdmin
      .from("link_inventory")
      .select("page_url")
      .eq("id", inventoryId)
      .single();

    if (!inventory) return false;

    let isIndexed = false;
    try {
      // Real reachability check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout
      const res = await fetch(inventory.page_url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: { 'User-Agent': 'RankliteBot/1.0' }
      });
      clearTimeout(timeoutId);
      if (res.ok) isIndexed = true;
    } catch (err) {
      console.log(`[Inventory] Verification failed for ${inventory.page_url}`, err);
    }

    // Auto-verify for now if reachable, assuming "indexed" means "live and reachable"
    // True "google index" check would require GSC API which is expensive/rate-limited.

    await supabaseAdmin
      .from("link_inventory")
      .update({
        is_indexed: isIndexed,
        last_verified_at: new Date().toISOString(),
        verification_status: isIndexed ? "verified" : "rejected", // If unreachable, reject (or keep pending? reject is safer)
        // If rejected, maybe reason="Unreachable"
        rejection_reason: isIndexed ? null : "URL unreachable",
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId);

    return isIndexed;
  }

  static async getAvailableInventory(options: {
    excludeUserId?: string;
    minDomainRating?: number;
    maxRiskScore?: number;
    niche?: string;
    tier?: number;
    limit?: number;
  }): Promise<any[]> {
    let query = supabaseAdmin
      .from("link_inventory")
      .select("*")
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .lt("current_outbound_links", supabaseAdmin.rpc ? 2 : 2);

    if (options.excludeUserId) {
      query = query.neq("user_id", options.excludeUserId);
    }

    if (options.minDomainRating) {
      query = query.gte("domain_rating", options.minDomainRating);
    }

    if (options.maxRiskScore) {
      query = query.lte("risk_score", options.maxRiskScore);
    }

    if (options.niche) {
      query = query.eq("niche", options.niche);
    }

    if (options.tier) {
      query = query.eq("tier", options.tier);
    }

    query = query.order("quality_score", { ascending: false }).limit(options.limit || 50);

    const { data } = await query;
    return data || [];
  }

  static async getUserInventory(userId: string): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from("link_inventory")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    return data || [];
  }

  static async updateInventoryStatus(
    inventoryId: string,
    status: "pending" | "verified" | "rejected" | "expired",
    reason?: string
  ): Promise<void> {
    await supabaseAdmin
      .from("link_inventory")
      .update({
        verification_status: status,
        rejection_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId);
  }

  static async incrementOutboundLinks(inventoryId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("link_inventory")
      .select("current_outbound_links, max_outbound_links")
      .eq("id", inventoryId)
      .single();

    if (!data) return false;

    if (data.current_outbound_links >= data.max_outbound_links) {
      return false;
    }

    await supabaseAdmin
      .from("link_inventory")
      .update({
        current_outbound_links: data.current_outbound_links + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId);

    return true;
  }
}
