import { NextResponse, NextRequest } from "next/server";
import { AutopilotEngine } from "@/lib/services/autopilot-engine";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // Autopilot generation can take time

export async function GET(request: NextRequest) {
  // 1. Security Check
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Allow secret in header or query param for flexibility
  const url = new URL(request.url);
  const querySecret = url.searchParams.get('key');

  if (authHeader !== `Bearer ${cronSecret}` && querySecret !== cronSecret) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    console.log(`[CRON] Starting global autopilot run...`);
    const results = await AutopilotEngine.runForAllSites();
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results
    });
  } catch (error: any) {
    console.error("[CRON] Global Autopilot Failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Also support POST for standard cron trigger patterns
export async function POST(request: NextRequest) {
    return GET(request);
}
