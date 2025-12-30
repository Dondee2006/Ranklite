import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Users, Target, Zap, Award } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Ranklite's mission to make SEO accessible to everyone through AI-powered content automation and organic growth strategies.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            About{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Ranklite
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            We&apos;re on a mission to make SEO accessible to everyone through AI-powered content creation.
          </p>
        </div>

        <div className="mb-20">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-12 shadow-lg">
            <h2 className="mb-6 font-display text-[32px] font-bold text-foreground">Our Story</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                Ranklite was born from a simple observation: creating high-quality, SEO-optimized content is time-consuming
                and expensive, making it difficult for small businesses and individual creators to compete online.
              </p>
              <p>
                We built Ranklite to level the playing field. By combining advanced AI technology with proven SEO best
                practices, we&apos;ve created a platform that helps anyone create content that ranks—without needing deep SEO
                expertise or a large content team.
              </p>
              <p>
                Today, thousands of businesses use Ranklite to grow their organic traffic and reach more customers through
                search engines.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-10 text-center font-display text-[32px] font-bold text-foreground">Our Values</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Target,
                title: "Results-Driven",
                description: "We focus on delivering measurable SEO results, not vanity metrics.",
              },
              {
                icon: Users,
                title: "User-First",
                description: "Every feature is designed with our users&apos; success in mind.",
              },
              {
                icon: Zap,
                title: "Innovation",
                description: "We constantly push the boundaries of what&apos;s possible with AI and SEO.",
              },
              {
                icon: Award,
                title: "Quality",
                description: "We never compromise on content quality or ethical SEO practices.",
              },
            ].map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-3 shadow-md shadow-green-500/20">
                  <value.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-[18px] font-semibold text-foreground">{value.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-12 text-center shadow-xl">
          <h2 className="mb-4 font-display text-[32px] font-bold text-white">Join Us on Our Journey</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[17px] leading-relaxed text-white/90">
            We&apos;re just getting started. Join thousands of content creators and businesses who are already growing their
            organic traffic with Ranklite.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-[#22C55E] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Get Started Today
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
