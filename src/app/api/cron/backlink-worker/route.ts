import { NextResponse } from "next/server";
import { runVerificationCycle } from "@/lib/backlink-engine";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const results = await runVerificationCycle();
    return NextResponse.json({
      success: true,
      message: "Backlink verification cycle completed",
      ...results,
    });
  } catch (error) {
    console.error("Cron backlink-worker error:", error);
    return NextResponse.json(
      { error: "Backlink verification cycle failed" },
      { status: 500 }
    );
  }
}
