import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Pricing() {
  const features = [
    { text: "30 SEO articles per month", highlight: false },
    { text: "AI-generated images included", highlight: false },
    { text: "Auto-publishing to WordPress, Wix, Webflow and many other platforms", highlight: "other platforms" },
    { text: "Full keyword research & optimization", highlight: false },
    { text: "Performance dashboard access", highlight: false },
    { text: "High-quality backlink starter pack", highlight: false },
    { text: "Optional light human QA", highlight: false },
    { text: "3-day trial ($1 activation fee)", highlight: false },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F9FAFB] py-20 lg:py-32" id="pricing">
      <div className="container mx-auto max-w-[1200px] px-5 md:px-8">
        {/* Header */}
        <div className="mx-auto mb-14 max-w-[800px] text-center lg:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
            Simple Pricing
          </span>
          <h2 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[48px] lg:text-[56px]">
            One plan.{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Everything included.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-[620px] text-[18px] leading-relaxed text-muted-foreground lg:text-[20px]">
            Get full access to all features with our all-in-one plan
          </p>
        </div>

        {/* Pricing Card */}
        <div className="mx-auto max-w-[1000px]">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#15803D] p-8 shadow-2xl lg:p-12">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

            <div className="relative grid gap-8 lg:grid-cols-[auto_1fr]">
              {/* Left: Price & CTA */}
              <ScrollReveal variant="slide-left" delay={0.2}>
                <div className="flex flex-col items-start lg:min-w-[320px]">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">All in One</h3>
                    <p className="text-green-100 text-sm">For ambitious entrepreneurs</p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-7xl font-bold text-white">$35</span>
                      <div className="flex flex-col">
                        <span className="text-xl text-green-100 line-through">$59</span>
                        <span className="text-lg text-green-100">/monthly</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href="https://whop.com/checkout/plan_hwMsQBSgnZtPO"
                    className="group mb-4 flex w-full items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[#16A34A] shadow-lg transition-all hover:bg-green-50 hover:shadow-xl hover:scale-105"
                  >
                    Get Started for Free
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </a>

                  <p className="text-center text-sm text-green-100 w-full">
                    <span className="font-semibold">Cancel anytime.</span> No questions asked!
                  </p>
                </div>
              </ScrollReveal>

              {/* Right: Features */}
              <div className="lg:pl-8 lg:border-l lg:border-white/20">
                <ScrollReveal delay={0.3}>
                  <h4 className="text-lg font-semibold text-white mb-6">What's included:</h4>
                </ScrollReveal>
                <ul className="grid gap-4 sm:grid-cols-2">
                  {features.map((feature, i) => (
                    <ScrollReveal
                      key={i}
                      delay={0.4 + (i * 0.05)}
                      variant="fade-in"
                    >
                      <li className="flex items-start gap-3">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 flex-shrink-0 mt-0.5">
                          <Check className="h-4 w-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="text-[15px] text-white/90 leading-relaxed">
                          {typeof feature.highlight === 'string' ? (
                            <>
                              {feature.text.split(feature.highlight)[0]}
                              <Link href="/integrations" className="text-green-100 underline hover:text-white transition-colors">
                                {feature.highlight}
                              </Link>
                              {feature.text.split(feature.highlight)[1]}
                            </>
                          ) : (
                            feature.text
                          )}
                        </span>
                      </li>
                    </ScrollReveal>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Trusted by ambitious entrepreneurs worldwide</p>
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-[#22C55E]" />
              <span>3-day free trial</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-[#22C55E]" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-[#22C55E]" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}