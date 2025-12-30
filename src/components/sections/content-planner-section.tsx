"use client";

import Link from "next/link";
import { Calendar, Sparkles, ArrowRight } from "lucide-react";
import CalendarPreview from "@/components/ui/calendar-preview";

export default function ContentPlannerSection() {
    return (
        <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#F9FAFB] py-20 lg:py-32">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-[#DCFCE7] to-transparent opacity-20 blur-3xl" />
                <div className="absolute right-1/4 bottom-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-bl from-[#D1FAE5] to-transparent opacity-15 blur-3xl" />
            </div>

            <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
                <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
                    {/* Left: Content */}
                    <div className="order-2 lg:order-1">
                        <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
                            <Calendar className="h-3.5 w-3.5" />
                            Content Planner
                        </span>
                        <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
                            Plan, schedule, and publish{" "}
                            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                                30 days of content
                            </span>{" "}
                            in minutes
                        </h2>
                        <p className="mt-5 max-w-[550px] text-[16px] leading-relaxed text-muted-foreground lg:text-[17px]">
                            Our AI-powered content planner generates a full month of SEO-optimized articles tailored to your niche.
                            Just click "Generate 30 Articles" and watch your content calendar fill up automatically.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#DCFCE7]">
                                    <Sparkles className="h-3.5 w-3.5 text-[#16A34A]" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-semibold text-foreground">AI-Generated Content Calendar</h4>
                                    <p className="mt-1 text-[14px] text-muted-foreground">
                                        30 article ideas, titles, and keywords generated instantly
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#DCFCE7]">
                                    <Calendar className="h-3.5 w-3.5 text-[#16A34A]" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-semibold text-foreground">Smart Scheduling</h4>
                                    <p className="mt-1 text-[14px] text-muted-foreground">
                                        Articles automatically scheduled for optimal publishing times
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#DCFCE7]">
                                    <ArrowRight className="h-3.5 w-3.5 text-[#16A34A]" />
                                </div>
                                <div>
                                    <h4 className="text-[15px] font-semibold text-foreground">One-Click Publishing</h4>
                                    <p className="mt-1 text-[14px] text-muted-foreground">
                                        Generate full articles and publish directly to your site
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://whop.com/checkout/plan_hwMsQBSgnZtPO"
                            className="mt-8 group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-4 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30"
                        >
                            Start Planning Your Content
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                        </a>
                    </div>

                    {/* Right: Calendar Preview */}
                    <div className="order-1 lg:order-2">
                        <div className="relative">
                            {/* Decorative elements */}
                            <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-[#22C55E]/10 blur-2xl" />
                            <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-[#16A34A]/10 blur-2xl" />

                            {/* Calendar Container */}
                            <div className="relative rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl shadow-black/[0.08] lg:rounded-3xl">
                                <CalendarPreview />
                            </div>

                            {/* Floating badge */}
                            <div className="absolute -bottom-6 -left-6 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-lg">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-[#22C55E] animate-pulse" />
                                    <span className="text-[13px] font-semibold text-foreground">Live Preview</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
