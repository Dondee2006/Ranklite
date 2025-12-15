"use client";

import { SEOCycleVisual } from "@/components/dashboard/seo-cycle-visual";

export default function SEOCyclePage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">SEO Cycle</h1>
        </div>
      </header>

      <div className="p-8">
        <SEOCycleVisual />
      </div>
    </div>
  );
}