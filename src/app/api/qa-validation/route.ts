import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ExchangeLink {
  id: string;
  source_inventory_id: string;
  target_site_domain: string;
  link_url: string;
  anchor_text: string | null;
  created_at: string;
  link_inventory: {
    page_url: string;
    domain: string;
    domain_rating: number;
    traffic_estimate: number;
    link_type: string;
  };
}

interface ValidationResult {
  backlink_id: string;
  source_name: string;
  linking_url: string;
  exists: boolean;
  correct_url: boolean;
  anchor_text_found: string | null;
  is_dofollow: boolean | null;
  html_placement: string | null;
  response_code: number | null;
  error: string | null;
}

interface IndexingResult {
  backlink_id: string;
  source_name: string;
  linking_url: string;
  is_indexed_google: boolean | null;
  robots_txt_allows: boolean | null;
  indexing_error: string | null;
  days_since_creation: number;
}

interface QualityAssessment {
  backlink_id: string;
  source_name: string;
  source_domain: string;
  domain_rating: number | null;
  traffic: string | null;
  is_relevant: boolean;
  quality_score: "high" | "medium" | "low" | "spam";
  quality_notes: string;
}

interface QAReport {
  summary: {
    total_backlinks: number;
    validated: number;
    broken: number;
    indexed: number;
    not_indexed: number;
    high_quality: number;
    low_quality: number;
    dofollow: number;
    nofollow: number;
  };
  validation_results: ValidationResult[];
  indexing_results: IndexingResult[];
  quality_assessments: QualityAssessment[];
  errors: Array<{
    backlink_id: string;
    source_name: string;
    error_type: string;
    description: string;
  }>;
  generated_at: string;
}

async function validateLinkPlacement(
  sourceUrl: string,
  targetUrl: string
): Promise<ValidationResult> {
  const result: ValidationResult = {
    backlink_id: "", // filled by caller
    source_name: "", // filled by caller
    linking_url: sourceUrl,
    exists: false,
    correct_url: false,
    anchor_text_found: null,
    is_dofollow: null,
    html_placement: null,
    response_code: null,
    error: null,
  };

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(sourceUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RankliteBot/1.0; +https://ranklite.com/bot)",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    result.response_code = response.status;

    if (!response.ok) {
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    const html = await response.text();
    result.exists = true;

    // Simplify target URL for matching (remove protocol and www)
    const cleanTarget = targetUrl.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

    const linkMatches = html.match(
      /<a[^>]*href=["'][^"']*["'][^>]*>([^<]*)<\/a>/gi
    );

    if (linkMatches) {
      for (const match of linkMatches) {
        const hrefMatch = match.match(/href=["']([^"']*)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
          // Check if href roughly matches target
          if (href.includes(cleanTarget)) {
            result.correct_url = true;

            const anchorMatch = match.match(/>([^<]+)</);
            if (anchorMatch) {
              result.anchor_text_found = anchorMatch[1].trim();
            }

            const isNofollow =
              /rel=["'][^"']*nofollow[^"']*["']/i.test(match) ||
              /rel=["'][^"']*sponsored[^"']*["']/i.test(match) ||
              /rel=["'][^"']*ugc[^"']*["']/i.test(match);

            result.is_dofollow = !isNofollow;
            result.html_placement = match.substring(0, 200);
            break;
          }
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        result.error = "Request timeout";
      } else {
        result.error = error.message;
      }
    } else {
      result.error = "Unknown error occurred";
    }
  }

  return result;
}

async function checkIndexing(sourceUrl: string, createdAt: string): Promise<Omit<IndexingResult, "backlink_id" | "source_name" | "linking_url">> {
  const daysSince = Math.floor(
    (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const result: Omit<IndexingResult, "backlink_id" | "source_name" | "linking_url"> = {
    is_indexed_google: null,
    robots_txt_allows: null,
    indexing_error: null,
    days_since_creation: daysSince,
  };

  try {
    const domain = new URL(sourceUrl).origin;
    const robotsUrl = `${domain}/robots.txt`;

    const robotsResponse = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(5000),
    });

    if (robotsResponse.ok) {
      const robotsTxt = await robotsResponse.text();
      const disallowPatterns = robotsTxt
        .split("\n")
        .filter((line) => line.toLowerCase().startsWith("disallow:"))
        .map((line) => line.split(":")[1].trim());

      const path = new URL(sourceUrl).pathname;
      result.robots_txt_allows = !disallowPatterns.some((pattern) =>
        path.startsWith(pattern)
      );
    } else {
      result.robots_txt_allows = true;
    }

    const indexQuery = `site:${sourceUrl}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
      indexQuery
    )}`;

    const searchResponse = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (searchResponse.ok) {
      const searchHtml = await searchResponse.text();
      result.is_indexed_google = !searchHtml.includes("did not match any documents");
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      result.indexing_error = error.message;
    }
  }

  return result;
}

function assessQuality(link: ExchangeLink): QualityAssessment {
  const dr = link.link_inventory?.domain_rating || 0;
  let quality_score: "high" | "medium" | "low" | "spam" = "low";
  let quality_notes = "";

  const domain = link.link_inventory?.domain || "";

  const spamIndicators = [
    domain.includes("blogspot"),
    domain.includes("wordpress.com"),
    domain.match(/\d{5,}/),
    !dr,
  ];

  const spamCount = spamIndicators.filter(Boolean).length;

  if (spamCount >= 3) {
    quality_score = "spam";
    quality_notes = "Multiple spam indicators detected";
  } else if (dr >= 70) {
    quality_score = "high";
    quality_notes = "High authority domain";
  } else if (dr >= 40) {
    quality_score = "medium";
    quality_notes = "Moderate authority domain";
  } else {
    quality_score = "low";
    quality_notes = "Low authority domain";
  }

  const trafficValue = String(link.link_inventory?.traffic_estimate || "0");
  const trafficNum = parseFloat(trafficValue.replace(/[KM]/gi, ""));
  const isHighTraffic = trafficValue.includes("M") || trafficNum > 100;

  if (isHighTraffic && quality_score !== "spam") {
    quality_notes += ", high traffic";
  }

  return {
    backlink_id: link.id,
    source_name: domain || "Unknown Source",
    source_domain: domain,
    domain_rating: dr,
    traffic: trafficValue,
    is_relevant: true,
    quality_score,
    quality_notes,
  };
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch received links from Exchange Graph
    const { data: exchangeLinks, error } = await supabase
      .from("exchange_link_graph")
      .select(`
        *,
        link_inventory:source_inventory_id (
          page_url,
          domain,
          domain_rating,
          traffic_estimate,
          link_type
        )
      `)
      .eq("target_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    // If error (e.g. invalid query) or no data, we should still return a structured report (empty)
    // rather than throwing 500/404 to avoid frontend breaking.
    // However, if it's a real DB error (missing table), we might want to log it.

    const links = (exchangeLinks || []) as unknown as ExchangeLink[];

    const validation_results: ValidationResult[] = [];
    const indexing_results: IndexingResult[] = [];
    const quality_assessments: QualityAssessment[] = [];
    const errors: Array<{
      backlink_id: string;
      source_name: string;
      error_type: string;
      description: string;
    }> = [];

    if (error) {
      console.error("Error fetching exchange links (likely missing migrations):", error);
      // We can return an error description in the report instead of crashing
      errors.push({
        backlink_id: "system",
        source_name: "System",
        error_type: "Database Error",
        description: "Failed to fetch exchange links. Please ensure database migrations are applied."
      });
    }

    for (const link of links) {
      // link_inventory might be null if left join failed (unlikely if referential integrity holds, but possible)
      const sourceUrl = link.link_inventory?.page_url;
      const targetUrl = link.link_url;

      if (!sourceUrl) {
        continue; // Skip if we can't find source
      }

      const valResult = await validateLinkPlacement(sourceUrl, targetUrl);
      valResult.backlink_id = link.id;
      valResult.source_name = link.link_inventory?.domain || "Unknown";

      validation_results.push(valResult);

      if (valResult.error) {
        errors.push({
          backlink_id: link.id,
          source_name: valResult.source_name,
          error_type: "Validation Error",
          description: valResult.error,
        });
      }

      if (!valResult.exists) {
        errors.push({
          backlink_id: link.id,
          source_name: valResult.source_name,
          error_type: "Broken Link",
          description: "Page inaccessible or link not found",
        });
      }

      const idxResult = await checkIndexing(sourceUrl, link.created_at);
      indexing_results.push({
        backlink_id: link.id,
        source_name: valResult.source_name,
        linking_url: sourceUrl,
        ...idxResult
      });

      if (idxResult.days_since_creation > 7 && !idxResult.is_indexed_google) {
        errors.push({
          backlink_id: link.id,
          source_name: valResult.source_name,
          error_type: "Not Indexed",
          description: `Not indexed after ${idxResult.days_since_creation} days`,
        });
      }

      const qualResult = assessQuality(link);
      quality_assessments.push(qualResult);

      if (qualResult.quality_score === "spam") {
        errors.push({
          backlink_id: link.id,
          source_name: valResult.source_name,
          error_type: "Low Quality",
          description: "Potential spam detected",
        });
      }

      // small delay to be polite
      await new Promise(r => setTimeout(r, 500));
    }

    const summary = {
      total_backlinks: links.length,
      validated: validation_results.filter((r) => r.exists && r.correct_url).length,
      broken: validation_results.filter((r) => !r.exists || !r.correct_url).length,
      indexed: indexing_results.filter((r) => r.is_indexed_google).length,
      not_indexed: indexing_results.filter((r) => !r.is_indexed_google).length,
      high_quality: quality_assessments.filter((q) => q.quality_score === "high").length,
      low_quality: quality_assessments.filter((q) => ["low", "spam"].includes(q.quality_score)).length,
      dofollow: validation_results.filter((r) => r.is_dofollow === true).length,
      nofollow: validation_results.filter((r) => r.is_dofollow === false).length,
    };

    const report: QAReport = {
      summary,
      validation_results,
      indexing_results,
      quality_assessments,
      errors,
      generated_at: new Date().toISOString(),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("QA Report generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate QA report" },
      { status: 500 }
    );
  }
}
