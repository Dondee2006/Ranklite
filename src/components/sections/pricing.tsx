import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      subtitle: "Safe Growth",
      price: 49,
      period: "/month",
      description: "Best for new sites or small businesses starting SEO",
      features: [
        { text: "1 website", included: true },
        { text: "1 backlink per article", included: true },
        { text: "QA validation", included: false },
        { text: "1 integration", included: true },
      ],
      cta: "Select Plan",
      ctaLink: "/login",
    },
    {
      name: "Professional",
      subtitle: "Balanced Growth",
      price: 99,
      period: "/month",
      description: "Designed for consistent rankings and steady traffic",
      features: [
        { text: "Up to 3 websites", included: true },
        { text: "2-3 backlinks per article", included: true },
        { text: "QA validation", included: true },
        { text: "5 integrations", included: true },
      ],
      cta: "Select Plan",
      ctaLink: "/login",
      popular: true,
    },
    {
      name: "Enterprise",
      subtitle: "Authority Growth",
      price: 199,
      period: "/month",
      description: "Built for established brands that want to move faster",
      features: [
        { text: "Up to 10 websites", included: true },
        { text: "Up to 5 backlinks per article", included: true },
        { text: "QA validation", included: true },
        { text: "Unlimited integrations", included: true },
      ],
      cta: "Select Plan",
      ctaLink: "/login",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-[#F8FAFB] py-20 lg:py-32" id="pricing">
      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-[800px] text-center lg:mb-20">
          <h2 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-[#6B47DC] sm:text-[48px] lg:text-[56px]">
            Choose Your Plan
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[18px] leading-relaxed text-[#4A5568] lg:text-[20px]">
            Select the perfect plan for your SEO needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-sm transition-all hover:shadow-xl"
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="font-display text-[28px] font-bold text-[#1A202C]">{plan.name}</h3>
                <p className="mt-1 text-[15px] text-[#718096]">{plan.subtitle}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-[56px] font-bold text-[#10B981]">${plan.price}</span>
                  <span className="text-[18px] text-[#718096]">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check className="h-5 w-5 text-[#10B981] flex-shrink-0 mt-0.5" />
                    ) : (
                      <X className="h-5 w-5 text-[#E53E3E] flex-shrink-0 mt-0.5" />
                    )}
                    <span className="text-[15px] text-[#4A5568]">{feature.text}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Link
                href={plan.ctaLink}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#10B981] py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:bg-[#059669] hover:shadow-xl"
              >
                {plan.cta}
              </Link>
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
              <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 p-6">
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

          {/* Built for Founders */}
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-10">
            <h3 className="mb-6 text-center font-display text-[28px] font-bold text-[#1A202C]">
              ⚡ Built for Founders, Not Agencies
            </h3>
            <div className="grid gap-4 sm:grid-cols-3 mb-6">
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center">
                <span className="text-[16px] font-semibold text-[#1A202C]">Set it once</span>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center">
                <span className="text-[16px] font-semibold text-[#1A202C]">Let it run</span>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-5 text-center">
                <span className="text-[16px] font-semibold text-[#1A202C]">Track results</span>
              </div>
            </div>
            <p className="text-center text-[15px] text-[#718096]">
              Perfect for startups, SaaS, local businesses, and creators who want SEO without babysitting tools.
            </p>
          </div>
        </div>

        {/* MVP Note */}
        <div className="mx-auto mt-12 max-w-[600px] text-center">
          <p className="text-[13px] text-[#A0AEC0]">
            🧪 <strong>MVP Note:</strong> Billing is currently in demo mode while we onboard early users.
          </p>
        </div>
      </div>
    </section>
  );
}