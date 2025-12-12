import { supabaseAdmin } from "@/lib/supabase/admin";
import type { BacklinkVerification } from "./types";
import { logAction } from "./logger";

interface VerificationResult {
  found: boolean;
  anchor_text?: string;
  is_dofollow: boolean;
  html_snippet?: string;
  status_code?: number;
  error?: string;
}

export async function verifyBacklink(
  targetUrl: string,
  websiteUrl: string
): Promise<VerificationResult> {
  try {
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; RankliteBot/1.0; +https://ranklite.com/bot)",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      return {
        found: false,
        is_dofollow: false,
        status_code: response.status,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();
    const normalizedUrl = websiteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const linkPattern = new RegExp(
      `<a[^>]*href=["'][^"']*${normalizedUrl.replace(/\./g, "\\.")}[^"']*["'][^>]*>([^<]*)</a>`,
      "gi"
    );

    const matches = [...html.matchAll(linkPattern)];

    if (matches.length === 0) {
      return {
        found: false,
        is_dofollow: false,
        status_code: response.status,
      };
    }

    const firstMatch = matches[0];
    const fullTag = firstMatch[0];
    const anchorText = firstMatch[1];
    const isNofollow =
      /rel=["'][^"']*nofollow[^"']*["']/i.test(fullTag) ||
      /rel=["'][^"']*sponsored[^"']*["']/i.test(fullTag) ||
      /rel=["'][^"']*ugc[^"']*["']/i.test(fullTag);

    return {
      found: true,
      anchor_text: anchorText,
      is_dofollow: !isNofollow,
      html_snippet: fullTag.substring(0, 500),
      status_code: response.status,
    };
  } catch (error) {
    return {
      found: false,
      is_dofollow: false,
      error: error instanceof Error ? error.message : "Verification failed",
    };
  }
}

export async function runVerificationCycle(): Promise<{
  verified: number;
  not_found: number;
  errors: number;
}> {
  const { data: pendingVerifications } = await supabaseAdmin
    .from("backlink_verifications")
    .select("*, backlink:backlinks(*)")
    .eq("verification_status", "pending")
    .lte("next_verification_at", new Date().toISOString())
    .limit(20);

  const results = { verified: 0, not_found: 0, errors: 0 };

  if (!pendingVerifications?.length) {
    return results;
  }

  for (const verification of pendingVerifications as Array<
    BacklinkVerification & { backlink: { user_id: string; source_domain: string } }
  >) {
    const websiteUrl =
      verification.expected_anchor_text ||
      verification.backlink?.source_domain ||
      "";

    const result = await verifyBacklink(verification.target_url, websiteUrl);

    if (result.error) {
      results.errors++;
      await updateVerificationRecord(verification.id, {
        verification_status: "error",
        verification_count: verification.verification_count + 1,
        last_verified_at: new Date().toISOString(),
        next_verification_at: getNextVerificationDate(verification.verification_count + 1),
        response_status_code: result.status_code,
      });
      continue;
    }

    if (result.found) {
      results.verified++;
      await updateVerificationRecord(verification.id, {
        verification_status: "verified",
        found_anchor_text: result.anchor_text,
        is_dofollow: result.is_dofollow,
        is_indexed: true,
        verification_count: verification.verification_count + 1,
        last_verified_at: new Date().toISOString(),
        next_verification_at: getNextVerificationDate(verification.verification_count + 1),
        response_status_code: result.status_code,
        html_snippet: result.html_snippet,
      });

      if (verification.backlink_id) {
        await supabaseAdmin
          .from("backlinks")
          .update({
            status: "indexed",
            verification_status: "verified",
            anchor_text: result.anchor_text,
            is_dofollow: result.is_dofollow,
          })
          .eq("id", verification.backlink_id);
      }

      await logAction(verification.user_id, "backlink_verified", {
        verification_id: verification.id,
        target_url: verification.target_url,
        anchor_text: result.anchor_text,
        is_dofollow: result.is_dofollow,
      });
    } else {
      results.not_found++;
      await updateVerificationRecord(verification.id, {
        verification_status:
          verification.verification_count >= 3 ? "not_found" : "pending",
        verification_count: verification.verification_count + 1,
        last_verified_at: new Date().toISOString(),
        next_verification_at: getNextVerificationDate(verification.verification_count + 1),
        response_status_code: result.status_code,
      });

      if (verification.verification_count >= 3 && verification.backlink_id) {
        await supabaseAdmin
          .from("backlinks")
          .update({
            status: "lost",
            verification_status: "not_found",
          })
          .eq("id", verification.backlink_id);
      }
    }
  }

  return results;
}

async function updateVerificationRecord(
  id: string,
  updates: Partial<BacklinkVerification>
): Promise<void> {
  await supabaseAdmin
    .from("backlink_verifications")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

function getNextVerificationDate(verificationCount: number): string {
  const days =
    verificationCount === 1 ? 7 : verificationCount === 2 ? 30 : 90;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function getVerificationStats(userId: string): Promise<{
  verified: number;
  pending: number;
  not_found: number;
  dofollow_count: number;
  nofollow_count: number;
}> {
  const { data: verifications } = await supabaseAdmin
    .from("backlink_verifications")
    .select("verification_status, is_dofollow")
    .eq("user_id", userId);

  const stats = {
    verified: 0,
    pending: 0,
    not_found: 0,
    dofollow_count: 0,
    nofollow_count: 0,
  };

  verifications?.forEach((v) => {
    if (v.verification_status === "verified") {
      stats.verified++;
      if (v.is_dofollow) stats.dofollow_count++;
      else stats.nofollow_count++;
    } else if (v.verification_status === "pending") {
      stats.pending++;
    } else if (v.verification_status === "not_found") {
      stats.not_found++;
    }
  });

  return stats;
}
