import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ArrowLeft, LayoutDashboard, Clock } from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
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
              6 min read
            </div>
            <h1 className="mb-6 font-display text-[48px] font-bold leading-[1.1] tracking-tight text-foreground">
              Understanding the Dashboard
            </h1>
            <p className="text-[20px] leading-relaxed text-muted-foreground">
              Your Ranklite dashboard is your command center for all content operations. Learn how to navigate and utilize every feature to maximize your content marketing efficiency.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Dashboard Overview
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  When you first log in, you'll see your main dashboard with key metrics and quick actions. The dashboard is designed to give you immediate insights into your content performance and provide fast access to essential features.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Key Sections
              </h2>

              <div className="space-y-8">
                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">📊 Analytics Overview</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Located at the top of your dashboard, this section displays:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">Total Articles:</strong> Number of articles generated this month</li>
                    <li><strong className="text-foreground">Published Content:</strong> Successfully published articles</li>
                    <li><strong className="text-foreground">Traffic Impact:</strong> Estimated traffic from your content</li>
                    <li><strong className="text-foreground">Keyword Rankings:</strong> Number of keywords ranking in top 10</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">📝 Content Library</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Your content library shows all generated articles with filters for:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">Status:</strong> Draft, Scheduled, Published, or Archived</li>
                    <li><strong className="text-foreground">Date Range:</strong> Filter by creation or publication date</li>
                    <li><strong className="text-foreground">Performance:</strong> Sort by views, rankings, or engagement</li>
                    <li><strong className="text-foreground">Keywords:</strong> Search articles by target keywords</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">📅 Content Planner</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Plan and schedule your content calendar with:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">Calendar View:</strong> Visual representation of scheduled content</li>
                    <li><strong className="text-foreground">Autopilot Settings:</strong> Configure automatic content generation</li>
                    <li><strong className="text-foreground">Content Ideas:</strong> AI-suggested topics based on your niche</li>
                    <li><strong className="text-foreground">Publishing Queue:</strong> Manage upcoming publications</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">🔗 Internal Linking</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Improve your site structure with intelligent linking:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">Link Suggestions:</strong> AI-recommended internal links</li>
                    <li><strong className="text-foreground">Sitemap Scanning:</strong> Automatic discovery of linkable pages</li>
                    <li><strong className="text-foreground">Link Health:</strong> Monitor broken or weak internal links</li>
                    <li><strong className="text-foreground">Anchor Text Optimization:</strong> Suggestions for better anchor text</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">🔌 Integrations</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Manage your connected platforms:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">CMS Connections:</strong> WordPress, Webflow, Shopify, etc.</li>
                    <li><strong className="text-foreground">Google Search Console:</strong> Import keyword data</li>
                    <li><strong className="text-foreground">Analytics:</strong> Track performance across platforms</li>
                    <li><strong className="text-foreground">Webhooks:</strong> Set up custom notifications</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[22px] font-semibold text-foreground">🎯 Backlink Generator</h3>
                  <p className="mb-4 text-[17px] text-muted-foreground">
                    Build authority with automated backlink campaigns:
                  </p>
                  <ul className="ml-6 space-y-2 text-[16px] text-muted-foreground">
                    <li><strong className="text-foreground">Campaign Management:</strong> Create and track backlink campaigns</li>
                    <li><strong className="text-foreground">Platform Integration:</strong> Connect to outreach platforms</li>
                    <li><strong className="text-foreground">Performance Tracking:</strong> Monitor backlink acquisition</li>
                    <li><strong className="text-foreground">Manual Review:</strong> Approve or reject suggested opportunities</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Quick Actions
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  The quick actions menu (usually in the top right) provides instant access to:
                </p>
                <ul className="ml-6 space-y-2">
                  <li><strong className="text-foreground">Create New Article:</strong> Start generating content immediately</li>
                  <li><strong className="text-foreground">View Analytics:</strong> Deep dive into performance metrics</li>
                  <li><strong className="text-foreground">Manage Sites:</strong> Add or edit website configurations</li>
                  <li><strong className="text-foreground">Settings:</strong> Configure your account and preferences</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Navigation Menu
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  The left sidebar provides quick navigation to:
                </p>
                <div className="rounded-xl bg-[#F0FDF4] p-6">
                  <ul className="space-y-3 text-[16px]">
                    <li><strong className="text-foreground">🏠 Dashboard:</strong> Your main overview page</li>
                    <li><strong className="text-foreground">📝 Content:</strong> Article library and management</li>
                    <li><strong className="text-foreground">📅 Planner:</strong> Content calendar and scheduling</li>
                    <li><strong className="text-foreground">🔗 Linking:</strong> Internal link management</li>
                    <li><strong className="text-foreground">🎯 Backlinks:</strong> Backlink campaigns</li>
                    <li><strong className="text-foreground">📊 Analytics:</strong> Performance tracking</li>
                    <li><strong className="text-foreground">🔌 Integrations:</strong> Connected platforms</li>
                    <li><strong className="text-foreground">⚙️ Settings:</strong> Account configuration</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Pro Tips for Dashboard Usage
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <ul className="ml-6 space-y-3">
                  <li><strong className="text-foreground">Check Daily Analytics:</strong> Monitor your content performance trends</li>
                  <li><strong className="text-foreground">Use Filters:</strong> Quickly find specific articles or data</li>
                  <li><strong className="text-foreground">Set Up Autopilot:</strong> Let Ranklite handle routine content generation</li>
                  <li><strong className="text-foreground">Review Link Suggestions:</strong> Improve SEO with strategic internal linking</li>
                  <li><strong className="text-foreground">Schedule Content:</strong> Maintain consistency with planned publishing</li>
                </ul>
              </div>
            </section>

            <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-8">
              <h2 className="mb-4 font-display text-[24px] font-semibold text-foreground">Next Steps</h2>
              <div className="space-y-3">
                <Link href="/docs/first-article" className="block rounded-lg border border-border bg-white p-4 text-[16px] font-medium text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  → Create your first article
                </Link>
                <Link href="/docs/account-setup" className="block rounded-lg border border-border bg-white p-4 text-[16px] font-medium text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  → Complete account setup
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
