import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server component
          }
        },
      },
    }
  );
}

export const supabaseServer = {
  auth: {
    async getUser() {
      const supabase = await getSupabaseServer();
      return supabase.auth.getUser();
    },
  },
  from(table: string) {
    return {
      async select(columns: string = "*") {
        const supabase = await getSupabaseServer();
        return supabase.from(table).select(columns);
      },
    };
  },
};