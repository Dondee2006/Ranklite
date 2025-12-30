import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Webhook, Shield, Bell, Wrench, ChevronRight, ExternalLink } from "lucide-react";
import Link from "next/link";

const sections = [
  {
    title: "Setup & Configuration",
    description: "Learn how to set up webhooks and configure endpoint URLs for your Ranklite integration.",
    icon: Webhook,
    href: "/docs/webhooks/setup",
    color: "from-blue-500 to-blue-600",
  },
  {
    title: "Webhook Events",
    description: "Explore all available webhook events and their payload structures for different triggers.",
    icon: Bell,
    href: "/docs/webhooks/events",
    color: "from-purple-500 to-purple-600",
  },
  {
    title: "Security & Verification",
    description: "Implement signature verification and security best practices for your webhook endpoints.",
    icon: Shield,
    href: "/docs/webhooks/security",
    color: "from-green-500 to-green-600",
  },
  {
    title: "Troubleshooting",
    description: "Common issues, debugging tips, and solutions for webhook integration problems.",
    icon: Wrench,
    href: "/docs/webhooks/troubleshooting",
    color: "from-orange-500 to-orange-600",
  },
];

export default function WebhooksDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16">
          <Link
            href="/docs"
            className="mb-6 inline-flex items-center gap-2 text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Documentation
          </Link>
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[56px]">
            Webhooks Documentation
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Receive real-time notifications when events occur in your Ranklite account. Webhooks allow you to build powerful integrations that react to changes automatically.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">What are Webhooks?</h2>
          <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
            Webhooks are HTTP callbacks that send real-time data from Ranklite to your application when specific events occur. Instead of polling our API repeatedly, webhooks push data to your endpoint instantly.
          </p>
          <div className="rounded-lg bg-slate-50 p-6">
            <h3 className="mb-3 text-[16px] font-semibold text-foreground">Common Use Cases</h3>
            <ul className="space-y-2 text-[15px] text-muted-foreground">
              <li className="flex items-start gap-2">
                <ChevronRight className="h-5 w-5 shrink-0 text-[#22C55E]" />
                Sync published articles to your internal systems
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-5 w-5 shrink-0 text-[#22C55E]" />
                Trigger workflows when content is generated
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-5 w-5 shrink-0 text-[#22C55E]" />
                Monitor backlink campaign status changes
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="h-5 w-5 shrink-0 text-[#22C55E]" />
                Update analytics dashboards in real-time
              </li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Documentation Sections</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {sections.map((section) => (
              <Link
                key={section.title}
                href={section.href}
                className="group relative overflow-hidden rounded-2xl border border-border bg-white p-8 shadow-sm transition-all hover:shadow-md hover:shadow-green-500/10"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${section.color} shadow-lg`}>
                    <section.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="flex-1 font-display text-[22px] font-semibold text-foreground">
                    {section.title}
                  </h3>
                  <ExternalLink className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-[#22C55E]" />
                </div>
                <p className="text-[15px] leading-relaxed text-muted-foreground">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Quick Start</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[14px] font-bold text-white">
                1
              </div>
              <div>
                <p className="text-[15px] text-muted-foreground">
                  Go to your{" "}
                  <Link href="/dashboard/overview" className="font-medium text-[#22C55E] hover:underline">
                    Dashboard Settings
                  </Link>{" "}
                  and navigate to the Webhooks section.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[14px] font-bold text-white">
                2
              </div>
              <div>
                <p className="text-[15px] text-muted-foreground">
                  Add your webhook endpoint URL and select the events you want to receive.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[14px] font-bold text-white">
                3
              </div>
              <div>
                <p className="text-[15px] text-muted-foreground">
                  Implement signature verification in your endpoint to ensure requests are from Ranklite.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[14px] font-bold text-white">
                4
              </div>
              <div>
                <p className="text-[15px] text-muted-foreground">
                  Test your webhook using the testing tools in the dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <h3 className="mb-3 text-[20px] font-semibold text-blue-900">Need Help?</h3>
          <p className="mb-4 text-[15px] leading-relaxed text-blue-800">
            If you have questions about webhooks or need assistance with your integration, our support team is here to help.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@ranklite.com"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-blue-700"
            >
              Contact Support
            </a>
            <Link
              href="/docs/api"
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-6 py-3 text-[14px] font-semibold text-blue-900 transition-all hover:bg-blue-50"
            >
              View API Docs
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
