import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { runWorkerCycle } from "@/lib/backlink-engine";

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await runWorkerCycle(user.id);

    if (!result) {
      return NextResponse.json({
        success: true,
        message: "No pending tasks",
        processed: false,
      });
    }

    return NextResponse.json({
      success: result.success,
      task_id: result.task_id,
      status: result.status,
      error_message: result.error_message,
      requires_manual_review: result.requires_manual_review,
      backlink_url: result.backlink_url,
      processed: true,
    });
  } catch (error) {
    console.error("Worker error:", error);
    return NextResponse.json(
      { error: "Worker processing failed" },
      { status: 500 }
    );
  }
}
