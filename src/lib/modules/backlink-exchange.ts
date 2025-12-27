import { supabaseAdmin } from "@/lib/supabase/admin";
import { RiskScoring } from "../backlink-core/risk-scoring";
import { LinkGraphAnalyzer } from "../backlink-core/link-graph-analyzer";
import type { AnchorType } from "../backlink-core/types";

const BASE_CREDIT_VALUE = 10;
const MIN_LIVE_DAYS = 30;
const PENDING_TO_EARNED_DAYS = 7;
const DECAY_RATE_PER_MONTH = 0.05;

export interface CreditBalance {
  balance: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface InventoryPage {
  pageUrl: string;
  pageTitle?: string;
  domain: string;
  domainRating?: number;
  trustFlow?: number;
  trafficEstimate?: number;
  niche?: string;
  maxOutboundLinks?: number;
  linkType?: "dofollow" | "nofollow";
  contentPlacement?: "contextual" | "sidebar" | "footer" | "author_bio";
  tier?: number;
}

export interface MatchedRoute {
  inventoryId: string;
  sourceUserId: string;
  domain: string;
  pageUrl: string;
  domainRating: number;
  qualityScore: number;
  creditsRequired: number;
  hopDistance: number;
  tier: number;
}

export class BacklinkExchangeModule {
  static readonly MODULE_TYPE = "exchange" as const;

  static async getBalance(userId: string): Promise<CreditBalance> {
    const { data } = await supabaseAdmin
      .from("exchange_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      await this.initializeCredits(userId);
      return { balance: 0, pendingCredits: 0, lifetimeEarned: 0, lifetimeSpent: 0 };
    }

    return {
      balance: parseFloat(data.balance) || 0,
      pendingCredits: parseFloat(data.pending_credits) || 0,
      lifetimeEarned: parseFloat(data.lifetime_earned) || 0,
      lifetimeSpent: parseFloat(data.lifetime_spent) || 0,
    };
  }

  static async initializeCredits(userId: string): Promise<void> {
    await supabaseAdmin.from("exchange_credits").upsert(
      {
        user_id: userId,
        balance: 0,
        pending_credits: 0,
        lifetime_earned: 0,
        lifetime_spent: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
  }

  static async submitInventory(
    userId: string,
    siteId: string | null,
    pages: InventoryPage[]
  ): Promise<{ submitted: number; rejected: number; errors: string[] }> {
    let submitted = 0;
    let rejected = 0;
    const errors: string[] = [];

    for (const page of pages) {
      const riskAssessment = RiskScoring.assessDomain(
        page.domain,
        page.domainRating || 0,
        {
          trustFlow: page.trustFlow,
          traffic: page.trafficEstimate,
          placement: page.contentPlacement,
          linkType: page.linkType,
        }
      );

      if (!riskAssessment.isAcceptable) {
        rejected++;
        errors.push(`${page.pageUrl}: ${riskAssessment.recommendation}`);
        continue;
      }

      const qualityScore = RiskScoring.calculateQualityScore(page.domainRating || 0, {
        trustFlow: page.trustFlow,
        traffic: page.trafficEstimate,
        placement: page.contentPlacement,
      });

      const creditsPerLink = this.calculateCreditsPerLink(
        qualityScore,
        page.domainRating || 0,
        page.tier || 2
      );

      const { error } = await supabaseAdmin.from("link_inventory").upsert(
        {
          user_id: userId,
          site_id: siteId,
          page_url: page.pageUrl,
          page_title: page.pageTitle,
          domain: page.domain,
          domain_rating: page.domainRating || 0,
          trust_flow: page.trustFlow || 0,
          traffic_estimate: page.trafficEstimate || 0,
          niche: page.niche,
          max_outbound_links: page.maxOutboundLinks || 2,
          link_type: page.linkType || "dofollow",
          content_placement: page.contentPlacement || "contextual",
          tier: page.tier || 2,
          quality_score: qualityScore,
          risk_score: riskAssessment.score,
          credits_per_link: creditsPerLink,
          verification_status: "pending",
          is_active: true,
          source_module: this.MODULE_TYPE,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,page_url" }
      );

      if (error) {
        errors.push(`${page.pageUrl}: Database error`);
        rejected++;
      } else {
        submitted++;
      }
    }

    return { submitted, rejected, errors };
  }

  static calculateCreditsPerLink(
    qualityScore: number,
    domainRating: number,
    tier: number
  ): number {
    let base = 5;

    if (domainRating >= 70) base = 25;
    else if (domainRating >= 50) base = 15;
    else if (domainRating >= 30) base = 10;

    const qualityMultiplier = qualityScore / 50;
    const tierMultiplier = tier === 1 ? 0.5 : tier === 3 ? 1.5 : 1;

    return Math.round(base * qualityMultiplier * tierMultiplier * 100) / 100;
  }

  static async findMatchingRoutes(
    requesterId: string,
    options: {
      minDomainRating?: number;
      maxRiskScore?: number;
      niche?: string;
      tier?: number;
      limit?: number;
    }
  ): Promise<MatchedRoute[]> {
    let query = supabaseAdmin
      .from("link_inventory")
      .select("*")
      .eq("is_active", true)
      .eq("verification_status", "verified")
      .neq("user_id", requesterId)
      .eq("source_module", this.MODULE_TYPE);

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

    const { data: inventory } = await query
      .order("quality_score", { ascending: false })
      .limit(options.limit || 100);

    const validRoutes: MatchedRoute[] = [];

    for (const inv of inventory || []) {
      const routeValidation = await LinkGraphAnalyzer.validateExchangeRoute(
        inv.user_id,
        requesterId
      );

      if (!routeValidation.isValid) continue;

      validRoutes.push({
        inventoryId: inv.id,
        sourceUserId: inv.user_id,
        domain: inv.domain,
        pageUrl: inv.page_url,
        domainRating: inv.domain_rating,
        qualityScore: parseFloat(inv.quality_score),
        creditsRequired: parseFloat(inv.credits_per_link) || 10,
        hopDistance: routeValidation.hopDistance,
        tier: inv.tier,
      });
    }

    validRoutes.sort((a, b) => {
      const scoreA = a.domainRating * 0.4 + a.qualityScore * 0.3 + a.hopDistance * 5;
      const scoreB = b.domainRating * 0.4 + b.qualityScore * 0.3 + b.hopDistance * 5;
      return scoreB - scoreA;
    });

    return validRoutes.slice(0, options.limit || 10);
  }

  static async executeExchange(
    requesterId: string,
    matchedRoute: MatchedRoute,
    targetUrl: string,
    anchorText: string,
    anchorType: AnchorType
  ): Promise<{ success: boolean; linkId?: string; error?: string }> {
    const routeValidation = await LinkGraphAnalyzer.validateExchangeRoute(
      matchedRoute.sourceUserId,
      requesterId
    );

    if (!routeValidation.isValid) {
      return { success: false, error: routeValidation.blockedReason };
    }

    const balance = await this.getBalance(requesterId);
    if (balance.balance < matchedRoute.creditsRequired) {
      return {
        success: false,
        error: `Insufficient credits. Balance: ${balance.balance}, Required: ${matchedRoute.creditsRequired}`,
      };
    }

    const canPlace = await this.incrementOutboundLinks(matchedRoute.inventoryId);
    if (!canPlace) {
      return { success: false, error: "Inventory page has reached maximum outbound links" };
    }

    await this.spendCredits(requesterId, matchedRoute.creditsRequired, `Exchange link from ${matchedRoute.domain}`);

    const { data: linkRecord, error } = await supabaseAdmin
      .from("exchange_link_graph")
      .insert({
        source_user_id: matchedRoute.sourceUserId,
        target_user_id: requesterId,
        source_inventory_id: matchedRoute.inventoryId,
        target_site_domain: new URL(targetUrl).hostname,
        link_url: targetUrl,
        anchor_text: anchorText,
        anchor_type: anchorType,
        hop_distance: routeValidation.hopDistance,
        credits_awarded: matchedRoute.creditsRequired,
        credits_status: "pending",
        min_live_days: MIN_LIVE_DAYS,
        is_live: true,
        is_indexed: false,
        source_module: this.MODULE_TYPE,
      })
      .select()
      .single();

    if (error || !linkRecord) {
      await this.awardCredits(requesterId, matchedRoute.creditsRequired, "Refund: Link creation failed");
      return { success: false, error: "Failed to create link record" };
    }

    await this.awardPendingCredits(
      matchedRoute.sourceUserId,
      matchedRoute.creditsRequired,
      linkRecord.id,
      `Link placed to ${new URL(targetUrl).hostname}`
    );

    return { success: true, linkId: linkRecord.id };
  }

  static async spendCredits(userId: string, amount: number, reason: string): Promise<void> {
    const balance = await this.getBalance(userId);
    const newBalance = balance.balance - amount;

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        lifetime_spent: balance.lifetimeSpent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "spent", -amount, newBalance, reason);
  }

  static async awardCredits(userId: string, amount: number, reason: string): Promise<void> {
    const balance = await this.getBalance(userId);
    const newBalance = balance.balance + amount;

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        lifetime_earned: balance.lifetimeEarned + amount,
        last_credit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "earned", amount, newBalance, reason);
  }

  static async awardPendingCredits(
    userId: string,
    amount: number,
    linkId: string,
    reason: string
  ): Promise<void> {
    const balance = await this.getBalance(userId);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        pending_credits: balance.pendingCredits + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "pending", amount, balance.balance, reason, linkId);
  }

  private static async recordTransaction(
    userId: string,
    type: "earned" | "spent" | "pending" | "clawback" | "decay",
    amount: number,
    balanceAfter: number,
    reason: string,
    linkId?: string
  ): Promise<void> {
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      type,
      amount,
      balance_after: balanceAfter,
      reason,
      related_link_id: linkId,
      created_at: new Date().toISOString(),
    });
  }

  static async incrementOutboundLinks(inventoryId: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("link_inventory")
      .select("current_outbound_links, max_outbound_links")
      .eq("id", inventoryId)
      .single();

    if (!data) return false;

    const current = data.current_outbound_links || 0;
    if (current >= data.max_outbound_links) return false;

    await supabaseAdmin
      .from("link_inventory")
      .update({
        current_outbound_links: current + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", inventoryId);

    return true;
  }

  static async getUserInventory(userId: string): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from("link_inventory")
      .select("*")
      .eq("user_id", userId)
      .eq("source_module", this.MODULE_TYPE)
      .order("created_at", { ascending: false });

    return data || [];
  }

  static async getExchangeStats(userId: string): Promise<{
    linksGiven: number;
    linksReceived: number;
    pendingRequests: number;
    avgHopDistance: number;
    indexRate: number;
    creditsBalance: number;
  }> {
    const { data: given } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, is_indexed")
      .eq("source_user_id", userId)
      .eq("source_module", this.MODULE_TYPE);

    const { data: received } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, hop_distance, is_indexed")
      .eq("target_user_id", userId)
      .eq("source_module", this.MODULE_TYPE);

    const { data: pending } = await supabaseAdmin
      .from("exchange_requests")
      .select("id")
      .eq("requester_user_id", userId)
      .eq("status", "pending");

    const balance = await this.getBalance(userId);

    const hopDistances = received?.map((l) => l.hop_distance || 0) || [];
    const avgHop =
      hopDistances.length > 0
        ? hopDistances.reduce((a, b) => a + b, 0) / hopDistances.length
        : 0;

    const allLinks = [...(given || []), ...(received || [])];
    const indexedCount = allLinks.filter((l) => l.is_indexed).length;
    const indexRate = allLinks.length > 0 ? (indexedCount / allLinks.length) * 100 : 0;

    return {
      linksGiven: given?.length || 0,
      linksReceived: received?.length || 0,
      pendingRequests: pending?.length || 0,
      avgHopDistance: Math.round(avgHop * 10) / 10,
      indexRate: Math.round(indexRate),
      creditsBalance: balance.balance,
    };
  }

  static async getTransactionHistory(userId: string, limit: number = 50): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from("credit_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    return data || [];
  }

  static async processLinkVerification(linkId: string): Promise<void> {
    const { data: link } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("*, source_inventory:link_inventory(*)")
      .eq("id", linkId)
      .eq("source_module", this.MODULE_TYPE)
      .single();

    if (!link || link.credits_status !== "pending") return;

    const placementDate = new Date(link.created_at);
    const now = new Date();
    const liveDays = Math.floor((now.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24));

    if (liveDays < PENDING_TO_EARNED_DAYS) return;

    if (!link.is_live) {
      await this.clawbackCredits(link.source_user_id, link.credits_awarded, linkId, "Link no longer live");
      return;
    }

    const balance = await this.getBalance(link.source_user_id);
    const newBalance = balance.balance + link.credits_awarded;
    const newPending = Math.max(0, balance.pendingCredits - link.credits_awarded);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        pending_credits: newPending,
        lifetime_earned: balance.lifetimeEarned + link.credits_awarded,
        last_credit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", link.source_user_id);

    await this.recordTransaction(
      link.source_user_id,
      "earned",
      link.credits_awarded,
      newBalance,
      "Link verified and live",
      linkId
    );

    await supabaseAdmin
      .from("exchange_link_graph")
      .update({ credits_status: "awarded" })
      .eq("id", linkId);
  }

  static async clawbackCredits(
    userId: string,
    amount: number,
    linkId: string,
    reason: string
  ): Promise<void> {
    const balance = await this.getBalance(userId);
    const newBalance = Math.max(0, balance.balance - amount);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "clawback", -amount, newBalance, reason, linkId);

    await supabaseAdmin
      .from("exchange_link_graph")
      .update({ credits_status: "clawedback" })
      .eq("id", linkId);
  }

  static async getUserSettings(userId: string): Promise<any> {
    const { data } = await supabaseAdmin
      .from("exchange_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      const defaultSettings = {
        user_id: userId,
        auto_accept_requests: false,
        min_incoming_dr: 20,
        max_outgoing_per_day: 3,
        preferred_niches: [],
        blocked_domains: [],
        tier1_enabled: false,
        tier2_enabled: true,
        tier3_enabled: true,
      };

      await supabaseAdmin.from("exchange_settings").insert(defaultSettings);
      return defaultSettings;
    }

    return data;
  }

  static async updateUserSettings(userId: string, settings: Partial<any>): Promise<void> {
    await supabaseAdmin
      .from("exchange_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }
}
