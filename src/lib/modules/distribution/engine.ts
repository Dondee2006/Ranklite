import { supabaseAdmin } from "@/lib/supabase/admin";
import { 
  ContentEngine, 
  type ContentRequest, 
  type ContentType,
  AnchorManager,
  RiskScorer,
  IndexationMonitor,
  LinkGraphAnalyzer,
} from "@/lib/backlink-core";

export type DerivativeType = 
  | "syndication"
  | "parasite_opinion"
  | "summary"
  | "snippet"
  | "abstract"
  | "quote_collection"
  | "micro_content";

export interface DistributionConfig {
  tier1DailyCap: number;
  tier2DailyCap: number;
  tier3DailyCap: number;
  tier1VelocityMinHours: number;
  tier2VelocityMinHours: number;
  tier3VelocityMinHours: number;
  targetIndexRate: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  keyword: string;
  secondary_keywords?: string[];
  excerpt?: string;
  site_id: string;
  user_id: string;
}

export interface Site {
  id: string;
  name: string;
  url: string;
  niche?: string;
}

export interface DistributionTask {
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

const DERIVATIVE_CONFIGS: Record<DerivativeType, {
  tier: 2 | 3;
  maxLength: number;
  contentType: ContentType;
  requiresUniqueIntro: boolean;
  requiresUniqueConclusion: boolean;
  platformCategories: string[];
}> = {
  syndication: {
    tier: 2,
    maxLength: 1500,
    contentType: "syndication",
    requiresUniqueIntro: true,
    requiresUniqueConclusion: true,
    platformCategories: ["Syndication", "Content Platform", "Web 2.0"],
  },
  parasite_opinion: {
    tier: 2,
    maxLength: 2000,
    contentType: "parasite_opinion",
    requiresUniqueIntro: true,
    requiresUniqueConclusion: true,
    platformCategories: ["Parasite SEO", "Authority Platform", "UGC Platform"],
  },
  summary: {
    tier: 3,
    maxLength: 400,
    contentType: "summary",
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    platformCategories: ["Aggregator", "Bookmark", "Feed"],
  },
  snippet: {
    tier: 3,
    maxLength: 200,
    contentType: "snippet",
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    platformCategories: ["Social Bookmark", "Profile"],
  },
  abstract: {
    tier: 3,
    maxLength: 300,
    contentType: "abstract",
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    platformCategories: ["Directory", "RSS"],
  },
  quote_collection: {
    tier: 3,
    maxLength: 500,
    contentType: "quote_collection",
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    platformCategories: ["Quote Site", "Micro Blog"],
  },
  micro_content: {
    tier: 3,
    maxLength: 150,
    contentType: "micro_content",
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    platformCategories: ["Profile", "Social"],
  },
};

const DEFAULT_CONFIG: DistributionConfig = {
  tier1DailyCap: 2,
  tier2DailyCap: 5,
  tier3DailyCap: 10,
  tier1VelocityMinHours: 48,
  tier2VelocityMinHours: 12,
  tier3VelocityMinHours: 4,
  targetIndexRate: 65,
};

export class DistributionEngine {
  private static MODULE_ID = "distribution" as const;

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
    };
  }

  static async distributeArticle(
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

    const derivatives = await this.createDerivatives(
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

    const derivativeIds = await this.saveDerivatives(derivatives, userId, articleId);
    const config = await this.getUserConfig(userId);
    const tasks = await this.createTasks(derivatives, derivativeIds, userId, articleId, config);

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

    return { tasksCreated: tasks.length, tier2Count, tier3Count };
  }

  private static async createDerivatives(
    article: Article,
    site: Site,
    targetUrl: string
  ): Promise<{
    type: DerivativeType;
    tier: number;
    title: string;
    content: string;
    excerpt: string;
    anchorText: string;
    anchorType: string;
    targetTier: number;
    platformCategory: string;
  }[]> {
    const derivatives: any[] = [];

    const tier2Types: DerivativeType[] = ["syndication", "parasite_opinion"];
    for (const type of tier2Types) {
      const config = DERIVATIVE_CONFIGS[type];
      
      const anchor = await AnchorManager.selectAnchor({
        userId: article.user_id,
        targetUrl,
        keyword: article.keyword,
        siteName: site.name,
        tier: config.tier,
        module: this.MODULE_ID,
      });

      const contentRequest: ContentRequest = {
        sourceTitle: article.title,
        sourceContent: article.content,
        keyword: article.keyword,
        secondaryKeywords: article.secondary_keywords,
        niche: site.niche,
        contentType: config.contentType,
        maxLength: config.maxLength,
        targetUrl,
        anchorText: anchor.text,
        requiresUniqueIntro: config.requiresUniqueIntro,
        requiresUniqueConclusion: config.requiresUniqueConclusion,
      };

      const generated = await ContentEngine.generateContent(contentRequest);

      derivatives.push({
        type,
        tier: config.tier,
        title: generated.title,
        content: generated.content,
        excerpt: generated.excerpt,
        anchorText: anchor.text,
        anchorType: anchor.type,
        targetTier: 1,
        platformCategory: config.platformCategories[0],
      });
    }

    const tier3Types: DerivativeType[] = ["summary", "snippet", "abstract"];
    for (const type of tier3Types) {
      const config = DERIVATIVE_CONFIGS[type];
      
      const anchor = await AnchorManager.selectAnchor({
        userId: article.user_id,
        targetUrl: "",
        keyword: article.keyword,
        siteName: site.name,
        tier: config.tier,
        module: this.MODULE_ID,
      });

      const contentRequest: ContentRequest = {
        sourceTitle: article.title,
        sourceContent: article.content,
        keyword: article.keyword,
        niche: site.niche,
        contentType: config.contentType,
        maxLength: config.maxLength,
        requiresUniqueIntro: config.requiresUniqueIntro,
        requiresUniqueConclusion: config.requiresUniqueConclusion,
      };

      const generated = await ContentEngine.generateContent(contentRequest);

      derivatives.push({
        type,
        tier: config.tier,
        title: generated.title,
        content: generated.content,
        excerpt: generated.excerpt,
        anchorText: anchor.text,
        anchorType: anchor.type,
        targetTier: 2,
        platformCategory: config.platformCategories[0],
      });
    }

    return derivatives;
  }

  private static async saveDerivatives(
    derivatives: any[],
    userId: string,
    articleId: string
  ): Promise<string[]> {
    const ids: string[] = [];

    for (const derivative of derivatives) {
      const { data, error } = await supabaseAdmin
        .from("content_derivatives")
        .insert({
          article_id: articleId,
          user_id: userId,
          derivative_type: derivative.type,
          tier: derivative.tier,
          title: derivative.title,
          content: derivative.content,
          excerpt: derivative.excerpt,
          anchor_text: derivative.anchorText,
          anchor_type: derivative.anchorType,
          target_url: derivative.targetTier === 1 ? derivative.targetUrl : "",
          target_tier: derivative.targetTier,
          platform_category: derivative.platformCategory,
          status: "pending",
          module: this.MODULE_ID,
        })
        .select("id")
        .single();

      if (data?.id) ids.push(data.id);
      if (error) console.error("Failed to save derivative:", error);
    }

    return ids;
  }

  private static async createTasks(
    derivatives: any[],
    derivativeIds: string[],
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

    const tier2Platforms = platforms.filter(p => 
      p.tier_category === 2 || (p.domain_rating >= 50 && p.domain_rating < 70)
    );
    const tier3Platforms = platforms.filter(p => 
      p.tier_category === 3 || p.domain_rating < 50
    );

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

        const isolation = await LinkGraphAnalyzer.enforceModuleIsolation(
          platform.base_url || platform.url,
          this.MODULE_ID
        );
        if (!isolation.allowed) continue;

        const scheduledFor = new Date(
          now.getTime() + tier2ScheduleOffset * config.tier2VelocityMinHours * 60 * 60 * 1000
        );

        tasks.push({
          user_id: userId,
          article_id: articleId,
          content_derivative_id: derivativeId,
          platform_id: platform.id,
          tier: 2,
          target_tier: derivative.targetTier,
          target_url: derivative.targetUrl || "",
          anchor_text: derivative.anchorText,
          anchor_type: derivative.anchorType,
          adapted_title: derivative.title,
          adapted_content: derivative.content,
          adapted_type: derivative.type,
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
        const scheduledFor = new Date(
          now.getTime() + (baseDelay + tier3ScheduleOffset * config.tier3VelocityMinHours) * 60 * 60 * 1000
        );

        tasks.push({
          user_id: userId,
          article_id: articleId,
          content_derivative_id: derivativeId,
          platform_id: platform.id,
          tier: 3,
          target_tier: derivative.targetTier,
          target_url: "",
          anchor_text: derivative.anchorText,
          anchor_type: derivative.anchorType,
          adapted_title: derivative.title,
          adapted_content: derivative.content,
          adapted_type: derivative.type,
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

  static async getStats(userId: string): Promise<{
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

  static async checkVelocity(userId: string, tier: number): Promise<{
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

  static async runHealthCheck(batchSize: number = 20): Promise<{
    checked: number;
    liveCount: number;
    indexedCount: number;
    failures: string[];
  }> {
    return IndexationMonitor.runHealthCheckBatch(this.MODULE_ID, batchSize);
  }
}
