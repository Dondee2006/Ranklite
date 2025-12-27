import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEFAULT_FLAGS = [
  {
    key: "ai_content_suggestions",
    name: "AI Content Suggestions",
    description: "Get smart suggestions for keywords and topics based on your niche.",
  },
  {
    key: "advanced_seo_analytics",
    name: "Advanced SEO Analytics",
    description: "Access deeper insights into your SERP performance and competitor gaps.",
  },
  {
    key: "auto_publish_cms",
    name: "Auto-Publish to CMS",
    description: "Automatically push generated content to your connected CMS (WordPress, Webflow, etc.).",
  },
  {
    key: "beta_backlink_engine",
    name: "Beta Backlink Engine",
    description: "Test our next-generation backlink discovery and verification algorithm.",
  },
];

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: dbFlags } = await supabase
    .from("feature_flags")
    .select("*")
    .eq("user_id", user.id);

  const flagsMap = new Map(dbFlags?.map((f) => [f.key, f]) || []);

  const mergedFlags = DEFAULT_FLAGS.map((df) => ({
    ...df,
    is_enabled: flagsMap.get(df.key)?.is_enabled || false,
  }));

  return NextResponse.json({ flags: mergedFlags });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key, is_enabled } = await request.json();

  const { error } = await supabase
    .from("feature_flags")
    .upsert(
      {
        user_id: user.id,
        key,
        is_enabled,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,key" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
