import { requesty } from "@/lib/ai";
import { generateText } from "ai";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type DerivativeType = 
  | "syndication"
  | "parasite_opinion"
  | "summary"
  | "snippet"
  | "abstract"
  | "quote_collection"
  | "micro_content";

export type AnchorType = "branded" | "naked" | "keyword" | "partial" | "generic";

export interface DerivativeConfig {
  type: DerivativeType;
  tier: 2 | 3;
  maxLength: number;
  requiresUniqueIntro: boolean;
  requiresUniqueConclusion: boolean;
  linkPlacement: "contextual" | "bio" | "footer";
  platformCategories: string[];
}

const DERIVATIVE_CONFIGS: Record<DerivativeType, DerivativeConfig> = {
  syndication: {
    type: "syndication",
    tier: 2,
    maxLength: 1500,
    requiresUniqueIntro: true,
    requiresUniqueConclusion: true,
    linkPlacement: "contextual",
    platformCategories: ["Syndication", "Content Platform", "Web 2.0"],
  },
  parasite_opinion: {
    type: "parasite_opinion",
    tier: 2,
    maxLength: 2000,
    requiresUniqueIntro: true,
    requiresUniqueConclusion: true,
    linkPlacement: "contextual",
    platformCategories: ["Parasite SEO", "Authority Platform", "UGC Platform"],
  },
  summary: {
    type: "summary",
    tier: 3,
    maxLength: 400,
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    linkPlacement: "footer",
    platformCategories: ["Aggregator", "Bookmark", "Feed"],
  },
  snippet: {
    type: "snippet",
    tier: 3,
    maxLength: 200,
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    linkPlacement: "bio",
    platformCategories: ["Social Bookmark", "Profile"],
  },
  abstract: {
    type: "abstract",
    tier: 3,
    maxLength: 300,
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    linkPlacement: "footer",
    platformCategories: ["Directory", "RSS"],
  },
  quote_collection: {
    type: "quote_collection",
    tier: 3,
    maxLength: 500,
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    linkPlacement: "footer",
    platformCategories: ["Quote Site", "Micro Blog"],
  },
  micro_content: {
    type: "micro_content",
    tier: 3,
    maxLength: 150,
    requiresUniqueIntro: false,
    requiresUniqueConclusion: false,
    linkPlacement: "bio",
    platformCategories: ["Profile", "Social"],
  },
};

const ANCHOR_DISTRIBUTION = {
  tier2: { branded: 0.4, naked: 0.35, partial: 0.15, generic: 0.1 },
  tier3: { naked: 0.5, branded: 0.35, generic: 0.15 },
};

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

export interface ContentDerivative {
  article_id: string;
  user_id: string;
  derivative_type: DerivativeType;
  tier: number;
  title: string;
  content: string;
  excerpt?: string;
  anchor_text: string;
  anchor_type: AnchorType;
  target_url: string;
  target_tier: number;
  platform_category: string;
}

export class ContentAdaptationLayer {
  static async createDerivativesForArticle(
    article: Article,
    site: Site,
    targetUrl: string
  ): Promise<ContentDerivative[]> {
    const derivatives: ContentDerivative[] = [];

    const tier2Types: DerivativeType[] = ["syndication", "parasite_opinion"];
    for (const type of tier2Types) {
      const config = DERIVATIVE_CONFIGS[type];
      const derivative = await this.generateDerivative(article, site, targetUrl, config, 1);
      if (derivative) derivatives.push(derivative);
    }

    const tier3Types: DerivativeType[] = ["summary", "snippet", "abstract"];
    for (const type of tier3Types) {
      const config = DERIVATIVE_CONFIGS[type];
      const derivative = await this.generateDerivative(article, site, targetUrl, config, 2);
      if (derivative) derivatives.push(derivative);
    }

    return derivatives;
  }

  static async generateDerivative(
    article: Article,
    site: Site,
    targetUrl: string,
    config: DerivativeConfig,
    targetTier: number
  ): Promise<ContentDerivative | null> {
    try {
      const anchorData = this.selectAnchor(article, site, config.tier);
      const derivativeContent = await this.generateAdaptedContent(article, site, config, targetUrl, anchorData);

      return {
        article_id: article.id,
        user_id: article.user_id,
        derivative_type: config.type,
        tier: config.tier,
        title: derivativeContent.title,
        content: derivativeContent.content,
        excerpt: derivativeContent.excerpt,
        anchor_text: anchorData.text,
        anchor_type: anchorData.type,
        target_url: targetTier === 1 ? targetUrl : "",
        target_tier: targetTier,
        platform_category: config.platformCategories[0],
      };
    } catch (error) {
      console.error(`Failed to generate ${config.type} derivative:`, error);
      return null;
    }
  }

  static selectAnchor(
    article: Article,
    site: Site,
    tier: 2 | 3
  ): { text: string; type: AnchorType } {
    const distribution = tier === 2 ? ANCHOR_DISTRIBUTION.tier2 : ANCHOR_DISTRIBUTION.tier3;
    const rand = Math.random();
    let cumulative = 0;

    for (const [type, ratio] of Object.entries(distribution)) {
      cumulative += ratio;
      if (rand <= cumulative) {
        return {
          text: this.generateAnchorText(type as AnchorType, article, site),
          type: type as AnchorType,
        };
      }
    }

    return { text: site.name, type: "branded" };
  }

  static generateAnchorText(type: AnchorType, article: Article, site: Site): string {
    const siteUrl = site.url?.replace(/^https?:\/\//, "").replace(/\/$/, "") || site.name;

    switch (type) {
      case "branded":
        return site.name;
      case "naked":
        return siteUrl;
      case "keyword":
        return article.keyword;
      case "partial":
        return `${article.keyword} guide`;
      case "generic":
        const generics = ["read more", "learn more", "click here", "this article", "source"];
        return generics[Math.floor(Math.random() * generics.length)];
      default:
        return site.name;
    }
  }

  static async generateAdaptedContent(
    article: Article,
    site: Site,
    config: DerivativeConfig,
    targetUrl: string,
    anchorData: { text: string; type: AnchorType }
  ): Promise<{ title: string; content: string; excerpt: string }> {
    const prompts: Record<DerivativeType, string> = {
      syndication: `Rewrite this article for syndication on a third-party blog.

ORIGINAL ARTICLE: "${article.title}"
KEYWORD: ${article.keyword}
ORIGINAL CONTENT (excerpt): ${article.content.slice(0, 2000)}

REQUIREMENTS:
1. Write a COMPLETELY NEW introduction (different angle/hook)
2. Reframe the main points with fresh examples
3. Write a NEW conclusion with different takeaways
4. Naturally include this contextual link: <a href="${targetUrl}">${anchorData.text}</a>
5. Keep it under ${config.maxLength} words
6. DO NOT duplicate the original - make it unique enough to rank separately

Output format:
TITLE: [New title - different from original]
CONTENT: [Full rewritten article]`,

      parasite_opinion: `Create an opinion/editorial piece inspired by this article for a high-authority platform.

ORIGINAL TOPIC: "${article.title}"
KEYWORD: ${article.keyword}
CONTEXT: ${article.content.slice(0, 1500)}

REQUIREMENTS:
1. Take a STRONG stance or unique perspective on the topic
2. Write as a thought-leader sharing personal insights
3. Include 2-3 controversial or debate-worthy points
4. Naturally reference the source with: <a href="${targetUrl}">${anchorData.text}</a>
5. Keep under ${config.maxLength} words
6. Make it suitable for Medium, LinkedIn, or Substack

Output format:
TITLE: [Opinion headline]
CONTENT: [Full opinion piece]`,

      summary: `Create a brief summary of this article for content aggregators.

ARTICLE: "${article.title}"
CONTENT: ${article.content.slice(0, 1000)}

REQUIREMENTS:
1. 3-4 sentences capturing the key value
2. End with: "Read the full guide at ${anchorData.text}"
3. Keep under ${config.maxLength} characters

Output format:
TITLE: ${article.title}
CONTENT: [Summary text]`,

      snippet: `Create a micro-snippet for social bookmarking.

ARTICLE: "${article.title}"
KEYWORD: ${article.keyword}

REQUIREMENTS:
1. 1-2 punchy sentences
2. Include the keyword naturally
3. Under ${config.maxLength} characters

Output format:
TITLE: ${article.title}
CONTENT: [Snippet]`,

      abstract: `Create an abstract/description for directory listings.

ARTICLE: "${article.title}"
TOPIC: ${article.keyword}
CONTEXT: ${article.content.slice(0, 500)}

REQUIREMENTS:
1. Professional, informative tone
2. 2-3 sentences
3. Under ${config.maxLength} characters

Output format:
TITLE: ${article.title}
CONTENT: [Abstract]`,

      quote_collection: `Extract 3-4 quotable insights from this article.

ARTICLE: "${article.title}"
CONTENT: ${article.content.slice(0, 1500)}

REQUIREMENTS:
1. Pull the most impactful/shareable statements
2. Format as a quote collection
3. Under ${config.maxLength} characters total

Output format:
TITLE: Key Insights: ${article.title}
CONTENT: [Quotes]`,

      micro_content: `Create a micro-content piece for profile descriptions.

TOPIC: ${article.keyword}
CONTEXT: ${article.title}

REQUIREMENTS:
1. Single compelling sentence
2. Under ${config.maxLength} characters

Output format:
TITLE: ${article.keyword}
CONTENT: [Micro content]`,
    };

    try {
      const { text } = await generateText({
        model: requesty("openai/gpt-4o-mini"),
        prompt: prompts[config.type],
        maxOutputTokens: config.maxLength * 2,
      });

      const titleMatch = text.match(/TITLE:\s*(.+)/);
      const contentMatch = text.match(/CONTENT:\s*([\s\S]+)/);

      const title = titleMatch?.[1]?.trim() || article.title;
      const content = contentMatch?.[1]?.trim() || text;

      return {
        title,
        content: content.slice(0, config.maxLength * 5),
        excerpt: content.slice(0, 200),
      };
    } catch (error) {
      console.error("Content generation error:", error);
      return {
        title: article.title,
        content: article.excerpt || article.content.slice(0, config.maxLength),
        excerpt: article.excerpt || article.content.slice(0, 200),
      };
    }
  }

  static async saveDerivatives(derivatives: ContentDerivative[]): Promise<string[]> {
    const ids: string[] = [];

    for (const derivative of derivatives) {
      const { data, error } = await supabaseAdmin
        .from("content_derivatives")
        .insert({
          article_id: derivative.article_id,
          user_id: derivative.user_id,
          derivative_type: derivative.derivative_type,
          tier: derivative.tier,
          title: derivative.title,
          content: derivative.content,
          excerpt: derivative.excerpt,
          anchor_text: derivative.anchor_text,
          anchor_type: derivative.anchor_type,
          target_url: derivative.target_url,
          target_tier: derivative.target_tier,
          platform_category: derivative.platform_category,
          status: "pending",
        })
        .select("id")
        .single();

      if (data?.id) ids.push(data.id);
      if (error) console.error("Failed to save derivative:", error);
    }

    return ids;
  }

  static async getDerivativesForArticle(articleId: string): Promise<any[]> {
    const { data } = await supabaseAdmin
      .from("content_derivatives")
      .select("*")
      .eq("article_id", articleId)
      .order("tier", { ascending: true });

    return data || [];
  }
}
