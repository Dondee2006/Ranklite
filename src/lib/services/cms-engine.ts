import { createCMSClient, CMSIntegration } from "@/lib/cms";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LinkInventoryPool } from "./exchange/inventory-pool";

export interface PublishResult {
    success: boolean;
    publishedUrl?: string;
    cmsPostId?: string;
    error?: string;
}

export class CMSEngine {
    static async findActiveIntegration(userId: string, platform?: string) {
        let query = supabaseAdmin
            .from("cms_integrations")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "active");

        if (platform) {
            query = query.eq("platform", platform);
        }

        const { data: integrations } = await query;
        return integrations?.[0] || null;
    }

    static async publishArticleToCMS(userId: string, article: any, platform?: string): Promise<PublishResult> {
        const integration = await this.findActiveIntegration(userId, platform);

        if (!integration) {
            return { success: false, error: "No active CMS integration found" };
        }

        try {
            // Map platform field to cms_type if needed (system uses both terms)
            const cmsIntegration: CMSIntegration = {
                id: integration.id,
                cms_type: integration.platform as any,
                access_token: integration.credentials?.access_token,
                site_url: integration.site_url,
                settings: integration.config || {},
            };

            const client = createCMSClient(cmsIntegration);

            const publishPayload = {
                title: article.title,
                slug: article.slug,
                content: article.html_content || article.content,
                meta_description: article.meta_description,
                featured_image: article.featured_image,
                category: article.category || "Blog",
                tags: article.tags || [],
                status: "draft" as const, // Autopilot usually publishes as draft for safety
            };

            const result = await (client as any).publishArticle(publishPayload);

            // AUTO-INVENTORY: Add the published article to the link exchange inventory automatically
            if (result.success && result.publishedUrl) {
                const domain = new URL(result.publishedUrl).hostname;
                await LinkInventoryPool.submitInventory(userId, article.site_id, [{
                    page_url: result.publishedUrl,
                    page_title: article.title,
                    domain: domain,
                    niche: article.category || "General",
                    content_placement: "contextual",
                    tier: 2, // Ranklite generated content is Tier 2 (Exchange Buffer)
                    link_type: "dofollow",
                }]);
            }

            return {
                success: true,
                publishedUrl: result.publishedUrl,
                cmsPostId: result.cmsPostId,
            };
        } catch (error: any) {
            console.error(`CMS Publish Error (${integration.platform}):`, error);
            return { success: false, error: error.message || "Failed to publish to CMS" };
        }
    }
}
