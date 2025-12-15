import { NextResponse } from "next/server";

// Mock data - replace with real implementation
const MOCK_PLANS = [
  {
    id: "1",
    name: "Starter",
    price: "29",
    posts_per_month: 10,
    backlinks_per_post: 3,
    qa_validation: false,
    integrations_limit: 1,
  },
  {
    id: "2",
    name: "Professional",
    price: "79",
    posts_per_month: 30,
    backlinks_per_post: 5,
    qa_validation: true,
    integrations_limit: 5,
  },
  {
    id: "3",
    name: "Enterprise",
    price: "199",
    posts_per_month: 100,
    backlinks_per_post: 10,
    qa_validation: true,
    integrations_limit: -1,
  },
];

export async function GET() {
  return NextResponse.json({ plans: MOCK_PLANS });
}
