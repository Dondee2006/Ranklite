import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Book, Code, Webhook, Plug, ChevronRight } from "lucide-react";
import Link from "next/link";

const docCategories = [
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Learn the basics of Ranklite and get up and running in minutes.",
    icon: Book,
    color: "from-[#22C55E] to-[#16A34A]",
    articles: [
      { title: "Quick Start Guide", href: "/docs/quick-start" },
      { title: "Creating Your First Article", href: "/docs/first-article" },
      { title: "Understanding the Dashboard", href: "/docs/dashboard-overview" },
      { title: "Account Setup", href: "/docs/account-setup" },
    ],
  },
  {
    id: "integrations",
    name: "Integrations",
    description: "Connect Ranklite with WordPress, Webflow, Shopify, and other platforms.",
    icon: Plug,
    color: "from-[#3B82F6] to-[#2563EB]",
    articles: [
      { title: "WordPress Integration", href: "/docs/wordpress" },
      { title: "Webflow Setup", href: "/docs/webflow" },
      { title: "Shopify Integration", href: "/docs/shopify" },
      { title: "Google Search Console", href: "/docs/gsc" },
    ],
  },
  {
    id: "api",
    name: "API Reference",
    description: "Integrate Ranklite into your application with our comprehensive API.",
    icon: Code,
    color: "from-[#8B5CF6] to-[#7C3AED]",
    articles: [
      { title: "API Authentication", href: "/docs/api/auth" },
      { title: "Generate Content", href: "/docs/api/generate" },
      { title: "Manage Articles", href: "/docs/api/articles" },
      { title: "Rate Limits", href: "/docs/api/limits" },
    ],
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Set up webhooks to receive real-time notifications about content updates.",
    icon: Webhook,
    color: "from-[#F59E0B] to-[#D97706]",
    articles: [
      { title: "Webhook Setup", href: "/docs/webhooks/setup" },
      { title: "Event Types", href: "/docs/webhooks/events" },
      { title: "Security & Verification", href: "/docs/webhooks/security" },
      { title: "Troubleshooting", href: "/docs/webhooks/troubleshooting" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            Everything you need to know about using Ranklite, from basic setup to advanced integrations.
          </p>
        </div>

        <div className="mb-12">
          <div className="relative">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full rounded-xl border border-border bg-white px-6 py-4 pr-12 text-[16px] shadow-sm transition-all focus:border-[#22C55E] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20"
            />
            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {docCategories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
            >
              <div className="border-b border-border p-6">
                <div className="mb-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-3 shadow-md shadow-green-500/20">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 font-display text-[24px] font-semibold text-foreground">{category.name}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{category.description}</p>
              </div>
              <div className="flex-1 p-6">
                <ul className="space-y-3">
                  {category.articles.map((article) => (
                    <li key={article.title}>
                      <Link
                        href={article.href}
                        className="group flex items-center justify-between rounded-lg p-3 text-[15px] text-muted-foreground transition-all hover:bg-[#F0FDF4] hover:text-[#22C55E]"
                      >
                        <span>{article.title}</span>
                        <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-12">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 font-display text-[32px] font-bold text-foreground">Need Help?</h2>
            <p className="mb-8 text-[17px] leading-relaxed text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help you get the most out of Ranklite.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="mailto:support@ranklite.com"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] px-8 py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
              >
                Contact Support
              </a>
              <a
                href="https://community.ranklite.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-8 py-4 text-[16px] font-semibold text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]"
              >
                Join Community
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
