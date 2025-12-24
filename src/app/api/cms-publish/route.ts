import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createTasksForUser } from "@/lib/backlink-engine";
import { appendFileSync } from "fs";
import { CMSEngine } from "@/lib/services/cms-engine";

export async function GET() {
    return NextResponse.json({ message: "CMS Publish API is active" });
}

export async function POST(request: NextRequest) {
    const log = (msg: string) => {
        console.log(`[PUBLISH DEBUG] ${msg}`);
        try {
            appendFileSync("publish-debug.log", `${new Date().toISOString()} - ${msg}\n`);
        } catch { }
    };

    log("Starting publish request at /api/cms-publish");
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            log("Error: Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { articleId, cmsTarget } = body;
        log(`Request: articleId=${articleId}, cmsTarget=${cmsTarget}, user=${user.id}`);

        if (!articleId || !cmsTarget) {
            log("Error: Missing fields");
            return NextResponse.json(
                { error: "Article ID and CMS Target are required" },
                { status: 400 }
            );
        }

        const { data: site } = await supabaseAdmin
            .from("sites")
            .select("id, url, name")
            .eq("user_id", user.id)
            .single();

        if (!site) {
            log("Error: No site found");
            return NextResponse.json({ error: "No site found" }, { status: 404 });
        }

        const { data: article } = await supabaseAdmin
            .from("articles")
            .select("*")
            .eq("id", articleId)
            .eq("site_id", site.id)
            .single();

        if (!article) {
            log("Error: Article not found");
            return NextResponse.json({ error: "Article not found" }, { status: 404 });
        }

        log(`Publishing article ${articleId} to ${cmsTarget} via CMSEngine...`);
        const publishResult = await CMSEngine.publishArticleToCMS(user.id, article, cmsTarget);

        if (!publishResult.success) {
            log(`Publish Error: ${publishResult.error}`);
            return NextResponse.json({ error: publishResult.error }, { status: 500 });
        }

        const now = new Date().toISOString();
        const currentExports = article.cms_exports || {};
        const newExports = {
            ...currentExports,
            [cmsTarget]: {
                published_url: publishResult.publishedUrl,
                cms_post_id: publishResult.cmsPostId,
                published_at: now
            }
        };

        const { error: updateError } = await supabaseAdmin
            .from("articles")
            .update({
                status: "published",
                published_at: now,
                updated_at: now,
                cms_exports: newExports
            })
            .eq("id", articleId);

        if (updateError) {
            log(`Database Update Error: ${updateError.message}`);
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        log(`Successfully published article ${articleId} to ${cmsTarget}`);

        // Trigger backlink tasks
        try {
            await createTasksForUser(
                user.id,
                site.url || "",
                site.name || "My Site",
                article.meta_description || article.title,
                articleId
            );
        } catch (backlinkError) {
            log(`Warning: Failed to create backlink tasks: ${String(backlinkError)}`);
        }

        return NextResponse.json({
            success: true,
            publishedUrl: publishResult.publishedUrl,
            cmsPostId: publishResult.cmsPostId,
            message: `Article published to ${cmsTarget} successfully`,
        });

    } catch (error: any) {
        log(`Global Error: ${error.message}`);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
