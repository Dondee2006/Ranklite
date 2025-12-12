import { analyzeLowPerformingPages, getContentOpportunities } from "./sync";
import { supabaseAdmin } from "./client";

interface ContentBrief {
  keyword: string;
  title: string;
  searchIntent: string;
  currentPosition?: number;
  impressions?: number;
  clicks?: number;
  priority: "high" | "medium" | "low";
  reason: string;
  articleType: string;
  targetWordCount: number;
}

export async function generateContentBriefsFromGSC(siteId: string): Promise<ContentBrief[]> {
  const briefs: ContentBrief[] = [];

  const [lowPerformers, opportunities] = await Promise.all([
    analyzeLowPerformingPages(siteId),
    getContentOpportunities(siteId),
  ]);

  for (const page of lowPerformers.slice(0, 10)) {
    briefs.push({
      keyword: extractKeywordFromUrl(page.page),
      title: generateOptimizedTitle(page.page, "Improve CTR"),
      searchIntent: "commercial",
      currentPosition: page.position,
      impressions: page.impressions,
      clicks: page.clicks,
      priority: page.priority as "high" | "medium" | "low",
      reason: page.issue,
      articleType: "optimization",
      targetWordCount: 1500,
    });
  }

  for (const opp of opportunities.slice(0, 15)) {
    briefs.push({
      keyword: opp.query,
      title: generateOptimizedTitle(opp.query, "Rank Higher"),
      searchIntent: determineIntent(opp.query),
      currentPosition: opp.currentPosition,
      impressions: opp.impressions,
      clicks: opp.clicks,
      priority: opp.impressions > 500 ? "high" : "medium",
      reason: opp.opportunity,
      articleType: determineArticleType(opp.query),
      targetWordCount: 2000,
    });
  }

  return briefs;
}

export async function createArticlesFromGSCInsights(siteId: string): Promise<number> {
  const briefs = await generateContentBriefsFromGSC(siteId);
  
  if (briefs.length === 0) return 0;

  const today = new Date().toISOString().split("T")[0];
  let created = 0;

  for (const brief of briefs) {
    const { error } = await supabaseAdmin.from("articles").insert({
      site_id: siteId,
      title: brief.title,
      slug: generateSlug(brief.title),
      keyword: brief.keyword,
      secondary_keywords: generateSecondaryKeywords(brief.keyword),
      search_intent: brief.searchIntent,
      article_type: brief.articleType,
      word_count: brief.targetWordCount,
      status: "planned",
      scheduled_date: today,
      notes: `GSC Insight: ${brief.reason}. Current position: ${brief.currentPosition || "N/A"}`,
      priority: brief.priority,
    });

    if (!error) created++;
  }

  return created;
}

export async function suggestMetaUpdates(siteId: string) {
  const lowPerformers = await analyzeLowPerformingPages(siteId);
  
  return lowPerformers.map((page) => ({
    page: page.page,
    currentCTR: page.ctr,
    currentPosition: page.position,
    impressions: page.impressions,
    suggestedMetaTitle: generateMetaTitle(page.page),
    suggestedMetaDescription: generateMetaDescription(page.page),
    reason: "Low CTR compared to position - improve meta tags to increase click-through rate",
  }));
}

function extractKeywordFromUrl(url: string): string {
  const parts = url.split("/").filter(Boolean);
  const lastPart = parts[parts.length - 1] || "";
  return lastPart
    .replace(/-/g, " ")
    .replace(/\.(html|php|aspx?)$/i, "")
    .trim();
}

function generateOptimizedTitle(keyword: string, goal: string): string {
  const cleaned = keyword.replace(/^https?:\/\/[^/]+\//, "").replace(/-/g, " ");
  const titleCased = cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  
  const templates = [
    `${titleCased}: Complete Guide for 2025`,
    `How to Master ${titleCased} (Step-by-Step)`,
    `${titleCased}: Everything You Need to Know`,
    `Ultimate ${titleCased} Guide`,
    `${titleCased}: Tips, Tricks & Best Practices`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function determineIntent(query: string): string {
  const lower = query.toLowerCase();
  
  if (lower.match(/buy|purchase|price|cost|cheap|best|top|review/)) {
    return "commercial";
  }
  if (lower.match(/how to|what is|why|when|where|guide|tutorial/)) {
    return "informational";
  }
  if (lower.match(/download|login|sign up|register|free|trial/)) {
    return "transactional";
  }
  
  return "informational";
}

function determineArticleType(query: string): string {
  const lower = query.toLowerCase();
  
  if (lower.includes("how to")) return "how-to";
  if (lower.includes("best") || lower.includes("top")) return "listicle";
  if (lower.includes("vs") || lower.includes("compare")) return "comparison";
  if (lower.includes("review")) return "review";
  if (lower.includes("guide")) return "guide";
  
  return "guide";
}

function generateSecondaryKeywords(primary: string): string[] {
  return [
    `${primary} guide`,
    `${primary} tips`,
    `best ${primary}`,
    `${primary} 2025`,
    `how to ${primary}`,
  ];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateMetaTitle(url: string): string {
  const keyword = extractKeywordFromUrl(url);
  return `${keyword.charAt(0).toUpperCase() + keyword.slice(1)} - Complete Guide 2025`;
}

function generateMetaDescription(url: string): string {
  const keyword = extractKeywordFromUrl(url);
  return `Discover everything about ${keyword}. Expert tips, actionable strategies, and proven methods to help you succeed. Read our comprehensive guide now.`;
}
