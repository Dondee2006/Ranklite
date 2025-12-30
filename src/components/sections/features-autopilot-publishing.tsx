import Link from "next/link";
import { ArrowRight } from "lucide-react";

// Inline SVG Logo Components - 100% reliable, no external dependencies
const WordPressLogo = () => (
  <svg viewBox="0 0 120 120" className="h-12 w-12">
    <circle cx="60" cy="60" r="58" fill="#21759B" stroke="#21759B" strokeWidth="4" />
    <circle cx="60" cy="60" r="50" fill="#21759B" />
    <text x="60" y="85" fontSize="70" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Georgia, serif">W</text>
  </svg>
);

const ShopifyLogo = () => (
  <svg viewBox="0 0 108.87 123.52" className="h-12 w-12">
    <path d="M96.15 23.03c-.08-.58-.53-.87-.88-.9-.35-.02-7.67-.55-7.67-.55s-5.43-5.28-5.98-5.82c-.55-.55-1.63-.38-2.05-.26-.07.02-1.11.34-2.88.88-1.74-5.03-4.81-9.67-10.23-9.67h-.44c-1.47-1.96-3.28-2.85-4.81-2.85-12.44 0-18.38 15.55-20.27 23.46-4.88 1.51-8.33 2.58-8.75 2.71-2.73.85-2.82.93-3.17 3.48-.27 1.94-7.47 57.59-7.47 57.59L75.09 123.52l32.78-7.26S96.23 23.61 96.15 23.03z" fill="#95BF47" />
    <path d="M95.27 22.13c-.35-.02-7.67-.55-7.67-.55s-5.43-5.28-5.98-5.82c-.21-.21-.48-.32-.76-.37l-5.77 107.13 32.78-7.26S96.23 23.61 96.15 23.03c-.08-.58-.53-.87-.88-.9z" fill="#5E8E3E" />
    <path d="M61.99 38.78l-3.66 13.73s-4.08-1.85-8.98-1.53c-7.14.47-7.2 4.94-7.14 6.08.35 5.97 16.45 7.26 17.34 21.22.7 10.97-5.82 18.49-15.19 19.06-11.26.68-17.48-5.93-17.48-5.93l2.39-10.16s6.25 4.73 11.26 4.41c3.28-.21 4.48-2.88 4.36-4.78-.52-7.82-13.58-7.36-14.42-20.04-.71-10.65 6.33-21.48 21.79-22.42 5.97-.36 8.98.87 8.98.87l.75-1.51z" fill="#fff" />
  </svg>
);

const FramerLogo = () => (
  <svg viewBox="0 0 24 24" className="h-12 w-12">
    <path d="M4 0h16v8h-8zM4 8h8l8 8H4zM4 16h8v8z" fill="#0055FF" />
  </svg>
);

const NotionLogo = () => (
  <svg viewBox="0 0 100 100" className="h-12 w-12">
    <path d="M6.017 4.313l55.333-4.087c6.797-.583 8.543-.19 12.817 2.917l17.663 12.443c2.913 2.14 3.883 2.723 3.883 5.053v68.243c0 4.277-1.553 6.807-6.99 7.193L24.467 99.967c-4.08.193-6.023-.39-8.16-3.113L3.3 79.94c-2.333-3.113-3.3-5.443-3.3-8.167V11.113c0-3.497 1.553-6.413 6.017-6.8z" fill="#fff" />
    <path fillRule="evenodd" clipRule="evenodd" d="M61.35.227l-55.333 4.087C1.553 4.7 0 7.617 0 11.113v60.66c0 2.723.967 5.053 3.3 8.167l13.007 16.913c2.137 2.723 4.08 3.307 8.16 3.113l64.257-3.89c5.433-.387 6.99-2.917 6.99-7.193V20.64c0-2.21-.873-2.847-3.443-4.733L74.167 3.143c-4.273-3.107-6.02-3.5-12.817-2.917zM25.92 19.523c-5.247.353-6.437.433-9.417-1.99L8.927 11.507c-.77-.78-.383-1.753 1.557-1.947l53.193-3.887c4.467-.39 6.793 1.167 8.54 2.527l9.123 6.61c.39.197 1.36 1.36.193 1.36l-54.933 3.307-.68.047zM19.803 88.3V30.367c0-2.53.777-3.697 3.103-3.893L86 22.78c2.14-.193 3.107 1.167 3.107 3.693v57.547c0 2.53-.39 4.67-3.883 4.863l-60.377 3.5c-3.493.193-5.043-.97-5.043-4.083zm59.6-54.827c.387 1.75 0 3.5-1.75 3.7l-2.91.577v42.773c-2.527 1.36-4.853 2.137-6.797 2.137-3.107 0-3.883-.973-6.21-3.887l-19.03-29.94v28.967l6.02 1.363s0 3.5-4.857 3.5l-13.39.777c-.39-.78 0-2.723 1.357-3.11l3.497-.97v-38.3L30.48 40.667c-.39-1.75.58-4.277 3.3-4.473l14.367-.967 19.8 30.327v-26.83l-5.047-.58c-.39-2.143 1.163-3.7 3.103-3.89l13.4-.78z" fill="#000" />
  </svg>
);

const WebflowLogo = () => (
  <svg viewBox="0 0 120 120" className="h-12 w-12">
    <rect width="120" height="120" fill="white" rx="8" />
    <path d="M30 45 Q40 30 50 45 T70 45 Q80 30 90 45" fill="none" stroke="#4353FF" strokeWidth="8" strokeLinecap="round" />
    <text x="60" y="90" fontSize="32" fontWeight="bold" fill="#4353FF" textAnchor="middle" fontFamily="sans-serif">W</text>
  </svg>
);

const WixLogo = () => (
  <svg viewBox="0 0 120 120" className="h-12 w-12">
    <rect width="120" height="120" fill="white" rx="8" />
    <text x="60" y="75" fontSize="48" fontWeight="bold" fill="#0C6EFC" textAnchor="middle" fontFamily="sans-serif">WIX</text>
  </svg>
);

export default function FeaturesAutopilotPublishing() {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-[#F9FAFB]" id="autopilot">
      <div className="container mx-auto max-w-[1200px] px-6">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A] mb-4">
            CMS Integrations
          </span>
          <h2 className="font-display text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-5xl mb-4">
            Publish to{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              any platform
            </span>
            , automatically
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect once and let Ranklite handle the rest. Your content goes live automatically across all your platforms.
          </p>
        </div>

        {/* Logo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <WordPressLogo />
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <ShopifyLogo />
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <FramerLogo />
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <NotionLogo />
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <WebflowLogo />
          </div>
          <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <WixLogo />
          </div>
        </div>

        {/* Features Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/10 flex-shrink-0">
              <svg className="h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">One-Click Setup</h3>
              <p className="text-sm text-muted-foreground">Connect your CMS in seconds with our simple integration flow</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/10 flex-shrink-0">
              <svg className="h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Auto-Publish</h3>
              <p className="text-sm text-muted-foreground">Articles go live automatically at optimal times for engagement</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 bg-white rounded-xl border border-gray-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#22C55E]/10 flex-shrink-0">
              <svg className="h-6 w-6 text-[#22C55E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Smart Scheduling</h3>
              <p className="text-sm text-muted-foreground">AI-powered timing ensures maximum visibility and reach</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Plus hundreds more via{" "}
            <Link href="/integrations" className="text-[#22C55E] font-semibold hover:text-[#16A34A] transition-colors">
              Zapier & Webhooks
            </Link>
          </p>
          <a
            href="https://whop.com/checkout/plan_hwMsQBSgnZtPO"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 hover:scale-105"
          >
            <span>Connect Your Site</span>
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
