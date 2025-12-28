import { supabaseAdmin } from "./supabase/admin";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "dondorian7@gmail.com").split(",");

export async function isUserAuthorized(userId: string) {
    // 1. Check if user is Admin/Owner
    const { data: { user } } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (user && ADMIN_EMAILS.includes(user.email || "")) {
        return true;
    }

    // 2. Check if user has an active plan
    const { data: userPlan } = await supabaseAdmin
        .from("user_plans")
        .select("status, current_period_end")
        .eq("user_id", userId)
        .single();

    if (!userPlan) return false;

    // Check if active and not expired
    const isActive = userPlan.status === "active";
    const isNotExpired = new Date(userPlan.current_period_end) > new Date();

    return isActive && isNotExpired;
}
