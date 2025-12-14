"use client";

export default function FeatureFlagsPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Feature Flags</h1>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm p-6">
          <p className="text-sm text-[#6B7280]">No feature flags configured yet</p>
        </div>
      </div>
    </div>
  );
}
