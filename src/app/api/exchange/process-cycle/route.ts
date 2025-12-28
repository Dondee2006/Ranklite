import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { LinkInventoryPool } from "@/lib/services/exchange/inventory-pool";
import { BacklinkExchangeModule } from "@/lib/modules/backlink-exchange";

export async function POST(request: Request) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !process.env.NEXT_PUBLIC_IS_DEV) {
        const supabase = await import("@/lib/supabase/server").then(m => m.createClient());
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const results = {
        verified: 0,
        link_status_updates: 0,
        errors: [] as string[]
    };

    try {
        // 1. Verify Pending Inventory
        const { data: pendingInventory } = await supabaseAdmin
            .from("link_inventory")
            .select("id")
            .eq("verification_status", "pending")
            .limit(50);

        if (pendingInventory) {
            for (const item of pendingInventory) {
                try {
                    const isLive = await LinkInventoryPool.verifyIndexation(item.id);
                    if (isLive) results.verified++;
                } catch (err) {
                    results.errors.push(`Detailed verification failed for ${item.id}`);
                }
            }
        }

        // 2. Process Link Verification (Exchange Links)
        // Check "pending" links in exchange_link_graph to see if they are live
        const { data: pendingLinks } = await supabaseAdmin
            .from("exchange_link_graph")
            .select("id")
            .eq("credits_status", "pending")
            .limit(50);

        if (pendingLinks) {
            for (const link of pendingLinks) {
                await BacklinkExchangeModule.processLinkVerification(link.id);
                results.link_status_updates++;
            }
        }

        return NextResponse.json({ success: true, results });

    } catch (error: any) {
        console.error("Exchange Cycle Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    return POST(request);
}
