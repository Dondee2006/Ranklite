import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { month, year } = body;

  let { data: site } = await supabase
    .from("sites")
    .select("id, domain, name")
    .eq("user_id", user.id)
    .single();

  // Auto-create a site if the user doesn't have one
  if (!site) {
    const { data: newSite, error: siteError } = await supabase
      .from("sites")
      .insert({
        user_id: user.id,
        name: "My Website",
        domain: "example.com",
      })
      .select("id, domain, name")
      .single();

    if (siteError) {
      return NextResponse.json({ error: "Failed to create site: " + siteError.message }, { status: 500 });
    }

    site = newSite;
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
}
