import { supabaseAdmin } from "@/lib/supabase/admin";
import { ArticleEngine } from "@/lib/services/article-engine";
import { CMSEngine } from "@/lib/services/cms-engine";
import { CMSEngine } from "@/lib/services/cms-engine";
import { SupabaseClient } from "@supabase/supabase-js";
import { ExchangeAutomationWorker } from "@/lib/services/exchange/automation-worker";

export class AutopilotEngine {
  /**
   * Runs the autopilot process for a specific site.
   * Can be triggered by a user (manual) or by a cron job (admin).
   */
  static async runForSite(siteId: string, options: { supabase?: SupabaseClient; force?: boolean } = {}) {
    const supabase = options.supabase || supabaseAdmin;
    const force = options.force || false;

    // 1. Fetch site and owner
    const { data: site, error: siteError } = await supabaseAdmin
      .from("sites")
      .select("id, name, url, user_id")
      .eq("id", siteId)
      .single();

    if (siteError || !site) {
      throw new Error(`Site ${siteId} not found: ${siteError?.message}`);
    }

    const userId = site.user_id;

    // 2. Fetch settings
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from("autopilot_settings")
      .select("*")
      .eq("site_id", site.id)
      .maybeSingle();

    let activeSettings = settings;

    // Create defaults if missing
    if (!settings) {
      console.log(`[AUTOPILOT] Creating default settings for site ${site.id}`);
      const { data: newSettings, error: insertError } = await supabaseAdmin
        .from("autopilot_settings")
        .insert({
          site_id: site.id,
          enabled: true,
          publish_time_start: 0,
          publish_time_end: 23,
          articles_per_day: 1
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(`Failed to initialize settings for ${siteId}: ${insertError.message}`);
      }
      activeSettings = newSettings;
    }

    if (!activeSettings.enabled && !force) {
      return { success: false, message: "Autopilot disabled for this site" };
    }

    // 3. Window Check
    const now = new Date();
    const hourUtc = now.getUTCHours();
    const startHour = activeSettings.publish_time_start ?? 0;
    const endHour = activeSettings.publish_time_end ?? 23;

    const withinWindow = startHour <= endHour
      ? hourUtc >= startHour && hourUtc <= endHour
      : hourUtc >= startHour || hourUtc <= endHour;

    if (!withinWindow && !force) {
      console.log(`[AUTOPILOT] Outside window for ${siteId} (${hourUtc} UTC vs ${startHour}-${endHour} UTC)`);
      return { success: true, message: "Outside publish window" };
    }

    const today = now.toISOString().split("T")[0];

    // 4. Check daily quota
    const { data: publishedToday } = await supabaseAdmin
      .from("articles")
      .select("id")
      .eq("site_id", site.id)
      .eq("scheduled_date", today)
      .eq("status", "published");

    const alreadyPublished = publishedToday?.length || 0;
    const targetCount = Math.max(activeSettings.articles_per_day || 1, 1);

    if (alreadyPublished >= targetCount && !force) {
      return { success: true, message: "Already published quota for today" };
    }

    const remainingNeeded = force ? 1 : targetCount - alreadyPublished;

    // 5. Find or create candidates
    let { data: candidates } = await supabaseAdmin
      .from("articles")
      .select("*")
      .eq("site_id", site.id)
      .eq("scheduled_date", today)
      .in("status", ["planned", "generated", "draft"])
      .order('created_at', { ascending: true })
      .limit(remainingNeeded);

    const foundCount = candidates?.length || 0;

    if (foundCount < remainingNeeded) {
      const seedsToCreate = remainingNeeded - foundCount;
      for (let i = 0; i < seedsToCreate; i++) {
        const articleType = this.pickArticleType(activeSettings.preferred_article_types);
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
      return { success: false, message: "No articles to process" };
    }

    const results = [];

    // 6. Process each candidate
    for (const article of candidates) {
      try {
        console.log(`[AUTOPILOT] Processing article for ${site.name}: ${article.title}`);
        let currentArticle = article;

        // Generation
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
            .maybeSingle();

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

          // --- AUTOMATION HOOK: Attempt Layer 1 Exchange Injection ---
          try {
            const exchangeRes = await ExchangeAutomationWorker.processArticleForExchange({
              userId: site.user_id,
              content: currentArticle.html_content || currentArticle.content,
              niche: "General", // TODO: Get from site settings
              contentType: "html",
              siteId: site.id
            });

            if (exchangeRes.success && exchangeRes.injectedContent) {
              console.log(`[Autopilot] Injected exchange link: ${exchangeRes.linkId}`);
              // Update article with injected content
              const { data: injectedArticle } = await supabaseAdmin
                .from("articles")
                .update({
                  html_content: exchangeRes.injectedContent,
                  updated_at: new Date().toISOString()
                })
                .eq("id", currentArticle.id)
                .select()
                .single();

              if (injectedArticle) currentArticle = injectedArticle;
            }
          } catch (exErr) {
            console.warn("[Autopilot] Exchange injection skipped:", exErr);
          }
          // -----------------------------------------------------------
        }

        // Publishing
        const publishResult = await CMSEngine.publishArticleToCMS(userId, currentArticle);

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

          results.push({ id: article.id, title: article.title, status: 'published', url: publishResult.publishedUrl });
        } else {
          results.push({ id: article.id, title: article.title, status: 'failed_publish', error: publishResult.error });
        }
      } catch (err: any) {
        console.error(`[AUTOPILOT] Error in article loop for ${article.id}:`, err);
        results.push({ id: article.id, title: article.title, status: 'error', error: err.message });
      }
    }

    return {
      success: true,
      processed: results.length,
      results
    };
  }

  private static pickArticleType(preferred: string[] | null | undefined) {
    if (preferred && preferred.length) {
      return preferred[Math.floor(Math.random() * preferred.length)];
    }
    const types = ["guide", "how-to", "listicle", "review", "comparison"];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * Runs autopilot for ALL enabled sites.
   */
  static async runForAllSites() {
    const { data: settings, error } = await supabaseAdmin
      .from("autopilot_settings")
      .select("site_id")
      .eq("enabled", true);

    if (error) {
      console.error(`[AUTOPILOT] Error fetching enabled sites:`, error);
      throw error;
    }

    const results = [];
    for (const s of settings) {
      try {
        const res = await this.runForSite(s.site_id);
        results.push({ site_id: s.site_id, ...res });
      } catch (err: any) {
        console.error(`[AUTOPILOT] Failed for site ${s.site_id}:`, err);
        results.push({ site_id: s.site_id, success: false, error: err.message });
      }
    }

    return results;
  }
}
