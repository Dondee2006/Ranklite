import { NextResponse } from "next/server";

// Mock data - replace with real implementation
const MOCK_USER_PLAN = null; // Set to null or provide mock data as needed

export async function GET() {
  return NextResponse.json({ userPlan: MOCK_USER_PLAN });
}
