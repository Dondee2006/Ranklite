"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2, ArrowRight } from "lucide-react";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    if (sessionId) {
      setTimeout(() => setStatus("success"), 1500);
    } else {
      setStatus("error");
    }
  }, [sessionId]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAFFFE] to-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-[#22C55E]" />
          <p className="mt-4 text-lg text-muted-foreground">Confirming your subscription...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAFFFE] to-white">
        <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg">
          <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="mt-2 text-muted-foreground">Please contact support if you were charged.</p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-white"
          >
            Go Home
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#FAFFFE] to-white">
      <div className="mx-auto max-w-md rounded-2xl border bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#22C55E] to-[#16A34A]">
          <CheckCircle className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground">Welcome to Ranklite!</h1>
        <p className="mt-2 text-muted-foreground">
          Your Growth Plan subscription is now active. Start creating SEO-optimized content today.
        </p>
        <Link
          href="/dashboard"
          className="group mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-8 py-3 text-white shadow-lg transition-all hover:shadow-xl"
        >
          Go to Dashboard
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
