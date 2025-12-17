"use client";

import React, { useState } from "react";
import { Plus, Minus } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What exactly does Ranklite do?",
    answer: "Ranklite is a complete SEO automation platform. We create a 30-day content calendar tailored to your niche, write and publish blog posts automatically, build high-quality backlinks for each article, and validate everything through QA checks—all without you lifting a finger."
  },
  {
    question: "What are backlinks, and why do they matter for my articles or blog posts?",
    answer: "Backlinks are links from other websites that point to your article. They act as a vote of confidence, showing search engines that your content is credible and valuable. More high-quality backlinks can improve your article's visibility and ranking on search engines."
  },
  {
    question: "How does Ranklite handle backlink generation for my content?",
    answer: "Ranklite automatically generates backlinks for each article automatically published, attaching them directly to your posts. The system uses relevant anchor text and distributes links across diverse, trustworthy sources, boosting your SEO while keeping the process seamless and safe."
  },
  {
    question: "Do I need SEO experience to use Ranklite?",
    answer: "Not at all. Ranklite is designed for non-technical users. You don't need to understand SEO tactics, keyword research, or link building strategies. Our AI handles all the technical complexity while you focus on growing your business."
  },
  {
    question: "How long does it take to see results?",
    answer: "Most users start seeing organic traffic increases within 30-60 days. Unlike traditional SEO that can take 6+ months, Ranklite's automated content publishing and backlink generation accelerate the timeline significantly while staying within Google's guidelines."
  },
  {
    question: "Will this work for my industry/niche?",
    answer: "Yes! Ranklite's AI analyzes your specific niche, target audience, and competitors to create content that resonates with your market. Whether you're in e-commerce, SaaS, local services, or B2B, we tailor the entire strategy to your unique needs."
  },
  {
    question: "Is this safe for my website's SEO?",
    answer: "Absolutely. Ranklite is built with SEO safety as the foundation. We control publishing pace, backlink velocity, and content quality to ensure Google sees natural, organic growth—not automated spam. No link blasts, no content flooding, no penalties."
  },
  {
    question: "What if I already have content on my site?",
    answer: "Perfect! Ranklite integrates seamlessly with your existing content. We'll analyze what you have, identify gaps in your content strategy, and build on your foundation to accelerate rankings while maintaining your brand voice."
  },
  {
    question: "Can I review content before it's published?",
    answer: "Yes. While Ranklite operates on autopilot by default, you can enable manual review mode in settings. This allows you to approve each article before publishing if you prefer more hands-on control."
  },
  {
    question: "What types of content does Ranklite create?",
    answer: "We generate a variety of content formats optimized for SEO: in-depth guides, listicles, comparison articles, how-to tutorials, and industry insights. Each piece is tailored to your niche and designed to rank for high-value keywords."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F8FAFB] py-20 lg:py-32" id="faq">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-[10%] top-0 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#22C55E]/10 via-[#D1FAE5]/20 to-transparent opacity-40 blur-3xl" />
        <div className="absolute -left-[10%] bottom-0 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-[#DCFCE7]/20 via-[#22C55E]/5 to-transparent opacity-40 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mx-auto mb-14 max-w-[700px] text-center lg:mb-20">
          <span className="mb-4 inline-block rounded-full bg-[#22C55E]/10 px-4 py-2 text-[13px] font-bold uppercase tracking-[1.2px] text-[#22C55E]">
            Frequently Asked Questions
          </span>
          <h2 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-[#1A202C] sm:text-[48px] lg:text-[56px]">
            Everything you need to{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-[#22C55E]">know</span>
              <svg
                className="absolute -bottom-2 left-0 w-full text-[#22C55E]/20"
                viewBox="0 0 200 12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 9C60 3 140 3 198 9"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#718096] lg:text-[18px]">
            Got questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? Reach out to our team.
          </p>
        </div>

        <div className="mx-auto max-w-[900px] space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group overflow-hidden rounded-2xl border bg-white transition-all duration-300 ${openIndex === index
                ? "border-[#22C55E]/40 shadow-lg shadow-[#22C55E]/10"
                : "border-[#E2E8F0] hover:border-[#22C55E]/20 hover:shadow-md"
                }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-start justify-between gap-6 p-6 text-left transition-colors lg:p-7"
                aria-expanded={openIndex === index}
              >
                <span className="flex-1 text-[17px] font-semibold leading-snug text-[#1A202C] lg:text-[18px]">
                  {faq.question}
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${openIndex === index
                    ? "bg-[#22C55E] text-white rotate-180"
                    : "bg-[#F0FDF4] text-[#22C55E] group-hover:bg-[#DCFCE7]"
                    }`}
                >
                  {openIndex === index ? (
                    <Minus className="h-5 w-5" strokeWidth={2.5} />
                  ) : (
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </span>
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out ${openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="border-t border-[#F0F0F0] px-6 pb-6 pt-4 text-[16px] leading-relaxed text-[#4A5568] lg:px-7 lg:pb-7 lg:pt-5 lg:text-[17px]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-[700px] text-center lg:mt-20">
          <div className="rounded-3xl border border-[#E2E8F0] bg-white p-8 shadow-md lg:p-10">
            <h3 className="mb-3 font-display text-[24px] font-bold text-[#1A202C] lg:text-[28px]">
              Still have questions?
            </h3>
            <p className="mb-6 text-[16px] text-[#718096] lg:text-[17px]">
              Our team is here to help. Get in touch and we&apos;ll answer any questions you have about Ranklite.
            </p>
            <a
              href="mailto:support@ranklite.com"
              className="inline-flex items-center gap-2 rounded-full bg-[#22C55E] px-8 py-3.5 text-[16px] font-semibold text-white transition-all hover:bg-[#16A34A] hover:shadow-lg"
            >
              Contact Support
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}