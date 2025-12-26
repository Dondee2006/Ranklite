import { supabaseAdmin } from "@/lib/supabase/admin";
import { CreditSystem } from "./credit-system";
import { LinkInventoryPool } from "./inventory-pool";

export interface RouteValidation {
  isValid: boolean;
  hopDistance: number;
  reason?: string;
  blockedReason?: string;
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
  routePath: string[];
  tier: number;
}

const MIN_HOP_DISTANCE = 3;
const MAX_CONNECTIONS_PER_PAIR = 2;
const BLACKLIST_DURATION_DAYS = 90;

export class SmartLinkRouter {
  static async findMatchingRoutes(
    requesterId: string,
    targetDomain: string,
    options: {
      minDomainRating?: number;
      maxRiskScore?: number;
      niche?: string;
      tier?: number;
      limit?: number;
    }
  ): Promise<MatchedRoute[]> {
    const availableInventory = await LinkInventoryPool.getAvailableInventory({
      excludeUserId: requesterId,
      minDomainRating: options.minDomainRating || 20,
      maxRiskScore: options.maxRiskScore || 40,
      niche: options.niche,
      tier: options.tier || 2,
      limit: options.limit || 100,
    });

    const validRoutes: MatchedRoute[] = [];

    for (const inventory of availableInventory) {
      const routeValidation = await this.validateRoute(
        inventory.user_id,
        requesterId,
        targetDomain
      );

      if (!routeValidation.isValid) continue;

      const creditsRequired = parseFloat(inventory.credits_per_link) || 10;

      validRoutes.push({
        inventoryId: inventory.id,
        sourceUserId: inventory.user_id,
        domain: inventory.domain,
        pageUrl: inventory.page_url,
        domainRating: inventory.domain_rating,
        qualityScore: parseFloat(inventory.quality_score),
        creditsRequired,
        hopDistance: routeValidation.hopDistance,
        routePath: [],
        tier: inventory.tier,
      });
    }

    validRoutes.sort((a, b) => {
      const scoreA = a.domainRating * 0.4 + a.qualityScore * 0.3 + a.hopDistance * 5;
      const scoreB = b.domainRating * 0.4 + b.qualityScore * 0.3 + b.hopDistance * 5;
      return scoreB - scoreA;
    });

    return validRoutes.slice(0, options.limit || 10);
  }

  static async validateRoute(
    sourceUserId: string,
    targetUserId: string,
    targetDomain: string
  ): Promise<RouteValidation> {
    const isBlacklisted = await this.isBlacklisted(sourceUserId, targetUserId);
    if (isBlacklisted) {
      return {
        isValid: false,
        hopDistance: 0,
        blockedReason: "Users are blacklisted from exchanging",
      };
    }

    const hasDirectLink = await this.hasDirectConnection(sourceUserId, targetUserId);
    if (hasDirectLink) {
      return {
        isValid: false,
        hopDistance: 1,
        blockedReason: "Direct reciprocal link would be created",
      };
    }

    const hopDistance = await this.calculateHopDistance(sourceUserId, targetUserId);

    if (hopDistance < MIN_HOP_DISTANCE && hopDistance > 0) {
      return {
        isValid: false,
        hopDistance,
        blockedReason: `Hop distance ${hopDistance} is less than minimum ${MIN_HOP_DISTANCE}`,
      };
    }

    const connectionCount = await this.getConnectionCount(sourceUserId, targetUserId);
    if (connectionCount >= MAX_CONNECTIONS_PER_PAIR) {
      return {
        isValid: false,
        hopDistance,
        blockedReason: "Maximum connections between these users reached",
      };
    }

    const hasShortLoop = await this.detectShortLoop(sourceUserId, targetUserId, targetDomain);
    if (hasShortLoop) {
      return {
        isValid: false,
        hopDistance,
        blockedReason: "Short link loop detected (A → B → A pattern)",
      };
    }

    return {
      isValid: true,
      hopDistance: hopDistance || MIN_HOP_DISTANCE,
    };
  }

  static async calculateHopDistance(
    sourceUserId: string,
    targetUserId: string
  ): Promise<number> {
    const visited = new Set<string>();
    const queue: { userId: string; distance: number }[] = [
      { userId: sourceUserId, distance: 0 },
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (current.userId === targetUserId) {
        return current.distance;
      }

      if (visited.has(current.userId)) continue;
      visited.add(current.userId);

      if (current.distance >= 6) continue;

      const { data: outgoingLinks } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("target_user_id")
        .eq("source_user_id", current.userId)
        .eq("is_live", true);

      const { data: incomingLinks } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("source_user_id")
        .eq("target_user_id", current.userId)
        .eq("is_live", true);

      const neighbors = new Set<string>();
      outgoingLinks?.forEach((l) => neighbors.add(l.target_user_id));
      incomingLinks?.forEach((l) => neighbors.add(l.source_user_id));

      for (const neighborId of neighbors) {
        if (!visited.has(neighborId)) {
          queue.push({ userId: neighborId, distance: current.distance + 1 });
        }
      }
    }

    return 999;
  }

  static async hasDirectConnection(
    userA: string,
    userB: string
  ): Promise<boolean> {
    const { data: aToB } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userA)
      .eq("target_user_id", userB)
      .eq("is_live", true)
      .limit(1);

    if (aToB && aToB.length > 0) return true;

    const { data: bToA } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userB)
      .eq("target_user_id", userA)
      .eq("is_live", true)
      .limit(1);

    return (bToA && bToA.length > 0) || false;
  }

  static async detectShortLoop(
    sourceUserId: string,
    targetUserId: string,
    targetDomain: string
  ): Promise<boolean> {
    const { data: reverseLinks } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("source_user_id, target_site_domain")
      .eq("target_user_id", sourceUserId)
      .eq("is_live", true);

    if (!reverseLinks) return false;

    for (const link of reverseLinks) {
      if (link.source_user_id === targetUserId) {
        return true;
      }

      const { data: secondHop } = await supabaseAdmin
        .from("exchange_link_graph")
        .select("target_user_id")
        .eq("source_user_id", link.source_user_id)
        .eq("target_user_id", targetUserId)
        .eq("is_live", true)
        .limit(1);

      if (secondHop && secondHop.length > 0) {
        return true;
      }
    }

    return false;
  }

  static async getConnectionCount(userA: string, userB: string): Promise<number> {
    const { data: aToB } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userA)
      .eq("target_user_id", userB);

    const { data: bToA } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .eq("source_user_id", userB)
      .eq("target_user_id", userA);

    return (aToB?.length || 0) + (bToA?.length || 0);
  }

  static async isBlacklisted(userA: string, userB: string): Promise<boolean> {
    const { data } = await supabaseAdmin
      .from("exchange_blacklist")
      .select("id, expires_at")
      .or(
        `and(user_a_id.eq.${userA},user_b_id.eq.${userB}),and(user_a_id.eq.${userB},user_b_id.eq.${userA})`
      )
      .limit(1);

    if (!data || data.length === 0) return false;

    const blacklist = data[0];
    if (blacklist.expires_at) {
      const expiresAt = new Date(blacklist.expires_at);
      if (expiresAt < new Date()) {
        await supabaseAdmin.from("exchange_blacklist").delete().eq("id", blacklist.id);
        return false;
      }
    }

    return true;
  }

  static async addToBlacklist(
    userA: string,
    userB: string,
    reason: string,
    durationDays: number = BLACKLIST_DURATION_DAYS
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    await supabaseAdmin.from("exchange_blacklist").upsert(
      {
        user_a_id: userA,
        user_b_id: userB,
        reason,
        auto_generated: true,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString(),
      },
      { onConflict: "user_a_id,user_b_id" }
    );
  }

  static async executeExchange(
    requesterId: string,
    matchedRoute: MatchedRoute,
    targetUrl: string,
    anchorText: string,
    anchorType: string
  ): Promise<{ success: boolean; linkId?: string; error?: string }> {
    const routeValidation = await this.validateRoute(
      matchedRoute.sourceUserId,
      requesterId,
      new URL(targetUrl).hostname
    );

    if (!routeValidation.isValid) {
      return { success: false, error: routeValidation.blockedReason };
    }

    const spendResult = await CreditSystem.spendCredits(
      requesterId,
      matchedRoute.creditsRequired,
      `Exchange link from ${matchedRoute.domain}`
    );

    if (!spendResult.success) {
      return { success: false, error: spendResult.error };
    }

    const canPlace = await LinkInventoryPool.incrementOutboundLinks(matchedRoute.inventoryId);
    if (!canPlace) {
      await CreditSystem.awardBonus(
        requesterId,
        matchedRoute.creditsRequired,
        "Refund: Inventory slot unavailable"
      );
      return { success: false, error: "Inventory page has reached maximum outbound links" };
    }

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
        route_path: matchedRoute.routePath,
        credits_awarded: matchedRoute.creditsRequired,
        credits_status: "pending",
        min_live_days: 30,
        expires_at: null,
        is_live: true,
        is_indexed: false,
      })
      .select()
      .single();

    if (error || !linkRecord) {
      await CreditSystem.awardBonus(
        requesterId,
        matchedRoute.creditsRequired,
        "Refund: Link creation failed"
      );
      return { success: false, error: "Failed to create link record" };
    }

    await CreditSystem.awardPendingCredits(
      matchedRoute.sourceUserId,
      matchedRoute.creditsRequired,
      linkRecord.id,
      matchedRoute.inventoryId,
      `Link placed to ${new URL(targetUrl).hostname}`
    );

    const connectionCount = await this.getConnectionCount(
      matchedRoute.sourceUserId,
      requesterId
    );
    if (connectionCount >= MAX_CONNECTIONS_PER_PAIR) {
      await this.addToBlacklist(
        matchedRoute.sourceUserId,
        requesterId,
        "Maximum connections reached"
      );
    }

    return { success: true, linkId: linkRecord.id };
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
        min_hop_distance: MIN_HOP_DISTANCE,
        max_link_velocity: 5,
        anchor_branded_ratio: 0.4,
        anchor_naked_ratio: 0.3,
        anchor_keyword_ratio: 0.15,
        anchor_generic_ratio: 0.15,
        tier1_enabled: false,
        tier2_enabled: true,
        tier3_enabled: true,
      };

      await supabaseAdmin.from("exchange_settings").insert(defaultSettings);
      return defaultSettings;
    }

    return data;
  }

  static async updateUserSettings(
    userId: string,
    settings: Partial<any>
  ): Promise<void> {
    await supabaseAdmin
      .from("exchange_settings")
      .update({
        ...settings,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);
  }

  static async getExchangeStats(userId: string): Promise<{
    linksGiven: number;
    linksReceived: number;
    pendingRequests: number;
    avgHopDistance: number;
    indexRate: number;
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
    };
  }
}
