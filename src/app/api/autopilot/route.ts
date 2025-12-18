import { NextResponse } from "next/server";

// Mock data - replace with real implementation
export async function GET() {
  return NextResponse.json({ settings: null });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ settings: body });
}
