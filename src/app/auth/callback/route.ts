import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error("Max retries exceeded");
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await retryWithBackoff(() =>
        supabase.auth.exchangeCodeForSession(code)
      );

      if (!error) {
        const {
          data: { user },
        } = await retryWithBackoff(() => supabase.auth.getUser());

        if (user) {
          const { data: site } = await retryWithBackoff(() =>
            supabase.from("sites").select("id").eq("user_id", user.id).single()
          );

          if (site) {
            return NextResponse.redirect(`${origin}/dashboard`);
          } else {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
        }
      }
    } catch (error) {
      console.error("Auth callback error:", error);
      return NextResponse.redirect(`${origin}/login?error=connection`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}