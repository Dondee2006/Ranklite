"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function validatePayment() {
      try {
        const response = await fetch("/api/checkout/validate", {
          method: "POST",
        });

        if (!response.ok) {
          throw new Error("Failed to activate account. Please contact support.");
        }

        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    }

    validatePayment();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="h-12 w-12 text-green-500 animate-spin mb-4" />
        <h2 className="text-xl font-semibold">Activating your account...</h2>
        <p className="text-gray-500">Please don't close this window.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 max-w-md">
          {error}
        </div>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Activation Successful!</h1>
        <p className="text-gray-600 mb-8 leading-relaxed">
          Your Ranklite account is now active. You're ready to start generating
          high-quality backlinks and growing your organic traffic.
        </p>

        <Button
          onClick={() => router.push("/onboarding")}
          className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          <Rocket className="h-5 w-5" />
          Go to Onboarding
        </Button>
      </div>
    </div>
  );
}
