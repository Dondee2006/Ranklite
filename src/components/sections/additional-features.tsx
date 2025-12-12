"use client";

import React from "react";
import { Languages, Sparkles, KeyRound, Globe, Users, Headset, Layers } from "lucide-react";

const features = [
  {
    icon: Languages,
    title: "Write in 150+ languages",
    description: "Generate high-quality content in any language. Our AI creates native-sounding articles for global audiences.",
    gradient: "from-[#22C55E] to-[#16A34A]",
  },
  {
    icon: Sparkles,
    title: "AI-powered editing",
    description: "Refine your articles with intelligent editing tools. Every word aligns perfectly with your brand voice.",
    gradient: "from-[#10B981] to-[#059669]",
  },
  {
    icon: KeyRound,
    title: "Unlimited keywords",
    description: "Generate unlimited keyword sets until you find the perfect match for your content strategy.",
    gradient: "from-[#22C55E] to-[#10B981]",
  },
  {
    icon: Globe,
    title: "Multi-site support",
    description: "Scale your content strategy across multiple websites. Add more sites to your package anytime.",
    gradient: "from-[#10B981] to-[#22C55E]",
  },
  {
    icon: Users,
    title: "Team collaboration",
    description: "Invite editors to your organization. Collaborate seamlessly to create impactful content together.",
    gradient: "from-[#16A34A] to-[#22C55E]",
  },
  {
    icon: Headset,
    title: "24/7 expert support",
    description: "Get assistance whenever you need it. Our team ensures smooth operation of all features.",
    gradient: "from-[#059669] to-[#10B981]",
  },
];

export default function AdditionalFeatures() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFFFE] py-20 lg:py-32">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-gradient-to-br from-[#F0FDF4] to-transparent opacity-40 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="mx-auto mb-14 max-w-[700px] text-center lg:mb-20">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#D1FAE5] px-4 py-1.5 text-[13px] font-semibold text-[#10B981]">
            <Layers className="h-3.5 w-3.5" />
            More Features
          </span>
          <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              do your best work
            </span>
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.02] transition-all duration-300 hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl lg:p-8"
            >
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-[#F0FDF4] to-[#D1FAE5] opacity-0 blur-2xl transition-opacity group-hover:opacity-60" />
              
              <div className={`relative mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                <feature.icon className="h-5 w-5 text-white" strokeWidth={2} />
              </div>
              
              <h3 className="relative mb-2 font-display text-[20px] font-bold tracking-tight text-foreground">
                {feature.title}
              </h3>
              <p className="relative text-[15px] leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}