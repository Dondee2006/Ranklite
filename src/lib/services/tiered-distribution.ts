import { supabaseAdmin } from "@/lib/supabase/admin";
import { ContentAdaptationLayer, type ContentDerivative } from "./content-adaptation";

export interface DistributionConfig {
  tier1DailyCap: number;
  tier2DailyCap: number;
  tier3DailyCap: number;
  tier1VelocityMinHours: number;
  tier2VelocityMinHours: number;
  tier3VelocityMinHours: number;
  targetIndexRate: number;
  anchorBrandedRatio: number;
  anchorNakedRatio: number;
  anchorKeywordRatio: number;
  anchorGenericRatio: number;
}

const DEFAULT_CONFIG: DistributionConfig = {
  tier1DailyCap: 2,
  tier2DailyCap: 5,
  tier3DailyCap: 10,
  tier1VelocityMinHours: 48,
  tier2VelocityMinHours: 12,
  tier3VelocityMinHours: 4,
  targetIndexRate: 65,
  anchorBrandedRatio: 0.35,
  anchorNakedRatio: 0.30,
  anchorKeywordRatio: 0.15,
  anchorGenericRatio: 0.20,
};

export interface TieredTask {
  user_id: string;
  article_id: string;
  content_derivative_id: string;
  platform_id: string;
  tier: number;
  target_tier: number;
  target_url: string;
  anchor_text: string;
  anchor_type: string;
  adapted_title: string;
  adapted_content: string;
  adapted_type: string;
  scheduled_for: string;
  status: string;
  priority: number;
}

export class TieredDistributionEngine {
  static async getUserConfig(userId: string): Promise<DistributionConfig> {
    const { data } = await supabaseAdmin
      .from("distribution_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) return DEFAULT_CONFIG;

    return {
      tier1DailyCap: data.tier1_daily_cap || DEFAULT_CONFIG.tier1DailyCap,
      tier2DailyCap: data.tier2_daily_cap || DEFAULT_CONFIG.tier2DailyCap,
      tier3DailyCap: data.tier3_daily_cap || DEFAULT_CONFIG.tier3DailyCap,
      tier1VelocityMinHours: data.tier1_velocity_min_hours || DEFAULT_CONFIG.tier1VelocityMinHours,
      tier2VelocityMinHours: data.tier2_velocity_min_hours || DEFAULT_CONFIG.tier2VelocityMinHours,
      tier3VelocityMinHours: data.tier3_velocity_min_hours || DEFAULT_CONFIG.tier3VelocityMinHours,
      targetIndexRate: data.target_index_rate || DEFAULT_CONFIG.targetIndexRate,
      anchorBrandedRatio: parseFloat(data.anchor_branded_ratio) || DEFAULT_CONFIG.anchorBrandedRatio,
      anchorNakedRatio: parseFloat(data.anchor_naked_ratio) || DEFAULT_CONFIG.anchorNakedRatio,
      anchorKeywordRatio: parseFloat(data.anchor_keyword_ratio) || DEFAULT_CONFIG.anchorKeywordRatio,
      anchorGenericRatio: parseFloat(data.anchor_generic_ratio) || DEFAULT_CONFIG.anchorGenericRatio,
    };
  }

  static async distributeContentForArticle(
    articleId: string,
    userId: string,
    siteUrl: string
  ): Promise<{ tasksCreated: number; tier2Count: number; tier3Count: number }> {
    const { data: article } = await supabaseAdmin
      .from("articles")
      .select("*, sites!inner(*)")
      .eq("id", articleId)
      .single();

    if (!article) throw new Error("Article not found");

    const site = article.sites;
    const targetUrl = `${siteUrl}/blog/${article.slug}`;

    const derivatives = await ContentAdaptationLayer.createDerivativesForArticle(
      {
        id: article.id,
        title: article.title,
        content: article.content || "",
        keyword: article.keyword,
        secondary_keywords: article.secondary_keywords,
        excerpt: article.excerpt,
        site_id: article.site_id,
        user_id: userId,
      },
      {
        id: site.id,
        name: site.name,
        url: site.url,
        niche: site.niche,
      },
      targetUrl
    );

    const derivativeIds = await ContentAdaptationLayer.saveDerivatives(derivatives);

    const config = await this.getUserConfig(userId);
    const tasks = await this.createDistributionTasks(derivatives, derivativeIds, userId, articleId, config);

    let tier2Count = 0;
    let tier3Count = 0;

    for (const task of tasks) {
      const { error } = await supabaseAdmin.from("backlink_tasks").insert(task);
      if (!error) {
        if (task.tier === 2) tier2Count++;
        if (task.tier === 3) tier3Count++;
      }
    }

    await supabaseAdmin
      .from("articles")
      .update({
        backlinks_status: "distributing",
        content_amplification_enabled: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);

    return {
      tasksCreated: tasks.length,
      tier2Count,
      tier3Count,
    };
  }

  static async createDistributionTasks(
    derivatives: ContentDerivative[],
    derivativeIds: string[],
    userId: string,
    articleId: string,
    config: DistributionConfig
  ): Promise<TieredTask[]> {
    const tasks: TieredTask[] = [];
    const now = new Date();

    const { data: platforms } = await supabaseAdmin
      .from("backlink_platforms")
      .select("*")
      .eq("automation_allowed", true)
      .order("domain_rating", { ascending: false });

    if (!platforms?.length) return tasks;

    const tier2Platforms = platforms.filter(p => p.tier_category === 2 || (p.domain_rating >= 50 && p.domain_rating < 70));
    const tier3Platforms = platforms.filter(p => p.tier_category === 3 || p.domain_rating < 50);

    let tier2Index = 0;
    let tier3Index = 0;
    let tier2ScheduleOffset = 0;
    let tier3ScheduleOffset = 0;

    for (let i = 0; i < derivatives.length; i++) {
      const derivative = derivatives[i];
      const derivativeId = derivativeIds[i];

      if (!derivativeId) continue;

      if (derivative.tier === 2) {
        const platform = tier2Platforms[tier2Index % tier2Platforms.length];
        if (!platform) continue;

        const scheduledFor = new Date(now.getTime() + tier2ScheduleOffset * config.tier2VelocityMinHours * 60 * 60 * 1000);

        tasks.push({
          user_id: userId,
          article_id: articleId,
          content_derivative_id: derivativeId,
          platform_id: platform.id,
          tier: 2,
          target_tier: derivative.target_tier,
          target_url: derivative.target_url,
          anchor_text: derivative.anchor_text,
          anchor_type: derivative.anchor_type,
          adapted_title: derivative.title,
          adapted_content: derivative.content,
          adapted_type: derivative.derivative_type,
          scheduled_for: scheduledFor.toISOString(),
          status: "pending",
          priority: Math.ceil((platform.domain_rating || 50) / 10),
        });

        tier2Index++;
        tier2ScheduleOffset++;
      } else if (derivative.tier === 3) {
        const platform = tier3Platforms[tier3Index % tier3Platforms.length];
        if (!platform) continue;

        const baseDelay = config.tier2VelocityMinHours * 2;
        const scheduledFor = new Date(now.getTime() + (baseDelay + tier3ScheduleOffset * config.tier3VelocityMinHours) * 60 * 60 * 1000);

        tasks.push({
          user_id: userId,
          article_id: articleId,
          content_derivative_id: derivativeId,
          platform_id: platform.id,
          tier: 3,
          target_tier: derivative.target_tier,
          target_url: derivative.target_url,
          anchor_text: derivative.anchor_text,
          anchor_type: derivative.anchor_type,
          adapted_title: derivative.title,
          adapted_content: derivative.content,
          adapted_type: derivative.derivative_type,
          scheduled_for: scheduledFor.toISOString(),
          status: "pending",
          priority: Math.ceil((platform.domain_rating || 30) / 10),
        });

        tier3Index++;
        tier3ScheduleOffset++;
      }
    }

    return tasks;
  }

  static async getDistributionStats(userId: string): Promise<{
    tier1Links: number;
    tier2Links: number;
    tier3Links: number;
    indexedCount: number;
    indexRate: number;
    pendingTasks: number;
  }> {
    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("tier, source_tier, is_indexed")
      .eq("user_id", userId);

    const { data: tasks } = await supabaseAdmin
      .from("backlink_tasks")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "pending");

    const tier1Links = backlinks?.filter(b => b.tier === 1 || b.source_tier === 1).length || 0;
    const tier2Links = backlinks?.filter(b => b.tier === 2 || b.source_tier === 2).length || 0;
    const tier3Links = backlinks?.filter(b => b.tier === 3 || b.source_tier === 3).length || 0;
    const indexedCount = backlinks?.filter(b => b.is_indexed).length || 0;
    const totalLinks = backlinks?.length || 0;

    return {
      tier1Links,
      tier2Links,
      tier3Links,
      indexedCount,
      indexRate: totalLinks > 0 ? Math.round((indexedCount / totalLinks) * 100) : 0,
      pendingTasks: tasks?.length || 0,
    };
  }

  static async checkVelocityLimits(userId: string, tier: number): Promise<{
    allowed: boolean;
    reason?: string;
    nextAvailableAt?: string;
  }> {
    const config = await this.getUserConfig(userId);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { data: todayBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("id, created_at, source_tier")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    const tierBacklinksToday = todayBacklinks?.filter(b => b.source_tier === tier).length || 0;
    const cap = tier === 1 ? config.tier1DailyCap : tier === 2 ? config.tier2DailyCap : config.tier3DailyCap;

    if (tierBacklinksToday >= cap) {
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        allowed: false,
        reason: `Daily cap of ${cap} Tier ${tier} links reached`,
        nextAvailableAt: tomorrow.toISOString(),
      };
    }

    const velocityHours = tier === 1 
      ? config.tier1VelocityMinHours 
      : tier === 2 
        ? config.tier2VelocityMinHours 
        : config.tier3VelocityMinHours;

    const { data: recentBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("created_at")
      .eq("user_id", userId)
      .eq("source_tier", tier)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (recentBacklinks?.created_at) {
      const lastCreated = new Date(recentBacklinks.created_at);
      const hoursSince = (now.getTime() - lastCreated.getTime()) / (1000 * 60 * 60);

      if (hoursSince < velocityHours) {
        const nextAvailable = new Date(lastCreated.getTime() + velocityHours * 60 * 60 * 1000);
        return {
          allowed: false,
          reason: `Minimum ${velocityHours}h between Tier ${tier} links`,
          nextAvailableAt: nextAvailable.toISOString(),
        };
      }
    }

    return { allowed: true };
  }

  static async getArticleDistributionStatus(articleId: string): Promise<{
    derivatives: any[];
    tier2Tasks: number;
    tier3Tasks: number;
    completedTasks: number;
    pendingTasks: number;
    backlinksCreated: number;
    indexedBacklinks: number;
  }> {
    const { data: derivatives } = await supabaseAdmin
      .from("content_derivatives")
      .select("*")
      .eq("article_id", articleId);

    const { data: tasks } = await supabaseAdmin
      .from("backlink_tasks")
      .select("tier, status")
      .eq("article_id", articleId);

    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("is_indexed")
      .eq("article_id", articleId);

    return {
      derivatives: derivatives || [],
      tier2Tasks: tasks?.filter(t => t.tier === 2).length || 0,
      tier3Tasks: tasks?.filter(t => t.tier === 3).length || 0,
      completedTasks: tasks?.filter(t => t.status === "completed").length || 0,
      pendingTasks: tasks?.filter(t => t.status === "pending").length || 0,
      backlinksCreated: backlinks?.length || 0,
      indexedBacklinks: backlinks?.filter(b => b.is_indexed).length || 0,
    };
  }
}
