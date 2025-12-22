import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { month, year } = body;

    // Try to get existing site
    let { data: site, error: siteQueryError } = await supabase
      .from("sites")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    // Auto-create a site if the user doesn't have one
    if (!site) {
      console.log("No site found, creating one for user:", user.id);
      const { data: newSite, error: siteError } = await supabase
        .from("sites")
        .insert({
          user_id: user.id,
          name: "My Website",
          url: "https://example.com",
        })
        .select("id")
        .single();

      if (siteError) {
        console.error("Failed to create site:", siteError);
        return NextResponse.json({ error: "Failed to create site: " + siteError.message }, { status: 500 });
      }

      site = newSite;
      console.log("Created new site:", site);
    }

    if (!site || !site.id) {
      console.error("Site is null or missing id:", site);
      return NextResponse.json({ error: "Failed to get or create site" }, { status: 500 });
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
      console.error("Failed to create job:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Trigger background processing
    const processUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/content-calendar/generate-bulk/process`;
    console.log("Triggering background process:", processUrl);

    fetch(processUrl, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.CRON_SECRET}`
      },
      body: JSON.stringify({ jobId: job.id, month, year }),
    }).catch(err => console.error("Background process error:", err));

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (error) {
    console.error("Bulk generation start error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
