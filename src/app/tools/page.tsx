import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Sparkles, Search, FileText, Type, List } from "lucide-react";
import Link from "next/link";

const tools = [
  {
    id: "keyword-generator",
    name: "Keyword Generator",
    description: "Generate hundreds of relevant keyword ideas for your content strategy in seconds.",
    icon: Search,
    color: "from-[#22C55E] to-[#16A34A]",
    href: "/tools/keyword-generator",
  },
  {
    id: "content-brief",
    name: "Content Brief Generator",
    description: "Create comprehensive content briefs with SEO guidelines and structure recommendations.",
    icon: FileText,
    color: "from-[#3B82F6] to-[#2563EB]",
    href: "/tools/content-brief",
  },
  {
    id: "seo-title",
    name: "SEO Title Generator",
    description: "Generate click-worthy, SEO-optimized titles that rank and convert.",
    icon: Type,
    color: "from-[#8B5CF6] to-[#7C3AED]",
    href: "/tools/seo-title",
  },
  {
    id: "summarizer",
    name: "Article Summarizer",
    description: "Summarize long articles into concise, easy-to-digest key points.",
    icon: List,
    color: "from-[#F59E0B] to-[#D97706]",
    href: "/tools/summarizer",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-2 text-[14px] font-semibold text-[#22C55E]">
            <Sparkles className="h-4 w-4" />
            100% Free SEO Tools
          </div>
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            Free{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              SEO Tools
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            Powerful SEO tools powered by AI. No credit card required, completely free to use.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br ${tool.color} shadow-lg shadow-green-500/20`}>
                <tool.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="mb-3 font-display text-[24px] font-semibold text-foreground transition-colors group-hover:text-[#22C55E]">
                {tool.name}
              </h3>
              <p className="mb-6 flex-1 text-[16px] leading-relaxed text-muted-foreground">{tool.description}</p>
              <div className="flex items-center gap-2 text-[15px] font-semibold text-[#22C55E]">
                Try it free
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-12 text-center shadow-xl">
          <h2 className="mb-4 font-display text-[32px] font-bold text-white">Want More Advanced Features?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[17px] leading-relaxed text-white/90">
            Upgrade to Ranklite Pro for unlimited AI-generated content, automated publishing, and advanced SEO analysis.
          </p>
          <Link
            href="/#pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-[#22C55E] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            View Pricing
          </Link>
        </div>

        <div className="mt-20">
          <h2 className="mb-10 text-center font-display text-[32px] font-bold text-foreground">Why Use Our SEO Tools?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Powered by AI",
                description: "Our tools use advanced AI models trained on millions of high-ranking content pieces.",
              },
              {
                title: "Always Free",
                description: "These tools will always be 100% free. No hidden costs, no credit card required.",
              },
              {
                title: "Instant Results",
                description: "Get results in seconds. No waiting, no complicated setup required.",
              },
            ].map((feature) => (
              <div key={feature.title} className="rounded-xl border border-border bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-[18px] font-semibold text-foreground">{feature.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
