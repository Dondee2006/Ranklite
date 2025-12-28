import { NextResponse } from "next/server";

// Stripe checkout removed - using Whop checkout instead
// Redirect to Whop checkout page
export async function POST() {
  return NextResponse.json({
    url: "https://whop.com/checkout/plan_hwMsQBSgnZtPO"
  });
}

export async function GET() {
  return NextResponse.redirect("https://whop.com/checkout/plan_hwMsQBSgnZtPO");
}
