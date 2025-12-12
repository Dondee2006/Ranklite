import type { Platform, PolicyCheckResult } from "./types";

const BLOCKED_PATTERNS = [
  /captcha/i,
  /recaptcha/i,
  /hcaptcha/i,
  /challenge/i,
  /cloudflare/i,
  /ddos-guard/i,
];

export async function checkRobotsTxt(domain: string): Promise<{
  allowed: boolean;
  checked: boolean;
  disallowedPaths: string[];
}> {
  try {
    const response = await fetch(`https://${domain}/robots.txt`, {
      headers: { "User-Agent": "RankliteBot/1.0 (compatible; backlink-checker)" },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return { allowed: true, checked: true, disallowedPaths: [] };
    }

    const text = await response.text();
    const lines = text.split("\n");
    const disallowedPaths: string[] = [];
    let isUserAgentMatch = false;

    for (const line of lines) {
      const trimmed = line.trim().toLowerCase();
      if (trimmed.startsWith("user-agent:")) {
        const agent = trimmed.replace("user-agent:", "").trim();
        isUserAgentMatch = agent === "*" || agent.includes("bot");
      } else if (isUserAgentMatch && trimmed.startsWith("disallow:")) {
        const path = trimmed.replace("disallow:", "").trim();
        if (path) {
          disallowedPaths.push(path);
        }
      }
    }

    const blocksAllBots = disallowedPaths.includes("/");
    return { allowed: !blocksAllBots, checked: true, disallowedPaths };
  } catch {
    return { allowed: true, checked: false, disallowedPaths: [] };
  }
}

export async function detectAntiBot(html: string): Promise<{
  hasCaptcha: boolean;
  hasJsChallenge: boolean;
  hasLoginWall: boolean;
  detectedPatterns: string[];
}> {
  const detectedPatterns: string[] = [];

  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(html)) {
      detectedPatterns.push(pattern.source);
    }
  }

  const hasCaptcha =
    html.includes("g-recaptcha") ||
    html.includes("h-captcha") ||
    html.includes("captcha") ||
    html.includes("data-sitekey");

  const hasJsChallenge =
    html.includes("cf-browser-verification") ||
    html.includes("challenge-running") ||
    html.includes("__cf_chl_opt") ||
    html.includes("ddos-guard");

  const hasLoginWall =
    html.includes('type="password"') &&
    (html.includes("login") || html.includes("sign in") || html.includes("log in"));

  return { hasCaptcha, hasJsChallenge, hasLoginWall, detectedPatterns };
}

export async function runPolicyCheck(
  platform: Platform,
  submissionUrl?: string
): Promise<PolicyCheckResult> {
  const result: PolicyCheckResult = {
    can_automate: true,
    robots_txt_checked: false,
    robots_txt_allows: true,
    tos_checked: false,
    tos_allows: platform.tos_allows_automation,
    has_captcha: platform.has_captcha,
    requires_login: platform.requires_login,
    checked_at: new Date().toISOString(),
  };

  if (!platform.automation_allowed) {
    result.can_automate = false;
    result.reason = "Platform explicitly disallows automation";
    return result;
  }

  if (platform.has_captcha) {
    result.can_automate = false;
    result.reason = "CAPTCHA detected - requires manual submission";
    return result;
  }

  const robotsCheck = await checkRobotsTxt(platform.site_domain);
  result.robots_txt_checked = robotsCheck.checked;
  result.robots_txt_allows = robotsCheck.allowed;

  if (!robotsCheck.allowed) {
    result.can_automate = false;
    result.reason = "robots.txt disallows bot access";
    return result;
  }

  if (submissionUrl) {
    try {
      const response = await fetch(submissionUrl, {
        method: "GET",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        signal: AbortSignal.timeout(10000),
      });

      if (response.status === 403 || response.status === 401) {
        result.can_automate = false;
        result.reason = `HTTP ${response.status} - Access denied`;
        return result;
      }

      if (response.status === 429) {
        result.can_automate = false;
        result.reason = "Rate limited - try again later";
        return result;
      }

      const html = await response.text();
      const antiBotCheck = await detectAntiBot(html);

      if (antiBotCheck.hasCaptcha) {
        result.can_automate = false;
        result.has_captcha = true;
        result.reason = "CAPTCHA detected on submission page";
        return result;
      }

      if (antiBotCheck.hasJsChallenge) {
        result.can_automate = false;
        result.reason = "JavaScript challenge detected - requires manual submission";
        return result;
      }

      if (antiBotCheck.hasLoginWall && platform.requires_login) {
        result.can_automate = false;
        result.requires_login = true;
        result.reason = "Login required - user credentials needed";
        return result;
      }
    } catch (error) {
      result.can_automate = false;
      result.reason = `Network error: ${error instanceof Error ? error.message : "Unknown"}`;
    }
  }

  return result;
}

export function shouldRequireManualReview(
  policyResult: PolicyCheckResult
): { required: boolean; reason: string | null } {
  if (policyResult.has_captcha) {
    return { required: true, reason: "CAPTCHA_DETECTED" };
  }

  if (policyResult.requires_login) {
    return { required: true, reason: "LOGIN_REQUIRED" };
  }

  if (!policyResult.robots_txt_allows) {
    return { required: true, reason: "ROBOTS_TXT_BLOCKED" };
  }

  if (!policyResult.tos_allows) {
    return { required: true, reason: "TOS_VIOLATION" };
  }

  if (!policyResult.can_automate) {
    return { required: true, reason: policyResult.reason || "AUTOMATION_BLOCKED" };
  }

  return { required: false, reason: null };
}
