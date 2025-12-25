import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-key";

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

interface TokenRefreshResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface GSCIntegration {
  id: string;
  site_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  site_url: string | null;
}

export class GSCClient {
  private accessToken: string;
  private refreshToken: string;
  private siteId: string;
  private integrationId: string;

  constructor(integration: GSCIntegration) {
    this.accessToken = integration.access_token;
    this.refreshToken = integration.refresh_token;
    this.siteId = integration.site_id;
    this.integrationId = integration.id;
  }

  private async refreshAccessToken(): Promise<string> {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Google OAuth credentials not configured");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: this.refreshToken,
        grant_type: "refresh_token",
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to refresh access token");
    }

    const data: TokenRefreshResponse = await response.json();
    this.accessToken = data.access_token;

    const expiresAt = new Date(Date.now() + data.expires_in * 1000);
    await supabaseAdmin
      .from("gsc_integrations")
      .update({
        access_token: data.access_token,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", this.integrationId);

    return this.accessToken;
  }

  private async makeRequest(url: string, options: RequestInit = {}, retries = 3): Promise<unknown> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 && attempt < retries - 1) {
          await this.refreshAccessToken();
          continue;
        }

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`GSC API error: ${error}`);
        }

        return await response.json();
      } catch (error) {
        if (attempt === retries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    }
  }

  async getSiteList() {
    const data = await this.makeRequest(
      "https://www.googleapis.com/webmasters/v3/sites"
    );
    return (data as { siteEntry?: unknown[] }).siteEntry || [];
  }

  async getPerformanceData(siteUrl: string, startDate: string, endDate: string) {
    const data = await this.makeRequest(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["page", "query", "country", "device"],
          rowLimit: 25000,
        }),
      }
    );
    return (data as { rows?: unknown[] }).rows || [];
  }

  async getPagePerformance(siteUrl: string, startDate: string, endDate: string) {
    const data = await this.makeRequest(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["page"],
          rowLimit: 25000,
        }),
      }
    );
    return (data as { rows?: unknown[] }).rows || [];
  }

  async getQueryPerformance(siteUrl: string, startDate: string, endDate: string) {
    const data = await this.makeRequest(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
      {
        method: "POST",
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: ["query"],
          rowLimit: 25000,
        }),
      }
    );
    return (data as { rows?: unknown[] }).rows || [];
  }

  async getSitemaps(siteUrl: string) {
    const data = await this.makeRequest(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/sitemaps`
    );
    return (data as { sitemap?: unknown[] }).sitemap || [];
  }
}

export async function getGSCIntegration(siteId: string): Promise<GSCIntegration | null> {
  const { data, error } = await supabaseAdmin
    .from("gsc_integrations")
    .select("*")
    .eq("site_id", siteId)
    .single();

  if (error || !data) return null;
  return data as GSCIntegration;
}
