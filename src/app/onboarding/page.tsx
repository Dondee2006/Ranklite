"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";

function OnboardingContent() {
  const router = useRouter();
  const supabase = createClient();
  const searchParams = useSearchParams();
  const isAddingNewSite = searchParams.get("action") === "add";

  useEffect(() => {
    async function checkSite() {
      if (isAddingNewSite) {
        return;
      }

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
  }, [supabase, router, isAddingNewSite]);

  return <OnboardingWizard isAddingNewSite={isAddingNewSite} />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}