"use client";

import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";

function OnboardingContent() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkExistingCycle() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      try {
        const { data: cycles } = await supabase
          .from("seo_cycles")
          .select("id")
          .eq("user_id", user.id)
          .eq("status", "active")
          .limit(1);

        if (cycles && cycles.length > 0) {
          router.push("/dashboard/overview");
        }
      } catch (error) {
        console.error("Failed to check SEO cycle:", error);
      }
    }
    checkExistingCycle();
  }, [supabase, router]);

  return <OnboardingWizard />;
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 flex items-center justify-center bg-[#F8FAFC]"><div className="text-lg text-gray-600">Loading...</div></div>}>
      <OnboardingContent />
    </Suspense>
  );
}