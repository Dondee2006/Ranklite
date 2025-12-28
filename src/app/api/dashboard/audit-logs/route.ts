import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // specific query for exchange logs
    const { data: logs, error } = await supabase
      .from("exchange_automation_logs")
      .select(`
        id,
        created_at,
        action,
        metadata:details,
        site_id
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    // Transform logs to match frontend interface
    const formattedLogs = logs.map(log => ({
      ...log,
      resource_type: "Automation System",
      resource_id: log.site_id || "N/A",
      user: {
        email: user.email,
        full_name: user.user_metadata?.full_name || user.email || "User"
      }
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json({ error: "Failed to load audit logs" }, { status: 500 });
  }
}
