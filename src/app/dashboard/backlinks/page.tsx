"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function BacklinksPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/authority-exchange");
  }, [router]);

  return (
    <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#10B981]" />
        </div>
        <p className="text-[#6B7280] font-medium">Redirecting to Authority Exchange...</p>
      </div>
    </div>
  );
}
