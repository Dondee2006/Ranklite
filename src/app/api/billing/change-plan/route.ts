import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { planId } = await request.json();
    
    if (!planId) {
      return NextResponse.json({ error: "Plan ID is required" }, { status: 400 });
    }

    // Mock response - replace with real implementation
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
