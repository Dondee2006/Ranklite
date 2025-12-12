import { supabaseServer } from "@/lib/supabaseServer";
import { generate30DayPlan } from "@/lib/generatePlan";

export async function POST(req: Request) {
  const {
    userId,
    siteId
  } = await req.json();

  // Auto-generate the 30 day plan immediately after onboarding
  await generate30DayPlan(userId, siteId);

  return Response.json({ success: true });
}
