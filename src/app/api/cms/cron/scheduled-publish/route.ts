import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createTasksForUser } from "@/lib/backlink-engine";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: articlesToPublish } = await supabase
      .from("articles")
      .select("*, sites(id, domain, name, user_id)")
      .eq("status", "generated")
      .eq("scheduled_date", today);

    if (!articlesToPublish || articlesToPublish.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No articles scheduled for publishing today",
        count: 0
      });
    }

    const publishResults = [];

    for (const article of articlesToPublish) {
      try {
        const { data: integrations } = await supabase
          .from("cms_integrations")
          .select("*")
          .eq("user_id", article.sites.user_id)
          .eq("status", "active");

        let published = false;

        if (integrations && integrations.length > 0) {
          for (const integration of integrations) {
            try {
              const publishResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cms/publish`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  articleId: article.id,
                  platform: integration.platform,
                  integrationId: integration.id,
                }),
              });

              if (publishResponse.ok) {
                published = true;
                break;
              }
            } catch (error) {
              console.error(`Failed to publish to ${integration.platform}:`, error);
            }
          }
        }

        if (published) {
          await supabase
            .from("articles")
            .update({
              status: "published",
              published_at: new Date().toISOString(),
            })
            .eq("id", article.id);

          publishResults.push({
            articleId: article.id,
            title: article.title,
            status: "published",
          });

          await createTasksForUser(
            article.sites.user_id,
            article.sites.domain || article.sites.url,
            article.sites.name,
            article.meta_description || article.title,
            article.id
          );
        } else {
          publishResults.push({
            articleId: article.id,
            title: article.title,
            status: "failed",
            error: "No connected CMS platforms",
          });
        }
      } catch (error) {
        console.error(`Error publishing article ${article.id}:`, error);
        publishResults.push({
          articleId: article.id,
          title: article.title,
          status: "error",
          error: String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${articlesToPublish.length} articles scheduled for today`,
      count: articlesToPublish.length,
      results: publishResults,
    });
  } catch (error) {
    console.error("Scheduled publish cron error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
}
