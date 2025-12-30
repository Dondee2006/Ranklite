import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ArrowLeft, CheckCircle, Zap, Clock } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranklite - Build Organic Traffic on Autopilot | Quick Start Guide",
  description: "Get up and running with Ranklite in under 5 minutes. Learn how to set up your first site and generate AI content.",
};

export default function QuickStartPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <Link
          href="/docs"
          className="mb-8 inline-flex items-center gap-2 text-[15px] text-muted-foreground transition-colors hover:text-[#22C55E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documentation
        </Link>

        <article className="mx-auto max-w-4xl">
          <div className="mb-12">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[14px] font-medium text-[#22C55E]">
              <Clock className="h-4 w-4" />
              5 min read
            </div>
            <h1 className="mb-6 font-display text-[48px] font-bold leading-[1.1] tracking-tight text-foreground">
              Quick Start Guide
            </h1>
            <p className="text-[20px] leading-relaxed text-muted-foreground">
              Get up and running with Ranklite in under 5 minutes. This guide will walk you through creating your account, setting up your first site, and generating your first AI-powered content.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="mb-12 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-md shadow-green-500/20">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h2 className="m-0 font-display text-[24px] font-semibold text-foreground">What You&apos;ll Learn</h2>

              </div>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span className="text-[16px] text-muted-foreground">How to create and set up your Ranklite account</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span className="text-[16px] text-muted-foreground">How to add your first website</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span className="text-[16px] text-muted-foreground">How to generate your first SEO-optimized article</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span className="text-[16px] text-muted-foreground">How to publish content to your site</span>
                </li>
              </ul>
            </div>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">1</span>
                Create Your Account
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Visit <Link href="/" className="font-semibold text-[#22C55E] hover:underline">ranklite.com</Link> and click the &quot;Start Free Trial&quot; button. You&apos;ll be prompted to enter:

                </p>
                <ul className="ml-6 space-y-2">
                  <li>Your email address</li>
                  <li>A secure password</li>
                  <li>Your name</li>
                </ul>
                <p>
                  A small <strong>$1 activation fee</strong> applies for the 3-day free trial. You&apos;ll receive a confirmation email with a link to verify your account.

                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">2</span>
                Add Your First Site
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Once you&apos;ve logged in, you&apos;ll be taken through our onboarding wizard:

                </p>
                <ol className="ml-6 space-y-2">
                  <li><strong className="text-foreground">Enter your website URL:</strong> Add your site&apos;s domain (e.g., example.com)</li>

                  <li><strong className="text-foreground">Select your niche:</strong> Choose the category that best describes your content</li>
                  <li><strong className="text-foreground">Define your target audience:</strong> Help our AI understand who you&apos;re writing for</li>
                  <li><strong className="text-foreground">Set your content goals:</strong> Specify how many articles you want to publish per week</li>
                </ol>
                <p>
                  This information helps Ranklite generate content that&apos;s perfectly tailored to your site and audience.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">3</span>
                Generate Your First Article
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  From your dashboard, click the &quot;Create New Article&quot; button:
                </p>
                <ul className="ml-6 space-y-2">
                  <li><strong className="text-foreground">Enter a topic or keyword:</strong> What do you want to write about?</li>
                  <li><strong className="text-foreground">Choose article length:</strong> Short (800-1200 words), Medium (1500-2000 words), or Long (2500+ words)</li>
                  <li><strong className="text-foreground">Set your tone:</strong> Professional, casual, friendly, or authoritative</li>
                  <li><strong className="text-foreground">Click &quot;Generate&quot;:</strong> Our AI will create SEO-optimized content in under 60 seconds</li>
                </ul>
                <p>
                  You can review, edit, and customize the generated content before publishing.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">4</span>
                Connect Your CMS (Optional)
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  To automatically publish content to your site, connect your CMS:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Navigate to <strong className="text-foreground">Settings → Integrations</strong></li>
                  <li>Select your CMS (WordPress, Webflow, Shopify, etc.)</li>
                  <li>Follow the authentication flow</li>
                  <li>Grant Ranklite permission to publish on your behalf</li>
                </ul>
                <p>
                  Once connected, you can publish articles directly from Ranklite with a single click.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">5</span>
                Set Up Autopilot (Optional)
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Let Ranklite automatically generate and publish content on a schedule:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Go to <strong className="text-foreground">Dashboard → Autopilot Settings</strong></li>
                  <li>Enable Autopilot mode</li>
                  <li>Set your publishing frequency (daily, weekly, etc.)</li>
                  <li>Define content preferences and topics</li>
                </ul>
                <p>
                  Ranklite will now generate and publish fresh content automatically, keeping your site updated without any manual work.
                </p>
              </div>
            </section>

            <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-8">
              <h2 className="mb-4 font-display text-[24px] font-semibold text-foreground">Next Steps</h2>
              <div className="space-y-3">
                <Link href="/docs#getting-started" className="block rounded-lg border border-border bg-white p-4 text-[16px] font-medium text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  → Learn how to create your first article
                </Link>
                <Link href="/docs#getting-started" className="block rounded-lg border border-border bg-white p-4 text-[16px] font-medium text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  → Explore the dashboard
                </Link>
                <Link href="/docs/wordpress" className="block rounded-lg border border-border bg-white p-4 text-[16px] font-medium text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  → Set up WordPress integration
                </Link>
              </div>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
