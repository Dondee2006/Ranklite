import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { updateTaskStatus, logAction } from "@/lib/backlink-engine";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action, status, submission_data } = body;

    const { data: task } = await supabaseAdmin
      .from("backlink_tasks")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (action === "mark_completed") {
      await updateTaskStatus(id, "completed", {
        completed_at: new Date().toISOString(),
        requires_manual_review: false,
      });
      await logAction(user.id, "task_manually_completed", { task_id: id });
    } else if (action === "skip") {
      await updateTaskStatus(id, "blocked", {
        requires_manual_review: false,
        manual_review_reason: "Skipped by user",
      });
      await logAction(user.id, "task_skipped", { task_id: id });
    } else if (action === "retry") {
      await updateTaskStatus(id, "pending", {
        attempt_count: 0,
        scheduled_for: new Date().toISOString(),
        requires_manual_review: false,
      });
      await logAction(user.id, "task_retry_requested", { task_id: id });
    } else if (status) {
      await updateTaskStatus(id, status, submission_data ? { submission_data } : undefined);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await supabaseAdmin
      .from("backlink_tasks")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
