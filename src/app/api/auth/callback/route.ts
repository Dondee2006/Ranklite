import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/dashboard/overview";

    if (code) {
        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
            {
                cookies: {
                    get(name: string) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name: string, value: string, options: any) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name: string, options: any) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );
        const { error, data } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.user) {
            // Check if user has an active plan
            const { data: userPlan } = await supabase
                .from("user_plans")
                .select("status, current_period_end")
                .eq("user_id", data.user.id)
                .single();

            const hasActivePlan = userPlan &&
                userPlan.status === "active" &&
                new Date(userPlan.current_period_end) > new Date();

            // If no active plan, redirect to checkout
            if (!hasActivePlan) {
                return NextResponse.redirect("https://whop.com/checkout/plan_hwMsQBSgnZtPO");
            }

            return NextResponse.redirect(`${origin}${next}`);
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Could not authenticate user`);
}
