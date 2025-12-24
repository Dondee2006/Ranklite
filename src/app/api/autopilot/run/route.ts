import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ArticleEngine } from "@/lib/services/article-engine";
import { CMSEngine } from "@/lib/services/cms-engine";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: site } = await supabase
    .from("sites")
    .select("id, name, url")
    .eq("user_id", user.id)
    .single();

  if (!site) {
    return NextResponse.json({ error: "No site found" }, { status: 404 });
  }

  const { data: settings } = await supabase
    .from("autopilot_settings")
    .select("*")
    .eq("site_id", site.id)
    .single();

  if (!settings || !settings.enabled) {
    return NextResponse.json({ success: false, message: "Autopilot disabled" });
  }

  const now = new Date();
  const hourUtc = now.getUTCHours();
  const startHour = settings.publish_time_start ?? 7;
  const endHour = settings.publish_time_end ?? 9;

  // Basic window check
  const withinWindow = startHour <= endHour
    ? hourUtc >= startHour && hourUtc <= endHour
    : hourUtc >= startHour || hourUtc <= endHour;

  if (!withinWindow) {
    console.log(`[AUTOPILOT] Outside publish window (${hourUtc} UTC vs ${startHour}-${endHour} UTC)`);
    return NextResponse.json({ success: false, message: "Outside publish window" });
  }

  const today = now.toISOString().split("T")[0];

  // 1. Check if we already published enough today
  const { data: publishedToday } = await supabase
    .from("articles")
    .select("id")
    .eq("site_id", site.id)
    .eq("scheduled_date", today)
    .eq("status", "published");

  const alreadyPublished = publishedToday?.length || 0;
  const targetCount = Math.max(settings.articles_per_day || 1, 1);

  if (alreadyPublished >= targetCount) {
    return NextResponse.json({ success: true, message: "Already published for today" });
  }

  const remainingNeeded = targetCount - alreadyPublished;

  // 2. Find or create candidates for today
  let { data: candidates } = await supabase
    .from("articles")
    .select("*")
    .eq("site_id", site.id)
    .eq("scheduled_date", today)
    .in("status", ["planned", "generated", "draft"])
    .order('created_at', { ascending: true })
    .limit(remainingNeeded);

  const foundCount = candidates?.length || 0;

  if (foundCount < remainingNeeded) {
    // Generate simple seed entries if not enough planned topics exist
    const seedsToCreate = remainingNeeded - foundCount;
    for (let i = 0; i < seedsToCreate; i++) {
      const articleType = pickArticleType(settings.preferred_article_types);
      const keyword = `${site.name} ${articleType} guide ${Math.floor(Math.random() * 1000)}`;
      const title = `The Ultimate Guide to ${keyword}`;

      const { data: inserted } = await supabaseAdmin
        .from("articles")
        .insert({
          site_id: site.id,
          title,
          slug: title.toLowerCase().replace(/ /g, '-'),
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
    return NextResponse.json({ success: false, message: "No candidates to process" });
  }

  const results = [];

  // 3. Process candidates (real Gen -> Publish flow)
  for (const article of candidates) {
    try {
      console.log(`[AUTOPILOT] Processing article: ${article.title}`);

      let currentArticle = article;

      // Step A: Generate content if missing
      if (currentArticle.status === "planned" || !currentArticle.content) {
        console.log(`[AUTOPILOT] Generating content for ${article.id}...`);
        const { data: existingArticles } = await supabase
          .from("articles")
          .select("id, title, slug, keyword")
          .eq("site_id", site.id)
          .neq("id", article.id)
          .not("content", "is", null)
          .limit(5);

        const { data: artSettings } = await supabase
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

      // Step B: Publish to CMS
      console.log(`[AUTOPILOT] Publishing article ${currentArticle.id} to CMS...`);
      const publishResult = await CMSEngine.publishArticleToCMS(user.id, currentArticle);

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

        results.push({ id: article.id, status: 'published', url: publishResult.publishedUrl });
      } else {
        results.push({ id: article.id, status: 'failed_publish', error: publishResult.error });
      }

    } catch (err: any) {
      console.error(`[AUTOPILOT] Error processing ${article.id}:`, err);
      results.push({ id: article.id, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({
    success: true,
    processed: results.length,
    results
  });
}

function pickArticleType(preferred: string[] | null | undefined) {
  if (preferred && preferred.length) {
    return preferred[Math.floor(Math.random() * preferred.length)];
  }
  const types = ["guide", "how-to", "listicle", "review", "comparison"];
  return types[Math.floor(Math.random() * types.length)];
}
