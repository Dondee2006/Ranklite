"use client";

import React, { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the automated backlink generation work?",
    answer: "Ranklite generates backlinks by creating SEO tools and AI-discoverable content that naturally attracts links. Your content gets found and linked to by others - no exchanges, no trading, no waiting for other users."
  },
  {
    question: "Do I need to exchange or trade links?",
    answer: "No. Unlike traditional link-building platforms, Ranklite doesn't rely on exchanges or trades. We create valuable SEO tools and AI-optimized content that earns backlinks naturally through discovery and genuine value."
  },
  {
    question: "What types of backlinks will I get?",
    answer: "You'll earn high-quality backlinks from AI tools, search engines, and content discovery platforms. The backlinks come from genuine sources that found your SEO tools and content valuable enough to reference."
  },
  {
    question: "How long does it take to see backlinks?",
    answer: "Unlike traditional methods where you wait for other users, our system starts generating backlink opportunities immediately. You can see early results within days as your SEO tools and content go live and get indexed."
  },
  {
    question: "Can I track my backlink performance?",
    answer: "Yes! Our dashboard provides detailed analytics showing all generated backlinks, their sources, domain authority, and the specific SEO tools or content pieces that earned them. Track your growth in real-time."
  },
  {
    question: "What makes this different from other backlink tools?",
    answer: "We don't rely on user exchanges or reciprocal linking. Instead, we create valuable SEO resources that naturally attract backlinks. It's a sustainable, white-hat approach that builds genuine authority over time."
  },
  {
    question: "Will this work for my niche?",
    answer: "Yes! Our AI analyzes your specific niche, target audience, and market to create SEO tools and content that resonate with your industry. Whether you're in e-commerce, SaaS, or local services, we tailor the strategy to your needs."
  }
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative overflow-hidden bg-white py-20 lg:py-32" id="faq">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-32 top-0 h-[400px] w-[400px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-30 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-30 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mx-auto mb-12 max-w-[600px] text-center lg:mb-16">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] px-4 py-1.5 text-[13px] font-semibold text-[#10B981]">
            <HelpCircle className="h-3.5 w-3.5" />
            FAQ
          </span>
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[48px]">
            Have{" "}
            <span className="bg-gradient-to-r from-[#10B981] to-[#22C55E] bg-clip-text text-transparent">
              questions?
            </span>
          </h2>
          <p className="mt-4 text-[16px] text-muted-foreground lg:text-[17px]">
            If you can&apos;t find what you&apos;re looking for, feel free to reach out!
          </p>
        </div>

        <div className="mx-auto max-w-[800px] space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`overflow-hidden rounded-2xl border bg-white transition-all duration-200 ${
                openIndex === index
                  ? "border-[#22C55E]/30 shadow-lg shadow-green-500/5"
                  : "border-border hover:border-[#22C55E]/20"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="flex w-full items-center justify-between p-5 text-left lg:p-6"
                aria-expanded={openIndex === index}
              >
                <span className="pr-6 text-[16px] font-semibold leading-relaxed text-foreground lg:text-[17px]">
                  {faq.question}
                </span>
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                    openIndex === index
                      ? "rotate-45 bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white"
                      : "bg-[#F0FDF4] text-[#22C55E]"
                  }`}
                >
                  <Plus className="h-5 w-5" strokeWidth={2.5} />
                </span>
              </button>
              
              <div
                className={`grid transition-all duration-300 ease-out ${
                  openIndex === index ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-5 pb-5 pt-0 text-[15px] leading-relaxed text-muted-foreground lg:px-6 lg:pb-6 lg:text-[16px]">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}