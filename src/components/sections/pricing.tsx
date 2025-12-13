import Link from "next/link";
import { Check, X, ArrowRight, Zap } from "lucide-react";

export default function Pricing() {
  const tiers = [
    {
      name: "Free Tier",
      price: "$0",
      period: "/mo",
      features: [
        { label: "AI-generated articles/month", value: "3" },
        { label: "Automatic publishing", value: "✅ 1 site" },
        { label: "Keyword research & SEO optimization", value: "✅ Limited" },
        { label: "Backlink starter pack", value: false },
        { label: "Performance dashboard", value: false },
        { label: "Human QA / content polishing", value: false },
        { label: "Article length", value: "600–800 words" },
        { label: "Multilingual support", value: false },
        { label: "Free trial", value: false },
      ],
    },
    {
      name: "Pro Tier",
      price: "$59",
      period: "/mo",
      isPopular: true,
      features: [
        { label: "AI-generated articles/month", value: "30" },
        { label: "Automatic publishing", value: "✅ Multiple CMS (WordPress, Wix, Webflow)" },
        { label: "Keyword research & SEO optimization", value: "✅ Full, advanced keyword optimization" },
        { label: "Backlink starter pack", value: "✅ High-quality automated backlinks" },
        { label: "Performance dashboard", value: "✅ Track rankings, traffic, published content" },
        { label: "Human QA / content polishing", value: "✅ Optional light editing for higher rankings" },
        { label: "Article length", value: "1,200–1,500 words" },
        { label: "Multilingual support", value: "✅ Optional for niche markets" },
        { label: "Free trial", value: "✅ 7-day free trial" },
      ],
    },
    {
      name: "Outrank.so",
      price: "$99",
      period: "/mo",
      features: [
        { label: "AI-generated articles/month", value: "30" },
        { label: "Automatic publishing", value: "✅ Multiple CMS" },
        { label: "Keyword research & SEO optimization", value: "✅ Full keyword optimization" },
        { label: "Backlink starter pack", value: "✅ Limited / lower-quality backlinks" },
        { label: "Performance dashboard", value: "✅ Dashboard (some limitations reported)" },
        { label: "Human QA / content polishing", value: "❌ Mostly AI only" },
        { label: "Article length", value: "1,200–1,500 words" },
        { label: "Multilingual support", value: "✅ Available" },
        { label: "Free trial", value: "❌  limited" },
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FAFFFE] to-white py-20 lg:py-32" id="pricing">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <img 
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/pexels-pixabay-270637-1765655773146.jpg?width=8000&height=8000&resize=contain"
          alt="SEO background"
          className="h-full w-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mx-auto mb-14 max-w-[700px] text-center lg:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
            <Zap className="h-3.5 w-3.5" />
            Pricing
          </span>
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
            Ranklite Pricing —{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#16A34A] bg-clip-text text-transparent">
              Free vs Pro
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[520px] text-[16px] leading-relaxed text-muted-foreground lg:text-[18px]">
            Automated Backlinks-Without Exchanges
          </p>
        </div>

        {/* Mobile: Card view */}
        <div className="mx-auto grid max-w-[1100px] gap-6 lg:hidden">
          {tiers.map((tier, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-lg ${
                tier.isPopular ? "border-[#22C55E] shadow-green-500/10" : "border-border"
              }`}
            >
              {tier.isPopular && (
                <div className="absolute right-4 top-4 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-3 py-1 text-[11px] font-semibold text-white">
                  BEST VALUE
                </div>
              )}
              <h3 className="font-display text-[20px] font-bold text-foreground">{tier.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-[40px] font-bold text-foreground">{tier.price}</span>
                <span className="text-[16px] text-muted-foreground">{tier.period}</span>
              </div>
              <ul className="mt-6 space-y-3">
                {tier.features.map((feature, i) => (
                  <li key={i} className="text-[14px]">
                    <div className="font-semibold text-foreground">{feature.label}</div>
                    <div className="mt-1 text-muted-foreground">
                      {feature.value === false ? (
                        <X className="inline h-4 w-4 text-red-500" />
                      ) : (
                        feature.value
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              {tier.isPopular && (
                <Link
                  href="/login"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] py-3 text-[14px] font-semibold text-white shadow-lg shadow-green-500/20"
                >
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Desktop: Table view */}
        <div className="mx-auto hidden max-w-[1100px] overflow-hidden rounded-3xl border border-border bg-white shadow-2xl shadow-black/[0.04] lg:block">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gradient-to-r from-[#FAFFFE] to-[#F0FDF4]">
                  <th className="py-6 pl-8 pr-4 text-left">
                    <span className="font-display text-[18px] font-bold text-foreground">Feature</span>
                  </th>
                  {tiers.map((tier, index) => (
                    <th key={index} className="relative px-4 py-6 text-center">
                      {tier.isPopular && (
                        <div className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-3 py-0.5 text-[10px] font-semibold text-white">
                          BEST VALUE
                        </div>
                      )}
                      <div className="font-display text-[18px] font-bold text-foreground">{tier.name}</div>
                      <div className="mt-2 flex items-baseline justify-center gap-1">
                        <span className="font-display text-[32px] font-bold text-foreground">{tier.price}</span>
                        <span className="text-[14px] text-muted-foreground">{tier.period}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tiers[0].features.map((_, featureIndex) => (
                  <tr key={featureIndex} className="border-b border-border last:border-b-0">
                    <td className="py-4 pl-8 pr-4 text-[14px] font-medium text-foreground">
                      {tiers[0].features[featureIndex].label}
                    </td>
                    {tiers.map((tier, tierIndex) => (
                      <td key={tierIndex} className="px-4 py-4 text-center text-[14px] text-muted-foreground">
                        {tier.features[featureIndex].value === false ? (
                          <X className="inline h-4 w-4 text-red-500" />
                        ) : typeof tier.features[featureIndex].value === "string" &&
                          tier.features[featureIndex].value.includes("✅") ? (
                          <span className="text-foreground">{tier.features[featureIndex].value}</span>
                        ) : typeof tier.features[featureIndex].value === "string" &&
                          tier.features[featureIndex].value.includes("❌") ? (
                          <span className="text-foreground">{tier.features[featureIndex].value}</span>
                        ) : (
                          tier.features[featureIndex].value
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-border bg-gradient-to-r from-[#FAFFFE] to-[#F0FDF4] px-8 py-6">
            <div className="flex items-center justify-center gap-6">
              {tiers.map((tier, index) => (
                <div key={index} className="flex-1 text-center">
                  {tier.isPopular ? (
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-8 py-3 text-[14px] font-semibold text-white shadow-xl shadow-green-500/20 transition-all hover:shadow-2xl hover:shadow-green-500/30"
                    >
                      Start Free Trial
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <div className="h-11" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}