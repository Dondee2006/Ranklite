import { supabaseAdmin } from "@/lib/supabase/admin";
import { SmartLinkRouter } from "./smart-router";
import { LinkInjector } from "./link-injector";
import { CreditSystem } from "./credit-system";

export interface AutomationResult {
    success: boolean;
    linkId?: string;
    injectedContent?: string;
    error?: string;
}

export class ExchangeAutomationWorker {
    /**
     * Main entry point for automated link placement during article generation
     */
    static async processArticleForExchange(params: {
        userId: string;
        content: string;
        niche: string;
        contentType: "html" | "markdown";
        siteId?: string;
    }): Promise<AutomationResult> {
        const { userId, content, niche, contentType, siteId } = params;

        try {
            // 1. Check if user has opted in and has enough credits
            const settings = await SmartLinkRouter.getUserSettings(userId);
            if (!settings.auto_exchange_enabled) {
                return { success: false, error: "Auto-exchange not enabled for user" };
            }

            const balance = await CreditSystem.getBalance(userId);
            if (balance.balance < 5) { // Minimum threshold for automated placement
                return { success: false, error: "Insufficient credits for automated exchange" };
            }

            // 2. Find a suitable target from the network (someone else's money site or article)
            // For automation, we query for high-quality targets that match the niche
            const routes = await SmartLinkRouter.findMatchingRoutes(userId, "", {
                niche: niche,
                minDomainRating: settings.min_incoming_dr || 20,
                tier: 1, // Prioritize Tier 1 (Money Sites) for receiving links
                limit: 5,
            });

            if (routes.length === 0) {
                // Fallback to Tier 2 if no Tier 1 targets available for this niche
                const fallbackRoutes = await SmartLinkRouter.findMatchingRoutes(userId, "", {
                    niche: niche,
                    tier: 2,
                    limit: 5,
                });
                if (fallbackRoutes.length === 0) {
                    return { success: false, error: "No suitable network targets found for this niche" };
                }
                routes.push(...fallbackRoutes);
            }

            // 3. Select the best route and prepare anchor
            const selectedRoute = routes[0];
            const anchorType = LinkInjector.getAnchorType({
                branded: settings.anchor_branded_ratio || 0.4,
                naked: settings.anchor_naked_ratio || 0.3,
                keyword: settings.anchor_keyword_ratio || 0.15,
                generic: settings.anchor_generic_ratio || 0.15,
            });

            const anchorText = await LinkInjector.suggestAnchorText(
                selectedRoute.pageUrl,
                anchorType,
                niche
            );

            // 4. Inject the link into the content
            const injectionResult = await LinkInjector.injectLink({
                content,
                targetUrl: selectedRoute.pageUrl,
                anchorText,
                anchorType,
                niche,
                contentType,
            });

            if (!injectionResult.success) {
                return { success: false, error: "Link injection failed to find a natural spot" };
            }

            // 5. Execute the exchange (Deduct credits, create record, etc.)
            const exchangeResult = await SmartLinkRouter.executeExchange(
                userId,
                selectedRoute,
                selectedRoute.pageUrl,
                anchorText,
                anchorType
            );

            if (!exchangeResult.success) {
                return { success: false, error: exchangeResult.error };
            }

            // 6. Log the automation event
            await this.logAutomationEvent({
                userId,
                siteId,
                action: "link_injected",
                details: {
                    targetDomain: selectedRoute.domain,
                    anchorText,
                    anchorType,
                    creditsSpent: selectedRoute.creditsRequired,
                }
            });

            return {
                success: true,
                linkId: exchangeResult.linkId,
                injectedContent: injectionResult.content,
            };

        } catch (error) {
            console.error("Exchange automation worker error:", error);
            return { success: false, error: "Internal automation error" };
        }
    }

    private static async logAutomationEvent(event: {
        userId: string;
        siteId?: string;
        action: string;
        details: any;
    }) {
        await supabaseAdmin.from("exchange_automation_logs").insert({
            user_id: event.userId,
            site_id: event.siteId,
            action: event.action,
            details: event.details,
            created_at: new Date().toISOString(),
        });
    }
}
