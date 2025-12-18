import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
<<<<<<< HEAD

  const body = await request.json();
  const { month, year } = body;

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: job, error } = await supabase
    .from("generation_jobs")
    .insert({
      user_id: user.id,
      site_id: site.id,
      status: "pending",
      progress: 0,
      total: 30,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/content-calendar/generate-bulk/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jobId: job.id, month, year }),
  }).catch(console.error);

  return NextResponse.json({ success: true, jobId: job.id });
=======
>>>>>>> fc887e15397d1fac37f6e9ee1a57a550e2f70dbb
}
