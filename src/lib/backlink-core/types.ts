export type ModuleType = "distribution" | "exchange";

export type LinkTier = 1 | 2 | 3;

export type AnchorType = "branded" | "naked" | "keyword" | "partial" | "generic";

export type ContentPlacement = "contextual" | "sidebar" | "footer" | "author_bio";

export type LinkStatus = "pending" | "live" | "indexed" | "dead" | "removed";

export interface CoreConfig {
  maxDailyLinksPerTier: Record<LinkTier, number>;
  minHoursBetweenLinks: Record<LinkTier, number>;
  targetIndexRate: number;
  anchorDistribution: Record<AnchorType, number>;
}

export interface LinkRecord {
  id: string;
  userId: string;
  siteId?: string;
  articleId?: string;
  sourceModule: ModuleType;
  sourceDomain: string;
  sourceUrl: string;
  targetDomain: string;
  targetUrl: string;
  anchorText: string;
  anchorType: AnchorType;
  tier: LinkTier;
  status: LinkStatus;
  isIndexed: boolean;
  domainRating?: number;
  riskScore?: number;
  createdAt: string;
  verifiedAt?: string;
}

export interface ContentAsset {
  id: string;
  userId: string;
  articleId: string;
  type: "syndication" | "parasite" | "summary" | "snippet" | "abstract" | "micro";
  title: string;
  content: string;
  excerpt?: string;
  tier: LinkTier;
  targetUrl: string;
  anchorText: string;
  anchorType: AnchorType;
  platformCategory: string;
  status: "pending" | "published" | "failed";
  sourceModule: ModuleType;
}

export interface RiskAssessment {
  score: number;
  factors: RiskFactor[];
  isAcceptable: boolean;
  recommendation: string;
}

export interface RiskFactor {
  name: string;
  impact: number;
  description: string;
}

export interface IndexationResult {
  url: string;
  isIndexed: boolean;
  lastChecked: string;
  indexDate?: string;
  deindexDate?: string;
}

export interface AnchorAllocation {
  anchorText: string;
  anchorType: AnchorType;
  isWithinLimits: boolean;
  currentDistribution: Record<AnchorType, number>;
}

export interface GraphDistance {
  fromUserId: string;
  toUserId: string;
  hopCount: number;
  path: string[];
  hasDirectLink: boolean;
  hasShortLoop: boolean;
}

export interface ModuleStats {
  module: ModuleType;
  totalLinks: number;
  tier1Links: number;
  tier2Links: number;
  tier3Links: number;
  indexedLinks: number;
  indexRate: number;
  pendingTasks: number;
  lastActivityAt?: string;
}

export interface UnifiedReport {
  userId: string;
  distribution: ModuleStats;
  exchange: ModuleStats;
  combined: {
    totalLinks: number;
    totalIndexed: number;
    overallIndexRate: number;
    authorityScore: number;
    riskLevel: "low" | "medium" | "high";
  };
  anchorProfile: Record<AnchorType, { count: number; percentage: number }>;
  tierDistribution: Record<LinkTier, { count: number; percentage: number }>;
  recentActivity: { date: string; distribution: number; exchange: number }[];
}

export const DEFAULT_CORE_CONFIG: CoreConfig = {
  maxDailyLinksPerTier: { 1: 2, 2: 5, 3: 10 },
  minHoursBetweenLinks: { 1: 48, 2: 12, 3: 4 },
  targetIndexRate: 65,
  anchorDistribution: {
    branded: 0.35,
    naked: 0.30,
    keyword: 0.15,
    partial: 0.10,
    generic: 0.10,
  },
};
