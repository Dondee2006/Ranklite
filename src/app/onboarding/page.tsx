"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkSite() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: sites } = await supabase
          .from("sites")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (sites && sites.length > 0) {
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Failed to check site:", error);
      }
    }
    checkSite();
  }, [supabase, router]);

  return <OnboardingWizard />;
}
