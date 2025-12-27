import { supabaseAdmin } from "@/lib/supabase/admin";
import { ContentEngine, type ArticleSource, type SiteInfo } from "../backlink-core/content-engine";
import { AnchorManager } from "../backlink-core/anchor-manager";
import { RiskScoring } from "../backlink-core/risk-scoring";
import type { LinkTier, AnchorType, ContentAsset } from "../backlink-core/types";

export interface DistributionConfig {
  tier1DailyCap: number;
  tier2DailyCap: number;
  tier3DailyCap: number;
  tier1VelocityMinHours: number;
  tier2VelocityMinHours: number;
  tier3VelocityMinHours: number;
  targetIndexRate: number;
}

const DEFAULT_DISTRIBUTION_CONFIG: DistributionConfig = {
  tier1DailyCap: 2,
  tier2DailyCap: 5,
  tier3DailyCap: 10,
  tier1VelocityMinHours: 48,
  tier2VelocityMinHours: 12,
  tier3VelocityMinHours: 4,
  targetIndexRate: 65,
};

export interface DistributionTask {
  userId: string;
  articleId: string;
  contentAssetId: string;
  platformId: string;
  tier: LinkTier;
  targetTier: LinkTier;
  targetUrl: string;
  anchorText: string;
  anchorType: AnchorType;
  adaptedTitle: string;
  adaptedContent: string;
  adaptedType: string;
  scheduledFor: string;
  status: string;
  priority: number;
}

export class ContentDistributionModule {
  static readonly MODULE_TYPE = "distribution" as const;

  static async getUserConfig(userId: string): Promise<DistributionConfig> {
    const { data } = await supabaseAdmin
      .from("distribution_config")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!data) return DEFAULT_DISTRIBUTION_CONFIG;

    return {
      tier1DailyCap: data.tier1_daily_cap || DEFAULT_DISTRIBUTION_CONFIG.tier1DailyCap,
      tier2DailyCap: data.tier2_daily_cap || DEFAULT_DISTRIBUTION_CONFIG.tier2DailyCap,
      tier3DailyCap: data.tier3_daily_cap || DEFAULT_DISTRIBUTION_CONFIG.tier3DailyCap,
      tier1VelocityMinHours: data.tier1_velocity_min_hours || DEFAULT_DISTRIBUTION_CONFIG.tier1VelocityMinHours,
      tier2VelocityMinHours: data.tier2_velocity_min_hours || DEFAULT_DISTRIBUTION_CONFIG.tier2VelocityMinHours,
      tier3VelocityMinHours: data.tier3_velocity_min_hours || DEFAULT_DISTRIBUTION_CONFIG.tier3VelocityMinHours,
      targetIndexRate: data.target_index_rate || DEFAULT_DISTRIBUTION_CONFIG.targetIndexRate,
    };
  }

  static async enableAmplification(
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

    const articleSource: ArticleSource = {
      id: article.id,
      title: article.title,
      content: article.content || "",
      keyword: article.keyword,
      excerpt: article.excerpt,
      userId,
      siteId: article.site_id,
    };

    const siteInfo: SiteInfo = {
      id: site.id,
      name: site.name,
      url: site.url,
      niche: site.niche,
    };

    const anchorProvider = async (tier: LinkTier) => {
      return AnchorManager.allocateAnchor(
        userId,
        tier,
        article.keyword,
        site.name,
        site.url,
        site.id
      );
    };

    const assets = await ContentEngine.generateDerivatives(
      articleSource,
      siteInfo,
      targetUrl,
      this.MODULE_TYPE,
      {
        anchorProvider: (tier) => {
          const allocation = AnchorManager.allocateAnchor(
            userId, tier, article.keyword, site.name, site.url, site.id
          );
          return allocation.then(a => ({ text: a.anchorText, type: a.anchorType }));
        } as any,
      }
    );

    const assetIds = await ContentEngine.saveContentAssets(assets);

    const config = await this.getUserConfig(userId);
    const tasks = await this.createDistributionTasks(assets, assetIds, userId, articleId, config);

    let tier2Count = 0;
    let tier3Count = 0;

    for (const task of tasks) {
      const { error } = await supabaseAdmin.from("backlink_tasks").insert({
        user_id: task.userId,
        article_id: task.articleId,
        content_derivative_id: task.contentAssetId,
        platform_id: task.platformId,
        tier: task.tier,
        target_tier: task.targetTier,
        target_url: task.targetUrl,
        anchor_text: task.anchorText,
        anchor_type: task.anchorType,
        adapted_title: task.adaptedTitle,
        adapted_content: task.adaptedContent,
        adapted_type: task.adaptedType,
        scheduled_for: task.scheduledFor,
        status: task.status,
        priority: task.priority,
        source_module: this.MODULE_TYPE,
      });

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

  private static async createDistributionTasks(
    assets: ContentAsset[],
    assetIds: string[],
    userId: string,
    articleId: string,
    config: DistributionConfig
  ): Promise<DistributionTask[]> {
    const tasks: DistributionTask[] = [];
    const now = new Date();

    const { data: platforms } = await supabaseAdmin
      .from("backlink_platforms")
      .select("*")
      .eq("automation_allowed", true)
      .order("domain_rating", { ascending: false });

    if (!platforms?.length) return tasks;

    const tier2Platforms = platforms.filter(
      (p) => p.tier_category === 2 || (p.domain_rating >= 50 && p.domain_rating < 70)
    );
    const tier3Platforms = platforms.filter(
      (p) => p.tier_category === 3 || p.domain_rating < 50
    );

    let tier2Index = 0;
    let tier3Index = 0;
    let tier2ScheduleOffset = 0;
    let tier3ScheduleOffset = 0;

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];
      const assetId = assetIds[i];
      if (!assetId) continue;

      if (asset.tier === 2) {
        const platform = tier2Platforms[tier2Index % tier2Platforms.length];
        if (!platform) continue;

        const riskAssessment = await RiskScoring.assessPlatform(platform.id);
        if (!riskAssessment.isAcceptable) continue;

        const scheduledFor = new Date(
          now.getTime() + tier2ScheduleOffset * config.tier2VelocityMinHours * 60 * 60 * 1000
        );

        tasks.push({
          userId,
          articleId,
          contentAssetId: assetId,
          platformId: platform.id,
          tier: 2,
          targetTier: 1,
          targetUrl: asset.targetUrl,
          anchorText: asset.anchorText,
          anchorType: asset.anchorType,
          adaptedTitle: asset.title,
          adaptedContent: asset.content,
          adaptedType: asset.type,
          scheduledFor: scheduledFor.toISOString(),
          status: "pending",
          priority: Math.ceil((platform.domain_rating || 50) / 10),
        });

        tier2Index++;
        tier2ScheduleOffset++;
      } else if (asset.tier === 3) {
        const platform = tier3Platforms[tier3Index % tier3Platforms.length];
        if (!platform) continue;

        const baseDelay = config.tier2VelocityMinHours * 2;
        const scheduledFor = new Date(
          now.getTime() +
            (baseDelay + tier3ScheduleOffset * config.tier3VelocityMinHours) * 60 * 60 * 1000
        );

        tasks.push({
          userId,
          articleId,
          contentAssetId: assetId,
          platformId: platform.id,
          tier: 3,
          targetTier: 2,
          targetUrl: "",
          anchorText: asset.anchorText,
          anchorType: asset.anchorType,
          adaptedTitle: asset.title,
          adaptedContent: asset.content,
          adaptedType: asset.type,
          scheduledFor: scheduledFor.toISOString(),
          status: "pending",
          priority: Math.ceil((platform.domain_rating || 30) / 10),
        });

        tier3Index++;
        tier3ScheduleOffset++;
      }
    }

    return tasks;
  }

  static async checkVelocityLimits(
    userId: string,
    tier: LinkTier
  ): Promise<{ allowed: boolean; reason?: string; nextAvailableAt?: string }> {
    const config = await this.getUserConfig(userId);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const { data: todayBacklinks } = await supabaseAdmin
      .from("backlinks")
      .select("id, source_tier")
      .eq("user_id", userId)
      .gte("created_at", todayStart.toISOString());

    const tierBacklinksToday = todayBacklinks?.filter((b) => b.source_tier === tier).length || 0;
    const cap =
      tier === 1
        ? config.tier1DailyCap
        : tier === 2
        ? config.tier2DailyCap
        : config.tier3DailyCap;

    if (tierBacklinksToday >= cap) {
      const tomorrow = new Date(todayStart);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        allowed: false,
        reason: `Daily cap of ${cap} Tier ${tier} links reached`,
        nextAvailableAt: tomorrow.toISOString(),
      };
    }

    const velocityHours =
      tier === 1
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
        const nextAvailable = new Date(
          lastCreated.getTime() + velocityHours * 60 * 60 * 1000
        );
        return {
          allowed: false,
          reason: `Minimum ${velocityHours}h between Tier ${tier} links`,
          nextAvailableAt: nextAvailable.toISOString(),
        };
      }
    }

    return { allowed: true };
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
      .eq("status", "pending")
      .eq("source_module", this.MODULE_TYPE);

    const tier1Links = backlinks?.filter((b) => (b.tier || b.source_tier) === 1).length || 0;
    const tier2Links = backlinks?.filter((b) => (b.tier || b.source_tier) === 2).length || 0;
    const tier3Links = backlinks?.filter((b) => (b.tier || b.source_tier) === 3).length || 0;
    const indexedCount = backlinks?.filter((b) => b.is_indexed).length || 0;
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

  static async getArticleDistributionStatus(articleId: string): Promise<{
    derivatives: ContentAsset[];
    tier2Tasks: number;
    tier3Tasks: number;
    completedTasks: number;
    pendingTasks: number;
    backlinksCreated: number;
    indexedBacklinks: number;
  }> {
    const derivatives = await ContentEngine.getContentAssetsForArticle(articleId);

    const { data: tasks } = await supabaseAdmin
      .from("backlink_tasks")
      .select("tier, status")
      .eq("article_id", articleId)
      .eq("source_module", this.MODULE_TYPE);

    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("is_indexed")
      .eq("article_id", articleId);

    return {
      derivatives,
      tier2Tasks: tasks?.filter((t) => t.tier === 2).length || 0,
      tier3Tasks: tasks?.filter((t) => t.tier === 3).length || 0,
      completedTasks: tasks?.filter((t) => t.status === "completed").length || 0,
      pendingTasks: tasks?.filter((t) => t.status === "pending").length || 0,
      backlinksCreated: backlinks?.length || 0,
      indexedBacklinks: backlinks?.filter((b) => b.is_indexed).length || 0,
    };
  }

  static async disableAmplification(articleId: string): Promise<void> {
    await supabaseAdmin
      .from("backlink_tasks")
      .update({ status: "cancelled" })
      .eq("article_id", articleId)
      .eq("status", "pending")
      .eq("source_module", this.MODULE_TYPE);

    await supabaseAdmin
      .from("articles")
      .update({
        content_amplification_enabled: false,
        backlinks_status: "disabled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", articleId);
  }
}
