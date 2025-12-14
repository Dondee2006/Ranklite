import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

interface QABacklink {
  id: string;
  source_name: string;
  source_domain: string;
  linking_url: string;
  anchor_text: string | null;
  is_dofollow: boolean | null;
  domain_rating: number | null;
  traffic: string | null;
  status: string;
  verification_status: string | null;
  date_added: string;
  created_at: string;
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

async function validateBacklink(backlink: QABacklink): Promise<ValidationResult> {
  const result: ValidationResult = {
    backlink_id: backlink.id,
    source_name: backlink.source_name,
    linking_url: backlink.linking_url,
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

    const response = await fetch(backlink.linking_url, {
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

    const linkMatches = html.match(
      /<a[^>]*href=["'][^"']*["'][^>]*>([^<]*)<\/a>/gi
    );

    if (linkMatches) {
      for (const match of linkMatches) {
        const hrefMatch = match.match(/href=["']([^"']*)["']/i);
        if (hrefMatch) {
          const href = hrefMatch[1];
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

async function checkIndexing(backlink: QABacklink): Promise<IndexingResult> {
  const daysSince = Math.floor(
    (Date.now() - new Date(backlink.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const result: IndexingResult = {
    backlink_id: backlink.id,
    source_name: backlink.source_name,
    linking_url: backlink.linking_url,
    is_indexed_google: null,
    robots_txt_allows: null,
    indexing_error: null,
    days_since_creation: daysSince,
  };

  try {
    const domain = new URL(backlink.linking_url).origin;
    const robotsUrl = `${domain}/robots.txt`;

    const robotsResponse = await fetch(robotsUrl, {
      signal: AbortSignal.timeout(10000),
    });

    if (robotsResponse.ok) {
      const robotsTxt = await robotsResponse.text();
      const disallowPatterns = robotsTxt
        .split("\n")
        .filter((line) => line.toLowerCase().startsWith("disallow:"))
        .map((line) => line.split(":")[1].trim());

      const path = new URL(backlink.linking_url).pathname;
      result.robots_txt_allows = !disallowPatterns.some((pattern) =>
        path.startsWith(pattern)
      );
    } else {
      result.robots_txt_allows = true;
    }

    const indexQuery = `site:${backlink.linking_url}`;
    const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(
      indexQuery
    )}`;

    const searchResponse = await fetch(googleUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(10000),
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

function assessQuality(backlink: QABacklink): QualityAssessment {
  const dr = backlink.domain_rating || 0;
  let quality_score: "high" | "medium" | "low" | "spam" = "low";
  let quality_notes = "";

  const spamIndicators = [
    backlink.source_domain.includes("blogspot"),
    backlink.source_domain.includes("wordpress.com"),
    backlink.source_domain.match(/\d{5,}/),
    !backlink.domain_rating,
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

  const trafficValue = backlink.traffic || "0";
  const trafficNum = parseFloat(trafficValue.replace(/[KM]/gi, ""));
  const isHighTraffic = trafficValue.includes("M") || trafficNum > 100;

  if (isHighTraffic && quality_score !== "spam") {
    quality_notes += ", high traffic";
  }

  return {
    backlink_id: backlink.id,
    source_name: backlink.source_name,
    source_domain: backlink.source_domain,
    domain_rating: backlink.domain_rating,
    traffic: backlink.traffic,
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

    const { data: backlinks } = await supabaseAdmin
      .from("backlinks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!backlinks || backlinks.length === 0) {
      return NextResponse.json(
        { error: "No backlinks found" },
        { status: 404 }
      );
    }

    const validation_results: ValidationResult[] = [];
    const indexing_results: IndexingResult[] = [];
    const quality_assessments: QualityAssessment[] = [];
    const errors: Array<{
      backlink_id: string;
      source_name: string;
      error_type: string;
      description: string;
    }> = [];

    for (const backlink of backlinks) {
      const validationResult = await validateBacklink(backlink);
      validation_results.push(validationResult);

      if (validationResult.error) {
        errors.push({
          backlink_id: backlink.id,
          source_name: backlink.source_name,
          error_type: "Validation Error",
          description: validationResult.error,
        });
      }

      if (!validationResult.exists) {
        errors.push({
          backlink_id: backlink.id,
          source_name: backlink.source_name,
          error_type: "Broken Link",
          description: "Backlink URL does not exist or is inaccessible",
        });
      }

      const indexingResult = await checkIndexing(backlink);
      indexing_results.push(indexingResult);

      if (indexingResult.days_since_creation > 7 && !indexingResult.is_indexed_google) {
        errors.push({
          backlink_id: backlink.id,
          source_name: backlink.source_name,
          error_type: "Not Indexed",
          description: `Not indexed after ${indexingResult.days_since_creation} days`,
        });
      }

      const qualityAssessment = assessQuality(backlink);
      quality_assessments.push(qualityAssessment);

      if (qualityAssessment.quality_score === "spam") {
        errors.push({
          backlink_id: backlink.id,
          source_name: backlink.source_name,
          error_type: "Low Quality",
          description: "Backlink flagged as potential spam",
        });
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    const summary = {
      total_backlinks: backlinks.length,
      validated: validation_results.filter((r) => r.exists).length,
      broken: validation_results.filter((r) => !r.exists).length,
      indexed: indexing_results.filter((r) => r.is_indexed_google).length,
      not_indexed: indexing_results.filter((r) => !r.is_indexed_google).length,
      high_quality: quality_assessments.filter((q) => q.quality_score === "high")
        .length,
      low_quality: quality_assessments.filter(
        (q) => q.quality_score === "low" || q.quality_score === "spam"
      ).length,
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
