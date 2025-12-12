import { GSCClient, getGSCIntegration, supabaseAdmin } from "./client";

interface PerformanceRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export async function syncGSCData(siteId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const integration = await getGSCIntegration(siteId);
    if (!integration) {
      return { success: false, error: "GSC integration not found" };
    }

    const client = new GSCClient(integration);

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const formatDate = (date: Date) => date.toISOString().split("T")[0];
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    const siteList = await client.getSiteList();
    let siteUrl = integration.site_url;

    if (!siteUrl && siteList.length > 0) {
      siteUrl = siteList[0].siteUrl;
      await supabaseAdmin
        .from("gsc_integrations")
        .update({ site_url: siteUrl })
        .eq("id", integration.id);
    }

    if (!siteUrl) {
      return { success: false, error: "No site URL found" };
    }

    const [performanceData, pageData, queryData] = await Promise.all([
      client.getPerformanceData(siteUrl, start, end),
      client.getPagePerformance(siteUrl, start, end),
      client.getQueryPerformance(siteUrl, start, end),
    ]);

    await storePerformanceData(siteId, performanceData, end);

    const metrics = {
      totalClicks: performanceData.reduce((sum: number, row: PerformanceRow) => sum + row.clicks, 0),
      totalImpressions: performanceData.reduce((sum: number, row: PerformanceRow) => sum + row.impressions, 0),
      avgCTR: performanceData.length > 0 
        ? performanceData.reduce((sum: number, row: PerformanceRow) => sum + row.ctr, 0) / performanceData.length 
        : 0,
      avgPosition: performanceData.length > 0
        ? performanceData.reduce((sum: number, row: PerformanceRow) => sum + row.position, 0) / performanceData.length
        : 0,
      topPages: pageData.slice(0, 10).map((row: PerformanceRow) => ({
        page: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })),
      topQueries: queryData.slice(0, 10).map((row: PerformanceRow) => ({
        query: row.keys[0],
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      })),
      lastSyncDate: new Date().toISOString(),
    };

    await supabaseAdmin
      .from("gsc_integrations")
      .update({
        metrics,
        last_sync_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", integration.id);

    return { success: true };
  } catch (error) {
    console.error("GSC sync error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

async function storePerformanceData(siteId: string, rows: PerformanceRow[], endDate: string) {
  if (!rows || rows.length === 0) return;

  const batchSize = 1000;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    
    const records = batch.map((row) => ({
      site_id: siteId,
      date: endDate,
      page: row.keys[0] || null,
      query: row.keys[1] || null,
      country: row.keys[2] || null,
      device: row.keys[3] || null,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    }));

    await supabaseAdmin.from("gsc_performance_data").upsert(records, {
      onConflict: "site_id,date,page,query,country,device",
      ignoreDuplicates: false,
    });
  }
}

export async function analyzeLowPerformingPages(siteId: string) {
  const { data: perfData } = await supabaseAdmin
    .from("gsc_performance_data")
    .select("*")
    .eq("site_id", siteId)
    .not("page", "is", null)
    .order("impressions", { ascending: false })
    .limit(100);

  if (!perfData) return [];

  const lowPerformers = perfData.filter(
    (page) => page.impressions > 100 && page.ctr < 0.02 && page.position > 10
  );

  return lowPerformers.map((page) => ({
    page: page.page,
    clicks: page.clicks,
    impressions: page.impressions,
    ctr: page.ctr,
    position: page.position,
    issue: "Low CTR with high impressions",
    recommendation: "Update meta title and description to improve CTR",
    priority: page.impressions > 1000 ? "high" : "medium",
  }));
}

export async function getContentOpportunities(siteId: string) {
  const { data: queryData } = await supabaseAdmin
    .from("gsc_performance_data")
    .select("*")
    .eq("site_id", siteId)
    .not("query", "is", null)
    .gte("position", 11)
    .lte("position", 20)
    .order("impressions", { ascending: false })
    .limit(50);

  if (!queryData) return [];

  return queryData.map((query) => ({
    query: query.query,
    currentPosition: query.position,
    impressions: query.impressions,
    clicks: query.clicks,
    opportunity: "Ranking on page 2 - optimize to reach page 1",
    recommendedAction: "Create or improve content targeting this keyword",
  }));
}
