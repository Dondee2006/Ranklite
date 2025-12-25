
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createTasksForUser } from "@/lib/backlink-engine/task-queue";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 });
        }

        // Trigger task creation manually
        // We use dummy data for the site since this is a debug trigger
        const siteUrl = "https://example.com";
        const siteName = "Debug Site";

        // Check if user already has tasks to avoid duplicates? 
        // createTasksForUser usually handles some logic, but let's just run it.

        const result = await createTasksForUser(
            user.id,
            siteUrl,
            siteName,
            "Debug Description for Manual Trigger"
        );

        return NextResponse.json({
            message: "Manual trigger executed",
            user_id: user.id,
            result: result
        });

    } catch (error: any) {
        return NextResponse.json({
            error: "Trigger failed",
            details: error.message
        }, { status: 500 });
    }
}
