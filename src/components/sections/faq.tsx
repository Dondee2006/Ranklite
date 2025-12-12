"use client";

import React, { useState } from "react";
import { Plus, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "How does the article automation work?",
    answer: "Our AI analyzes your niche, competitors, and target audience to discover high-potential keywords. It then automatically generates and publishes SEO-optimized articles daily, handling the entire content creation process."
  },
  {
    question: "Will the content be SEO-friendly?",
    answer: "Absolutely. Every article is built on powerful keywords and includes strategic internal and external links. The content reads naturally while satisfying search engine algorithms for high rankings."
  },
  {
    question: "Can I manage multiple websites?",
    answer: "Yes! Each website gets its own dedicated setup with custom target audience settings and content preferences. We offer volume discounts based on the number of websites you manage."
  },
  {
    question: "What integrations do you support?",
    answer: "We seamlessly integrate with WordPress, Webflow, Shopify, Notion, Wix, Framer, and many others. The system handles everything from content generation to publication automatically."
  },
  {
    question: "Does it support other languages?",
    answer: "Yes, we support content generation in 150+ languages. Our AI creates articles in any language you need, allowing you to reach a global audience effectively."
  },
  {
    question: "How often are new articles generated?",
    answer: "Our plan generates 30 articles per month per website, creating daily ranking content to foster consistent growth and topical authority for your domain."
  },
  {
    question: "Can I review articles before publication?",
    answer: "Yes, you have full control. Review and edit articles to meet your exact expectations before they go live, ensuring every word aligns with your vision."
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