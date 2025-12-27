import { supabaseAdmin } from "@/lib/supabase/admin";
import {
  ContentEngine,
  AnchorManager,
  RiskScorer,
  IndexationMonitor,
  LinkGraphAnalyzer,
  type AnchorType,
} from "@/lib/backlink-core";

export interface ExchangeCredits {
  balance: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface InventoryItem {
  id: string;
  userId: string;
  domain: string;
  pageUrl: string;
  domainRating: number;
  qualityScore: number;
  tier: number;
  creditsPerLink: number;
  maxOutboundLinks: number;
  currentOutboundLinks: number;
  niche?: string;
  isEligible: boolean;
}

export interface ExchangeMatch {
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

export interface ExchangeSettings {
  autoAcceptRequests: boolean;
  minIncomingDR: number;
  maxOutgoingPerDay: number;
  preferredNiches: string[];
  blockedDomains: string[];
  minHopDistance: number;
  tier1Enabled: boolean;
  tier2Enabled: boolean;
  tier3Enabled: boolean;
}

const BASE_CREDIT_VALUE = 10;
const MIN_LIVE_DAYS_FOR_FULL_CREDIT = 30;
const PENDING_TO_EARNED_DAYS = 7;
const DECAY_RATE_PER_MONTH = 0.05;
const MIN_HOP_DISTANCE = 3;
const MAX_CONNECTIONS_PER_PAIR = 2;

export class ExchangeEngine {
  private static MODULE_ID = "exchange" as const;

  static async getCredits(userId: string): Promise<ExchangeCredits> {
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

  private static async initializeCredits(userId: string): Promise<void> {
    await supabaseAdmin.from("exchange_credits").upsert({
      user_id: userId,
      balance: 0,
      pending_credits: 0,
      lifetime_earned: 0,
      lifetime_spent: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
  }

  static async submitInventory(params: {
    userId: string;
    domain: string;
    pageUrl: string;
    domainRating: number;
    niche?: string;
    maxOutboundLinks?: number;
  }): Promise<{ success: boolean; inventoryId?: string; error?: string }> {
    const eligibility = await RiskScorer.checkEligibility(params.domain, this.MODULE_ID);
    if (!eligibility.isEligible) {
      return { success: false, error: eligibility.reason };
    }

    const pageScore = await RiskScorer.scorePage(params.pageUrl);
    
    const creditValue = await RiskScorer.calculateCreditValue(
      params.domain,
      params.domainRating,
      false,
      2
    );

    const tier = params.domainRating >= 50 ? 2 : 3;

    const { data, error } = await supabaseAdmin
      .from("link_inventory")
      .insert({
        user_id: params.userId,
        domain: params.domain,
        page_url: params.pageUrl,
        domain_rating: params.domainRating,
        quality_score: pageScore.pageScore,
        risk_score: pageScore.domainScore.riskScore,
        tier,
        niche: params.niche,
        max_outbound_links: params.maxOutboundLinks || 3,
        current_outbound_links: 0,
        credits_per_link: creditValue.finalCredits,
        is_eligible: true,
        status: "active",
        module: this.MODULE_ID,
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, inventoryId: data?.id };
  }

  static async findMatches(
    requesterId: string,
    targetDomain: string,
    options: {
      minDomainRating?: number;
      niche?: string;
      tier?: number;
      limit?: number;
    } = {}
  ): Promise<ExchangeMatch[]> {
    const { data: inventory } = await supabaseAdmin
      .from("link_inventory")
      .select("*")
      .neq("user_id", requesterId)
      .eq("status", "active")
      .eq("is_eligible", true)
      .gte("domain_rating", options.minDomainRating || 20)
      .order("domain_rating", { ascending: false })
      .limit(options.limit || 100);

    if (!inventory?.length) return [];

    const matches: ExchangeMatch[] = [];

    for (const item of inventory) {
      if (item.current_outbound_links >= item.max_outbound_links) continue;

      const routeSafe = await LinkGraphAnalyzer.isRouteSafe(
        item.user_id,
        requesterId,
        this.MODULE_ID
      );

      if (!routeSafe.safe) continue;

      const hopDistance = await LinkGraphAnalyzer.calculateShortestPath(
        item.user_id,
        requesterId
      );

      if (hopDistance > 0 && hopDistance < MIN_HOP_DISTANCE) continue;

      const isolation = await LinkGraphAnalyzer.enforceModuleIsolation(
        item.page_url,
        this.MODULE_ID
      );
      if (!isolation.allowed) continue;

      matches.push({
        inventoryId: item.id,
        sourceUserId: item.user_id,
        domain: item.domain,
        pageUrl: item.page_url,
        domainRating: item.domain_rating,
        qualityScore: parseFloat(item.quality_score),
        creditsRequired: parseFloat(item.credits_per_link),
        hopDistance: hopDistance || MIN_HOP_DISTANCE,
        tier: item.tier,
      });
    }

    matches.sort((a, b) => {
      const scoreA = a.domainRating * 0.4 + a.qualityScore * 0.3 + a.hopDistance * 5;
      const scoreB = b.domainRating * 0.4 + b.qualityScore * 0.3 + b.hopDistance * 5;
      return scoreB - scoreA;
    });

    return matches.slice(0, options.limit || 10);
  }

  static async executeExchange(
    requesterId: string,
    match: ExchangeMatch,
    targetUrl: string,
    keyword: string,
    siteName: string
  ): Promise<{ success: boolean; linkId?: string; error?: string }> {
    const routeSafe = await LinkGraphAnalyzer.isRouteSafe(
      match.sourceUserId,
      requesterId,
      this.MODULE_ID
    );

    if (!routeSafe.safe) {
      return { success: false, error: routeSafe.reason };
    }

    const credits = await this.getCredits(requesterId);
    if (credits.balance < match.creditsRequired) {
      return { 
        success: false, 
        error: `Insufficient credits. Balance: ${credits.balance}, Required: ${match.creditsRequired}` 
      };
    }

    const anchor = await AnchorManager.selectAnchor({
      userId: requesterId,
      targetUrl,
      keyword,
      siteName,
      tier: match.tier,
      module: this.MODULE_ID,
    });

    const contentPlacement = await ContentEngine.createContextualPlacement(
      "",
      targetUrl,
      anchor.text,
      keyword
    );

    const targetDomain = new URL(targetUrl).hostname;

    const { data: linkRecord, error } = await supabaseAdmin
      .from("exchange_link_graph")
      .insert({
        source_user_id: match.sourceUserId,
        target_user_id: requesterId,
        source_inventory_id: match.inventoryId,
        target_site_domain: targetDomain,
        link_url: targetUrl,
        anchor_text: anchor.text,
        anchor_type: anchor.type,
        content_placement: contentPlacement.content,
        hop_distance: match.hopDistance,
        credits_awarded: match.creditsRequired,
        credits_status: "pending",
        min_live_days: MIN_LIVE_DAYS_FOR_FULL_CREDIT,
        is_live: true,
        is_indexed: false,
        module: this.MODULE_ID,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error || !linkRecord) {
      return { success: false, error: "Failed to create link record" };
    }

    await this.spendCredits(requesterId, match.creditsRequired, `Exchange link from ${match.domain}`);
    await this.awardPendingCredits(
      match.sourceUserId,
      match.creditsRequired,
      linkRecord.id,
      match.inventoryId
    );

    await supabaseAdmin
      .from("link_inventory")
      .update({ 
        current_outbound_links: match.creditsRequired + 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", match.inventoryId);

    const connectionCount = await LinkGraphAnalyzer.getConnectionCount(
      match.sourceUserId,
      requesterId
    );
    if (connectionCount >= MAX_CONNECTIONS_PER_PAIR) {
      await this.addToBlacklist(match.sourceUserId, requesterId, "Maximum connections reached");
    }

    return { success: true, linkId: linkRecord.id };
  }

  private static async spendCredits(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
    const credits = await this.getCredits(userId);
    const newBalance = credits.balance - amount;

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        lifetime_spent: credits.lifetimeSpent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "spent", -amount, newBalance, reason);
  }

  private static async awardPendingCredits(
    userId: string,
    amount: number,
    linkId: string,
    inventoryId: string
  ): Promise<void> {
    const credits = await this.getCredits(userId);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        pending_credits: credits.pendingCredits + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(
      userId,
      "pending",
      amount,
      credits.balance,
      `Link placed (pending verification)`,
      linkId,
      inventoryId
    );
  }

  static async convertPendingToEarned(userId: string, linkId: string, amount: number): Promise<void> {
    const credits = await this.getCredits(userId);
    const newBalance = credits.balance + amount;
    const newPending = Math.max(0, credits.pendingCredits - amount);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        pending_credits: newPending,
        lifetime_earned: credits.lifetimeEarned + amount,
        last_credit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "earned", amount, newBalance, "Link verified and live", linkId);

    await supabaseAdmin
      .from("exchange_link_graph")
      .update({ credits_status: "awarded" })
      .eq("id", linkId);
  }

  static async clawbackCredits(userId: string, linkId: string, amount: number, reason: string): Promise<void> {
    const credits = await this.getCredits(userId);
    const newBalance = Math.max(0, credits.balance - amount);

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

  private static async recordTransaction(
    userId: string,
    type: "earned" | "spent" | "decay" | "bonus" | "clawback" | "pending",
    amount: number,
    balanceAfter: number,
    reason: string,
    linkId?: string,
    inventoryId?: string
  ): Promise<void> {
    await supabaseAdmin.from("credit_transactions").insert({
      user_id: userId,
      type,
      amount,
      balance_after: balanceAfter,
      reason,
      related_link_id: linkId,
      related_inventory_id: inventoryId,
      module: this.MODULE_ID,
      created_at: new Date().toISOString(),
    });
  }

  private static async addToBlacklist(userA: string, userB: string, reason: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    await supabaseAdmin.from("exchange_blacklist").upsert({
      user_a_id: userA,
      user_b_id: userB,
      reason,
      auto_generated: true,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
    }, { onConflict: "user_a_id,user_b_id" });
  }

  static async getSettings(userId: string): Promise<ExchangeSettings> {
    const { data } = await supabaseAdmin
      .from("exchange_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      const defaults: ExchangeSettings = {
        autoAcceptRequests: false,
        minIncomingDR: 20,
        maxOutgoingPerDay: 3,
        preferredNiches: [],
        blockedDomains: [],
        minHopDistance: MIN_HOP_DISTANCE,
        tier1Enabled: false,
        tier2Enabled: true,
        tier3Enabled: true,
      };

      await supabaseAdmin.from("exchange_settings").insert({
        user_id: userId,
        ...this.settingsToDb(defaults),
      });

      return defaults;
    }

    return {
      autoAcceptRequests: data.auto_accept_requests || false,
      minIncomingDR: data.min_incoming_dr || 20,
      maxOutgoingPerDay: data.max_outgoing_per_day || 3,
      preferredNiches: data.preferred_niches || [],
      blockedDomains: data.blocked_domains || [],
      minHopDistance: data.min_hop_distance || MIN_HOP_DISTANCE,
      tier1Enabled: data.tier1_enabled || false,
      tier2Enabled: data.tier2_enabled !== false,
      tier3Enabled: data.tier3_enabled !== false,
    };
  }

  private static settingsToDb(settings: ExchangeSettings): any {
    return {
      auto_accept_requests: settings.autoAcceptRequests,
      min_incoming_dr: settings.minIncomingDR,
      max_outgoing_per_day: settings.maxOutgoingPerDay,
      preferred_niches: settings.preferredNiches,
      blocked_domains: settings.blockedDomains,
      min_hop_distance: settings.minHopDistance,
      tier1_enabled: settings.tier1Enabled,
      tier2_enabled: settings.tier2Enabled,
      tier3_enabled: settings.tier3Enabled,
    };
  }

  static async updateSettings(userId: string, settings: Partial<ExchangeSettings>): Promise<void> {
    await supabaseAdmin
      .from("exchange_settings")
      .update({
        ...this.settingsToDb(settings as ExchangeSettings),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  static async getStats(userId: string): Promise<{
    linksGiven: number;
    linksReceived: number;
    pendingRequests: number;
    avgHopDistance: number;
    indexRate: number;
    inventoryCount: number;
  }> {
    const { data: given } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, is_indexed")
      .eq("source_user_id", userId);

    const { data: received } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id, hop_distance, is_indexed")
      .eq("target_user_id", userId);

    const { data: pending } = await supabaseAdmin
      .from("exchange_requests")
      .select("id")
      .eq("requester_user_id", userId)
      .eq("status", "pending");

    const { data: inventory } = await supabaseAdmin
      .from("link_inventory")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "active");

    const hopDistances = received?.map(l => l.hop_distance || 0) || [];
    const avgHop = hopDistances.length > 0
      ? hopDistances.reduce((a, b) => a + b, 0) / hopDistances.length
      : 0;

    const allLinks = [...(given || []), ...(received || [])];
    const indexedCount = allLinks.filter(l => l.is_indexed).length;
    const indexRate = allLinks.length > 0 ? (indexedCount / allLinks.length) * 100 : 0;

    return {
      linksGiven: given?.length || 0,
      linksReceived: received?.length || 0,
      pendingRequests: pending?.length || 0,
      avgHopDistance: Math.round(avgHop * 10) / 10,
      indexRate: Math.round(indexRate),
      inventoryCount: inventory?.length || 0,
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

  static async runHealthCheck(batchSize: number = 20): Promise<{
    checked: number;
    liveCount: number;
    indexedCount: number;
    failures: string[];
  }> {
    return IndexationMonitor.runHealthCheckBatch(this.MODULE_ID, batchSize);
  }

  static async processLinkVerifications(): Promise<{ processed: number; converted: number; clawedBack: number }> {
    const cutoffDate = new Date(Date.now() - PENDING_TO_EARNED_DAYS * 24 * 60 * 60 * 1000);

    const { data: pendingLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("*")
      .eq("credits_status", "pending")
      .lte("created_at", cutoffDate.toISOString());

    if (!pendingLinks?.length) return { processed: 0, converted: 0, clawedBack: 0 };

    let converted = 0;
    let clawedBack = 0;

    for (const link of pendingLinks) {
      const healthCheck = await IndexationMonitor.performFullHealthCheck(
        link.id,
        link.link_url,
        this.MODULE_ID
      );

      if (healthCheck.isLive) {
        await this.convertPendingToEarned(link.source_user_id, link.id, link.credits_awarded);
        converted++;
      } else {
        await this.clawbackCredits(
          link.source_user_id,
          link.id,
          link.credits_awarded,
          "Link no longer live"
        );
        clawedBack++;
      }
    }

    return { processed: pendingLinks.length, converted, clawedBack };
  }

  static async applyDecay(userId: string): Promise<number> {
    const credits = await this.getCredits(userId);
    if (credits.balance <= 0) return 0;

    const { data: lastTransaction } = await supabaseAdmin
      .from("credit_transactions")
      .select("created_at")
      .eq("user_id", userId)
      .eq("type", "earned")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!lastTransaction) return 0;

    const lastEarnedDate = new Date(lastTransaction.created_at);
    const now = new Date();
    const monthsSinceLastEarn = (now.getTime() - lastEarnedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsSinceLastEarn < 1) return 0;

    const decayAmount = credits.balance * DECAY_RATE_PER_MONTH * Math.floor(monthsSinceLastEarn);
    const actualDecay = Math.min(decayAmount, credits.balance * 0.2);

    if (actualDecay <= 0) return 0;

    const newBalance = credits.balance - actualDecay;

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(
      userId,
      "decay",
      -actualDecay,
      newBalance,
      `Inactivity decay: ${Math.floor(monthsSinceLastEarn)} months`
    );

    return actualDecay;
  }
}
