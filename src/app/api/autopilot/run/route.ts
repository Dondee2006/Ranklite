import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ArticleEngine } from "@/lib/services/article-engine";
import { CMSEngine } from "@/lib/services/cms-engine";
import { getUserPlanAndUsage } from "@/lib/usage-limits";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;
  
  let user: any = null;
  let targetSites: any[] = [];

  if (!isCron) {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    user = authUser;

    const { data: site } = await supabase
      .from("sites")
      .select("id, name, url, user_id")
      .eq("user_id", user.id)
      .single();

    if (!site) {
      return NextResponse.json({ error: "No site found" }, { status: 404 });
    }
    targetSites = [site];
  } else {
    // Cron mode: find all sites with autopilot enabled
    const { data: activeSettings } = await supabaseAdmin
      .from("autopilot_settings")
      .select("site_id")
      .eq("enabled", true);

    if (!activeSettings || activeSettings.length === 0) {
      return NextResponse.json({ success: true, message: "No active autopilot settings found" });
    }

    const { data: sites } = await supabaseAdmin
      .from("sites")
      .select("id, name, url, user_id")
      .in("id", activeSettings.map(s => s.site_id));

    if (!sites || sites.length === 0) {
      return NextResponse.json({ success: true, message: "No sites found for active settings" });
    }
    targetSites = sites;
  }

  const overallResults = [];

  for (const site of targetSites) {
    try {
      const siteResult = await processSiteAutopilot(site);
      overallResults.push({ siteId: site.id, ...siteResult });
    } catch (err: any) {
      console.error(`[AUTOPILOT] Error for site ${site.id}:`, err);
      overallResults.push({ siteId: site.id, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    processedSites: overallResults.length,
    results: overallResults
  });
}

async function processSiteAutopilot(site: any) {
  const { data: settings } = await supabaseAdmin
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  if (!settings || !settings.enabled) {
    return { success: false, message: "Autopilot disabled" };
  }

  const now = new Date();
  const hourUtc = now.getUTCHours();
  const startHour = settings.publish_time_start ?? 7;
  const endHour = settings.publish_time_end ?? 9;

  const withinWindow = startHour <= endHour
    ? hourUtc >= startHour && hourUtc <= endHour
    : hourUtc >= startHour || hourUtc <= endHour;

  if (!withinWindow) {
    return { success: false, message: `Outside window (${hourUtc} UTC vs ${startHour}-${endHour} UTC)` };
  }

  // Check plan limits
  const { plan, usage, status: planStatus } = await getUserPlanAndUsage(site.user_id);
  if (!plan || planStatus !== "active") {
    return { success: false, message: "No active plan" };
  }

  const postsRemaining = plan.posts_per_month - (usage?.posts_generated || 0);
  if (postsRemaining <= 0) {
    return { success: false, message: "Post limit reached" };
  }

  const today = now.toISOString().split("T")[0];
  const currentTimeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

  // 1. First, find all articles manually scheduled for today that aren't published yet
  let { data: candidates } = await supabaseAdmin
    .from("articles")
    .select("*")
    .eq("site_id", site.id)
    .eq("scheduled_date", today)
    .in("status", ["planned", "generated", "draft"])
    .or(`scheduled_time.is.null,scheduled_time.lte.${currentTimeStr}`)
    .order('scheduled_time', { ascending: true, nullsFirst: true });

  // 2. If we don't have enough articles for today's quota, and we have remaining posts in plan, create seeds
  // Note: Only create seeds if we are within the autopilot window
  const alreadyPublished = publishedToday?.length || 0;
  const targetCount = Math.max(settings.articles_per_day || 1, 1);
  const currentCount = (candidates?.length || 0) + alreadyPublished;
  
  if (withinWindow && currentCount < targetCount && postsRemaining > (candidates?.length || 0)) {
    const seedsToCreate = Math.min(targetCount - currentCount, postsRemaining - (candidates?.length || 0));
    for (let i = 0; i < seedsToCreate; i++) {
      const articleType = pickArticleType(settings.preferred_article_types);
      const keyword = `${site.name} ${articleType} guide ${Math.floor(Math.random() * 1000)}`;
      const title = `The Ultimate Guide to ${keyword}`;

      const { data: inserted } = await supabaseAdmin
        .from("articles")
        .insert({
          site_id: site.id,
          user_id: site.user_id,
          title,
          slug: title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]/g, ''),
          keyword,
          article_type: articleType,
          status: "planned",
          scheduled_date: today,
          volume: 500,
          difficulty: 20
        })
        .select()
        .single();

      if (inserted) {
        if (!candidates) candidates = [];
        candidates.push(inserted);
      }
    }
  }

  if (!candidates || candidates.length === 0) {
    return { success: false, message: "No candidates" };
  }

  const results = [];
  for (const article of candidates) {
    try {
      let currentArticle = article;
      if (currentArticle.status === "planned" || !currentArticle.content) {
        const { data: existingArticles } = await supabaseAdmin
          .from("articles")
          .select("id, title, slug, keyword")
          .eq("site_id", site.id)
          .neq("id", article.id)
          .not("content", "is", null)
          .limit(5);

        const { data: artSettings } = await supabaseAdmin
          .from("article_settings")
          .select("*")
          .eq("site_id", site.id)
          .single();

        const genResult = await ArticleEngine.generateCompleteArticle({
          site,
          settings: artSettings,
          article: currentArticle,
          existingArticles: existingArticles || []
        });

        const { data: updated, error: updateError } = await supabaseAdmin
          .from("articles")
          .update({
            content: genResult.content,
            html_content: genResult.htmlContent,
            markdown_content: genResult.markdownContent,
            meta_description: genResult.metaDescription,
            slug: genResult.slug,
            outline: genResult.outline,
            internal_links: genResult.internalLinks,
            external_links: genResult.externalLinks,
            images: genResult.images,
            featured_image: (genResult.images as any[])[0]?.url || null,
            cms_exports: genResult.cmsExports,
            word_count: genResult.wordCount,
            status: "generated",
            updated_at: new Date().toISOString()
          })
          .eq("id", article.id)
          .select()
          .single();

        if (updateError) throw updateError;
        currentArticle = updated;
      }

      const publishResult = await CMSEngine.publishArticleToCMS(site.user_id, currentArticle);

      if (publishResult.success) {
        await supabaseAdmin
          .from("articles")
          .update({
            status: "published",
            published_at: new Date().toISOString(),
            published_url: publishResult.publishedUrl,
            cms_post_id: publishResult.cmsPostId,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentArticle.id);
        results.push({ id: article.id, status: 'published' });
      } else {
        results.push({ id: article.id, status: 'failed_publish', error: publishResult.error });
      }
    } catch (err: any) {
      results.push({ id: article.id, status: 'error', error: err.message });
    }
  }

  return { success: true, processed: results.length, results };
}

function pickArticleType(preferred: string[] | null | undefined) {
  if (preferred && preferred.length) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }
  return ["guide", "how-to", "listicle", "review", "comparison"][Math.floor(Math.random() * 5)];
}

export async function GET(request: Request) {
  return POST(request);
}
