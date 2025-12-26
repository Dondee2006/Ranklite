import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { TieredDistributionEngine } from "@/lib/services/tiered-distribution";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { articleId } = body;

  if (!articleId) {
    return NextResponse.json(
      { error: "Article ID is required" },
      { status: 400 }
    );
  }

  const { data: article } = await supabase
    .from("articles")
    .select("*, sites!inner(*)")
    .eq("id", articleId)
    .eq("sites.user_id", user.id)
    .single();

  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  if (!article.content) {
    return NextResponse.json(
      { error: "Article must be generated before content amplification can be enabled" },
      { status: 400 }
    );
  }

  const site = article.sites;
  const siteUrl = site.url?.startsWith("http") ? site.url : `https://${site.url}`;

  try {
    const result = await TieredDistributionEngine.distributeContentForArticle(
      articleId,
      user.id,
      siteUrl
    );

    return NextResponse.json({
      success: true,
      message: `Content amplification started. ${result.tier2Count} Tier 2 and ${result.tier3Count} Tier 3 content pieces created.`,
      tasksCreated: result.tasksCreated,
      tier2Count: result.tier2Count,
      tier3Count: result.tier3Count,
      article: {
        id: article.id,
        title: article.title,
        amplificationEnabled: true,
      },
    });
  } catch (error) {
    console.error("Content distribution error:", error);
    return NextResponse.json(
      { error: "Failed to start content amplification" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const articleId = searchParams.get("articleId");

  if (articleId) {
    const status = await TieredDistributionEngine.getArticleDistributionStatus(articleId);
    return NextResponse.json({ status });
  }

  const stats = await TieredDistributionEngine.getDistributionStats(user.id);
  return NextResponse.json({ stats });
}
