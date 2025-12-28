import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { BacklinkExchangeModule, InventoryPage } from "@/lib/modules/backlink-exchange";

export async function POST() {
    try {
        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get User's Site
        const { data: site } = await supabase
            .from("sites")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!site || !site.domain) {
            return NextResponse.json(
                { error: "No site configured with a domain" },
                { status: 400 }
            );
        }

        // 2. Get Published Articles
        const { data: articles } = await supabase
            .from("articles")
            .select("*")
            .eq("user_id", user.id)
            .eq("status", "published");

        if (!articles || articles.length === 0) {
            return NextResponse.json({ message: "No published articles to sync" });
        }

        // 3. Map to Inventory Pages
        const inventoryPages: InventoryPage[] = articles.map((article) => {
            // Ensure domain format (remove protocol if present in site.domain for clean concatenation, though typically site.domain is just domain.com)
            const cleanDomain = site.domain.replace(/^https?:\/\//, "").replace(/\/$/, "");
            const fullUrl = `https://${cleanDomain}/${article.slug}`;

            return {
                pageUrl: fullUrl,
                pageTitle: article.title,
                domain: cleanDomain,
                domainRating: site.domain_authority || 0, // Fallback to 0 if not set
                trafficEstimate: 0, // Placeholder
                niche: site.niche || "General",
                linkType: "dofollow",
                contentPlacement: "contextual",
                tier: 2, // Default tier
            };
        });

        // 4. Submit to Inventory
        // We use the module to ensure validation logic runs
        const result = await BacklinkExchangeModule.submitInventory(
            user.id,
            site.id,
            inventoryPages
        );

        return NextResponse.json({
            success: true,
            synced_count: result.submitted,
            rejected_count: result.rejected,
            errors: result.errors,
            message: `Synced ${result.submitted} articles to inventory`,
        });
    } catch (error) {
        console.error("Inventory sync error:", error);
        return NextResponse.json(
            { error: "Failed to sync inventory" },
            { status: 500 }
        );
    }
}
