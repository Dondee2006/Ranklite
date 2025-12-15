import { NextResponse } from "next/server";

// Mock data - replace with real implementation
export async function GET() {
  return NextResponse.json({
    backlinks: [],
    campaign: {
      status: "active",
      agent_status: "idle",
      current_step: null,
      total_backlinks: 0,
      unique_sources: 0,
      avg_domain_rating: 0,
      this_month_backlinks: 0,
      website_url: null,
      last_scan_at: null,
      next_scan_at: null,
    },
  });
}
