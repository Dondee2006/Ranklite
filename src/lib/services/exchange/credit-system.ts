import { supabaseAdmin } from "@/lib/supabase/admin";

export interface CreditBalance {
  balance: number;
  pendingCredits: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface CreditWeights {
  domainRating: number;
  indexationBonus: number;
  topicalRelevance: number;
  tierMultiplier: number;
  liveTimeBonus: number;
}

const BASE_CREDIT_VALUE = 10;
const MIN_LIVE_DAYS_FOR_FULL_CREDIT = 30;
const PENDING_TO_EARNED_DAYS = 7;
const DECAY_RATE_PER_MONTH = 0.05;

export class CreditSystem {
  static async getBalance(userId: string): Promise<CreditBalance> {
    const { data } = await supabaseAdmin
      .from("exchange_credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) {
      await this.initializeCredits(userId);
      return {
        balance: 0,
        pendingCredits: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      };
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

  static calculateCreditsForLink(params: {
    domainRating: number;
    isIndexed: boolean;
    niche?: string;
    targetNiche?: string;
    tier: number;
    liveDays?: number;
  }): { credits: number; weights: CreditWeights } {
    let credits = BASE_CREDIT_VALUE;

    const drWeight = this.getDomainRatingWeight(params.domainRating);
    credits *= drWeight;

    const indexBonus = params.isIndexed ? 1.5 : 0.5;
    credits *= indexBonus;

    let topicalRelevance = 1.0;
    if (params.niche && params.targetNiche) {
      topicalRelevance = params.niche.toLowerCase() === params.targetNiche.toLowerCase() ? 1.3 : 1.0;
    }
    credits *= topicalRelevance;

    const tierMultiplier = params.tier === 1 ? 0.3 : params.tier === 3 ? 1.5 : 1.0;
    credits *= tierMultiplier;

    let liveTimeBonus = 1.0;
    if (params.liveDays) {
      if (params.liveDays >= MIN_LIVE_DAYS_FOR_FULL_CREDIT) {
        liveTimeBonus = 1.2;
      } else if (params.liveDays >= 14) {
        liveTimeBonus = 1.0;
      } else if (params.liveDays >= 7) {
        liveTimeBonus = 0.8;
      } else {
        liveTimeBonus = 0.5;
      }
    }
    credits *= liveTimeBonus;

    return {
      credits: Math.round(credits * 100) / 100,
      weights: {
        domainRating: drWeight,
        indexationBonus: indexBonus,
        topicalRelevance,
        tierMultiplier,
        liveTimeBonus,
      },
    };
  }

  static getDomainRatingWeight(dr: number): number {
    if (dr >= 80) return 3.0;
    if (dr >= 70) return 2.5;
    if (dr >= 60) return 2.0;
    if (dr >= 50) return 1.5;
    if (dr >= 40) return 1.2;
    if (dr >= 30) return 1.0;
    if (dr >= 20) return 0.8;
    return 0.5;
  }

  static async awardPendingCredits(
    userId: string,
    amount: number,
    linkId: string,
    inventoryId: string,
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

    await this.recordTransaction(
      userId,
      "pending",
      amount,
      balance.balance,
      reason,
      linkId,
      inventoryId
    );
  }

  static async convertPendingToEarned(
    userId: string,
    linkId: string,
    amount: number
  ): Promise<void> {
    const balance = await this.getBalance(userId);

    const newBalance = balance.balance + amount;
    const newPending = Math.max(0, balance.pendingCredits - amount);

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        pending_credits: newPending,
        lifetime_earned: balance.lifetimeEarned + amount,
        last_credit_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(
      userId,
      "earned",
      amount,
      newBalance,
      "Link verified and live",
      linkId,
      undefined
    );
  }

  static async spendCredits(
    userId: string,
    amount: number,
    reason: string,
    linkId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const balance = await this.getBalance(userId);

    if (balance.balance < amount) {
      return {
        success: false,
        error: `Insufficient credits. Balance: ${balance.balance}, Required: ${amount}`,
      };
    }

    const newBalance = balance.balance - amount;

    await supabaseAdmin
      .from("exchange_credits")
      .update({
        balance: newBalance,
        lifetime_spent: balance.lifetimeSpent + amount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    await this.recordTransaction(userId, "spent", -amount, newBalance, reason, linkId, undefined);

    return { success: true };
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

    await this.recordTransaction(
      userId,
      "clawback",
      -amount,
      newBalance,
      reason,
      linkId,
      undefined
    );

    await supabaseAdmin
      .from("exchange_link_graph")
      .update({ credits_status: "clawedback" })
      .eq("id", linkId);
  }

  static async applyDecay(userId: string): Promise<number> {
    const balance = await this.getBalance(userId);

    if (balance.balance <= 0) return 0;

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
    const monthsSinceLastEarn =
      (now.getTime() - lastEarnedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (monthsSinceLastEarn < 1) return 0;

    const decayAmount = balance.balance * DECAY_RATE_PER_MONTH * Math.floor(monthsSinceLastEarn);
    const actualDecay = Math.min(decayAmount, balance.balance * 0.2);

    if (actualDecay <= 0) return 0;

    const newBalance = balance.balance - actualDecay;

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
      `Inactivity decay: ${Math.floor(monthsSinceLastEarn)} months`,
      undefined,
      undefined
    );

    return actualDecay;
  }

  static async awardBonus(
    userId: string,
    amount: number,
    reason: string
  ): Promise<void> {
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

    await this.recordTransaction(userId, "bonus", amount, newBalance, reason, undefined, undefined);
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
      created_at: new Date().toISOString(),
    });
  }

  static async getTransactionHistory(
    userId: string,
    limit: number = 50
  ): Promise<any[]> {
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
      .single();

    if (!link) return;

    if (link.credits_status !== "pending") return;

    const placementDate = new Date(link.placement_date);
    const now = new Date();
    const liveDays = Math.floor((now.getTime() - placementDate.getTime()) / (1000 * 60 * 60 * 24));

    if (liveDays < PENDING_TO_EARNED_DAYS) return;

    if (!link.is_live) {
      await this.clawbackCredits(
        link.source_user_id,
        link.credits_awarded,
        linkId,
        "Link no longer live"
      );
      return;
    }

    await this.convertPendingToEarned(link.source_user_id, linkId, link.credits_awarded);

    await supabaseAdmin
      .from("exchange_link_graph")
      .update({ credits_status: "awarded" })
      .eq("id", linkId);
  }

  static async getNetworkStats(): Promise<{
    totalCreditsInCirculation: number;
    totalPendingCredits: number;
    activeUsers: number;
    avgBalancePerUser: number;
  }> {
    const { data } = await supabaseAdmin
      .from("exchange_credits")
      .select("balance, pending_credits");

    if (!data || data.length === 0) {
      return {
        totalCreditsInCirculation: 0,
        totalPendingCredits: 0,
        activeUsers: 0,
        avgBalancePerUser: 0,
      };
    }

    const totalCredits = data.reduce((sum, r) => sum + parseFloat(r.balance || "0"), 0);
    const totalPending = data.reduce((sum, r) => sum + parseFloat(r.pending_credits || "0"), 0);
    const activeUsers = data.filter((r) => parseFloat(r.balance || "0") > 0).length;

    return {
      totalCreditsInCirculation: Math.round(totalCredits * 100) / 100,
      totalPendingCredits: Math.round(totalPending * 100) / 100,
      activeUsers,
      avgBalancePerUser: activeUsers > 0 ? Math.round((totalCredits / activeUsers) * 100) / 100 : 0,
    };
  }

  /**
   * Automated scan of the entire link graph to process verifications and clawbacks
   */
  static async runNetworkMaintenance(): Promise<{
    verified: number;
    clawedBack: number;
    processed: number;
  }> {
    const { data: links } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("id")
      .or("credits_status.eq.pending,credits_status.eq.awarded")
      .eq("is_live", true);

    if (!links) return { verified: 0, clawedBack: 0, processed: 0 };

    let verified = 0;
    let clawedBack = 0;

    for (const linkRecord of links) {
      // In a real system, we would perform an actual HTTP check here.
      // For the automated MVP, we call our existing processLinkVerification logic
      const statusBefore = await this.getLinkCreditsStatus(linkRecord.id);
      await this.processLinkVerification(linkRecord.id);
      const statusAfter = await this.getLinkCreditsStatus(linkRecord.id);

      if (statusBefore === "pending" && statusAfter === "awarded") {
        verified++;
      } else if (statusAfter === "clawedback") {
        clawedBack++;
      }
    }

    return { verified, clawedBack, processed: links.length };
  }

  private static async getLinkCreditsStatus(linkId: string): Promise<string> {
    const { data } = await supabaseAdmin
      .from("exchange_link_graph")
      .select("credits_status")
      .eq("id", linkId)
      .single();
    return data?.credits_status || "unknown";
  }
}
