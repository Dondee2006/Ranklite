import Link from "next/link";
import { Check, X, ArrowRight, Zap, Shield, TrendingUp, Gauge } from "lucide-react";

export default function Pricing() {
  const plans = [
    {
      name: "Starter",
      tagline: "Safe Growth",
      price: "$49",
      period: "/month",
      color: "from-green-500 to-emerald-600",
      icon: "🟢",
      description: "Best for new sites or small businesses starting SEO.",
      features: [
        "1 website",
        "1 backlink per article (SEO-safe)",
        "AI-written posts & auto-publishing",
        "WordPress, Webflow, Shopify, Notion, Framer, Custom CMS",
        "Built-in SEO protection",
      ],
      status: "Inactive",
      cta: "Start safe growth",
      ctaLink: "/login",
    },
    {
      name: "Growth",
      tagline: "Balanced Growth",
      price: "$99",
      period: "/month",
      color: "from-green-500 to-emerald-600",
      icon: "🔵",
      isPopular: true,
      description: "Designed for consistent rankings and steady traffic.",
      features: [
        "Up to 3 websites",
        "2–3 backlinks per article (progressive authority)",
        "30-day AI content plan & daily publishing",
        "QA validation & indexing checks",
        "WordPress, Webflow, Shopify, Notion, Framer, Custom CMS",
      ],
      cta: "Start growing",
      ctaLink: "/login",
    },
    {
      name: "Authority",
      tagline: "Authority Growth",
      price: "$199",
      period: "/month",
      color: "from-green-500 to-emerald-600",
      icon: "🔴",
      description: "Built for established brands that want to move faster.",
      features: [
        "Up to 10 websites",
        "Up to 5 backlinks per article (scales after QA)",
        "Accelerated publishing & high-capacity backlink generation",
        "Priority QA validation & advanced authority controls",
        "WordPress, Webflow, Shopify, Notion, Framer, Custom CMS",
      ],
      cta: "Scale authority",
      ctaLink: "/login",
    },
  ];

  const differentiators = [
    {
      title: "Most SEO tools give you:",
      items: ["Data dashboards", "To-do lists", "Manual work"],
    },
    {
      title: "Ranklite does the work for you.",
      items: [
        "We automatically control publishing, link building, and SEO pacing behind the scenes — so Google sees natural growth, not automation.",
        "You never touch settings.",
        "You never guess.",
        "You just grow.",
      ],
      highlight: true,
    },
  ];

  const safetyFeatures = [
    { icon: Shield, text: "No link blasts" },
    { icon: TrendingUp, text: "No content flooding" },
    { icon: X, text: "No spam tactics" },
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
        {/* Header */}
        <div className="mx-auto mb-14 max-w-[700px] text-center lg:mb-20">
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
            Ranklite Pricing
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[16px] leading-relaxed text-muted-foreground lg:text-[18px]">
            SEO on autopilot — without burning your site
          </p>
          <p className="mx-auto mt-3 max-w-[620px] text-[15px] leading-relaxed text-muted-foreground lg:text-[16px]">
            Ranklite automatically plans, writes, publishes, and grows your content — while quietly managing everything Google cares about in the background.
          </p>
          <p className="mx-auto mt-4 text-[14px] font-semibold text-foreground lg:text-[15px]">
            No manual work. No risky shortcuts. No SEO guesswork.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-3xl border bg-white p-6 shadow-lg transition-all hover:shadow-xl ${
                plan.isPopular ? "border-green-500 shadow-green-500/10 ring-2 ring-green-500/20" : "border-border"
              }`}
            >
              {plan.isPopular && (
                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-1 text-[11px] font-semibold text-white">
                  ⭐ Most Popular
                </div>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{plan.icon}</span>
                <div>
                  <h3 className="font-display text-[20px] font-bold text-foreground">{plan.name}</h3>
                  <p className="text-[13px] text-muted-foreground">{plan.tagline}</p>
                </div>
              </div>

              <div className="mb-3 flex items-baseline gap-1">
                <span className="font-display text-[40px] font-bold text-foreground">{plan.price}</span>
                <span className="text-[16px] text-muted-foreground">{plan.period}</span>
              </div>

              <p className="mb-4 text-[14px] text-muted-foreground">{plan.description}</p>

              <ul className="space-y-2 mb-5">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px]">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.status && (
                <div className="mb-4 inline-block rounded-full bg-gray-100 px-3 py-1 text-[12px] font-medium text-gray-600">
                  Status: {plan.status}
                </div>
              )}

              <Link
                href={plan.ctaLink}
                className={`flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r ${plan.color} py-3 text-[14px] font-semibold text-white shadow-lg transition-all hover:shadow-xl`}
              >
                {plan.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>

        {/* How Ranklite Is Different */}
        <div className="mx-auto mt-20 max-w-[900px]">
          <h3 className="mb-8 text-center font-display text-[28px] font-bold text-foreground sm:text-[32px]">
            🧠 How Ranklite Is Different
          </h3>
          <div className="grid gap-6 md:grid-cols-2">
            {differentiators.map((section, index) => (
              <div
                key={index}
                className={`rounded-2xl border p-8 ${
                  section.highlight
                    ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                    : "bg-white border-border"
                }`}
              >
                <h4 className="mb-4 text-[18px] font-bold text-foreground">{section.title}</h4>
                <ul className="space-y-2">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-[14px] text-muted-foreground leading-relaxed">
                      {section.highlight ? item : `• ${item}`}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* SEO-Safe by Design */}
        <div className="mx-auto mt-16 max-w-[800px] rounded-3xl border border-border bg-white p-8 shadow-lg">
          <h3 className="mb-6 text-center font-display text-[24px] font-bold text-foreground">
            🔒 SEO-Safe by Design
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {safetyFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                <feature.icon className="h-5 w-5 text-red-500" />
                <span className="text-[14px] font-medium text-foreground">{feature.text}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-[14px] text-muted-foreground">
            Ranklite adapts in real time to keep your site safe — even as it scales.
          </p>
        </div>

        {/* Built for Founders */}
        <div className="mx-auto mt-16 max-w-[700px] text-center">
          <h3 className="mb-6 font-display text-[24px] font-bold text-foreground">
            ⚡ Built for Founders, Not Agencies
          </h3>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {["Set it once", "Let it run", "Track results"].map((item, index) => (
              <div key={index} className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
                <span className="text-[14px] font-semibold text-foreground">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-[14px] text-muted-foreground">
            Perfect for startups, SaaS, local businesses, and creators who want SEO without babysitting tools.
          </p>
        </div>

        {/* MVP Note */}
        <div className="mx-auto mt-12 max-w-[600px] text-center">
          <p className="text-[12px] text-muted-foreground/70">
            🧪 <strong>MVP Note:</strong> Billing is currently in demo mode while we onboard early users.
          </p>
        </div>
      </div>
    </section>
  );
}