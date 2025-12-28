import { Check, X, ArrowRight } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Pro Tier",
      subtitle: "Perfect for: Small businesses, founders, and content-driven sites that want full SEO automation",
      price: 59,
      period: "/month",
      description: "Ranklite gives you all core features Outrank offers — but at ~$40/month less.",
      features: [
        { text: "30 SEO articles generated on autopilot per month", included: true },
        { text: "AI-generated images included per article", included: true },
        { text: "Automatic publishing to multiple CMS (WordPress, Wix, Webflow)", included: true },
        { text: "Full keyword research & optimization for Google ranking", included: true },
        { text: "Performance dashboard (traffic, rankings, publishing status)", included: true },
        { text: "High-quality backlink starter pack", included: true },
        { text: "Optional light human QA for higher-ranking content", included: true },
        { text: "3-day free trial ($1 activation fee)", included: true },
      ],
      cta: "Start 3-Day Free Trial",
      ctaLink: "/signup",
      popular: true,
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#F8FAFB] py-20 lg:py-32" id="pricing">
      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-[800px] text-center lg:mb-20">
          <h2 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-[#22C55E] sm:text-[48px] lg:text-[56px]">
            Choose Your Plan (Updated)
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[18px] leading-relaxed text-[#4A5568] lg:text-[20px]">
            Select the perfect plan for your SEO needs
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-[900px]">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-3xl border-2 border-[#22C55E] bg-white p-10 shadow-2xl"
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2">
                  <span className="inline-flex items-center rounded-full bg-[#22C55E] px-6 py-2 text-[14px] font-bold text-white shadow-lg">
                    MOST POPULAR
                  </span>
                </div>
              )}

              {/* Plan Header */}
              <div className="mb-8 text-center">
                <h3 className="font-display text-[36px] font-bold text-[#1A202C]">{plan.name}</h3>
                <p className="mt-3 text-[16px] leading-relaxed text-[#718096]">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-8 text-center">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="font-display text-[64px] font-bold text-[#22C55E]">${plan.price}</span>
                  <span className="text-[20px] text-[#718096]">{plan.period}</span>
                </div>
                <p className="mt-3 text-[15px] text-[#22C55E] font-semibold">
                  📈 {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-10 grid gap-4 sm:grid-cols-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-[#E53E3E] flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-[15px] text-[#4A5568] leading-relaxed">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <a
                href="https://whop.com/checkout/plan_hwMsQBSgnZtPO"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#22C55E] py-5 text-[18px] font-bold text-white shadow-lg transition-all hover:bg-[#16A34A] hover:shadow-xl"
              >
                {plan.cta}
                <ArrowRight className="h-5 w-5" />
              </a>
              <p className="mt-4 text-center text-[13px] text-[#718096]">
                * A one-time <strong>$1.00 USD</strong> activation fee applies to start the trial.
              </p>
            </div>
          ))}
        </div>

        {/* Additional Info Sections */}
        <div className="mx-auto mt-20 max-w-[1000px] space-y-16">
          {/* How Ranklite Is Different */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10">
            <h3 className="mb-6 text-center font-display text-[32px] font-bold text-[#1A202C]">
              🧠 How Ranklite Is Different
            </h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div>
                <h4 className="mb-4 text-[18px] font-bold text-[#1A202C]">Most SEO tools give you:</h4>
                <ul className="space-y-2">
                  <li className="text-[15px] text-[#718096]">• Data dashboards</li>
                  <li className="text-[15px] text-[#718096]">• To-do lists</li>
                  <li className="text-[15px] text-[#718096]">• Manual work</li>
                </ul>
              </div>
              <div className="rounded-2xl bg-[#22C55E]/10 p-6">
                <h4 className="mb-4 text-[18px] font-bold text-[#1A202C]">Ranklite does the work for you.</h4>
                <div className="space-y-2 text-[15px] text-[#4A5568] leading-relaxed">
                  <p>We automatically control publishing, link building, and SEO pacing behind the scenes — so Google sees natural growth, not automation.</p>
                  <p className="font-semibold">You never touch settings. You never guess. You just grow.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SEO-Safe by Design */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10">
            <h3 className="mb-6 text-center font-display text-[28px] font-bold text-[#1A202C]">
              🔒 SEO-Safe by Design
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 p-4">
                <X className="h-5 w-5 text-red-500" />
                <span className="text-[15px] font-medium">No link blasts</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 p-4">
                <X className="h-5 w-5 text-red-500" />
                <span className="text-[15px] font-medium">No content flooding</span>
              </div>
              <div className="flex items-center justify-center gap-2 rounded-xl bg-gray-50 p-4">
                <X className="h-5 w-5 text-red-500" />
                <span className="text-[15px] font-medium">No spam tactics</span>
              </div>
            </div>
            <p className="text-center text-[15px] text-[#718096]">
              Ranklite adapts in real time to keep your site safe — even as it scales.
            </p>
          </div>
        </div>

        {/* MVP Note */}
        <div className="mx-auto mt-12 max-w-[600px] text-center">
          <p className="text-[13px] text-[#A0AEC0]">
            🧪 <strong>MVP Note:</strong> Billing is integrated safe and secure via Whop.
          </p>
        </div>
      </div>
    </section>
  );
}