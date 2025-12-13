import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Sparkles, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function FirstArticlePage() {
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
              7 min read
            </div>
            <h1 className="mb-6 font-display text-[48px] font-bold leading-[1.1] tracking-tight text-foreground">
              Creating Your First Article
            </h1>
            <p className="text-[20px] leading-relaxed text-muted-foreground">
              Learn how to generate high-quality, SEO-optimized content with Ranklite's AI-powered article generator. This comprehensive guide covers everything from choosing topics to publishing your content.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-6 font-display text-[32px] font-semibold text-foreground">
                Understanding Article Generation
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Ranklite uses advanced AI to create articles that are:
                </p>
                <ul className="ml-6 space-y-2">
                  <li><strong className="text-foreground">SEO-Optimized:</strong> Built with proper keyword density, meta descriptions, and heading structure</li>
                  <li><strong className="text-foreground">Engaging:</strong> Written to captivate your target audience</li>
                  <li><strong className="text-foreground">Well-Researched:</strong> Backed by current information and data</li>
                  <li><strong className="text-foreground">Unique:</strong> Every article is original and passes plagiarism checks</li>
                </ul>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">1</span>
                Choose Your Topic
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  From your dashboard, click <strong className="text-foreground">"Create New Article"</strong>. You have several options for topic selection:
                </p>
                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-4 text-[20px] font-semibold text-foreground">Topic Input Methods</h3>
                  <ul className="space-y-3">
                    <li>
                      <strong className="text-foreground">Keyword:</strong> Enter a target keyword (e.g., "best coffee makers")
                    </li>
                    <li>
                      <strong className="text-foreground">Question:</strong> Pose a question your audience asks (e.g., "How to brew the perfect espresso?")
                    </li>
                    <li>
                      <strong className="text-foreground">Topic:</strong> Describe a general topic (e.g., "home coffee brewing techniques")
                    </li>
                    <li>
                      <strong className="text-foreground">GSC Integration:</strong> Import low-performing keywords from Google Search Console to create improvement content
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">2</span>
                Configure Article Settings
              </h2>
              <div className="space-y-6 text-[17px] leading-relaxed text-muted-foreground">
                <div>
                  <h3 className="mb-3 text-[20px] font-semibold text-foreground">Article Length</h3>
                  <p>Choose the appropriate length for your content goals:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li><strong className="text-foreground">Short (800-1200 words):</strong> Quick guides, news updates, product reviews</li>
                    <li><strong className="text-foreground">Medium (1500-2000 words):</strong> How-to guides, tutorials, listicles</li>
                    <li><strong className="text-foreground">Long (2500+ words):</strong> Comprehensive guides, pillar content, in-depth analysis</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-[20px] font-semibold text-foreground">Tone & Style</h3>
                  <p>Select the voice that matches your brand:</p>
                  <ul className="ml-6 mt-2 space-y-2">
                    <li><strong className="text-foreground">Professional:</strong> Formal, business-focused content</li>
                    <li><strong className="text-foreground">Casual:</strong> Friendly, conversational writing</li>
                    <li><strong className="text-foreground">Authoritative:</strong> Expert-level, technical content</li>
                    <li><strong className="text-foreground">Friendly:</strong> Approachable, warm communication</li>
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-[20px] font-semibold text-foreground">Target Audience</h3>
                  <p>
                    Specify who you're writing for. This helps the AI adjust complexity, terminology, and examples to match your readers' knowledge level.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">3</span>
                Generate & Review
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Click <strong className="text-foreground">"Generate Article"</strong> and watch the AI create your content in real-time. Generation typically takes 30-60 seconds.
                </p>
                <div className="rounded-xl bg-[#F0FDF4] p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-[#22C55E]" />
                    <h3 className="text-[18px] font-semibold text-foreground">What Gets Generated</h3>
                  </div>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <span>SEO-optimized title and meta description</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <span>Properly structured headings (H1, H2, H3)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <span>Well-researched, engaging content</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <span>Internal linking suggestions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <span>Featured image suggestions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">4</span>
                Edit & Customize
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Use our built-in editor to refine your content:
                </p>
                <ul className="ml-6 space-y-2">
                  <li>Make text edits directly in the editor</li>
                  <li>Regenerate specific sections if needed</li>
                  <li>Add or modify internal links</li>
                  <li>Upload custom images</li>
                  <li>Adjust SEO settings (title, meta description, slug)</li>
                </ul>
                <p>
                  The editor provides real-time SEO scoring to ensure your content meets best practices.
                </p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">5</span>
                Publish Your Content
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Once you're satisfied with your article, you have several publishing options:
                </p>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Direct Publishing</h3>
                    <p>
                      If you've connected your CMS, click "Publish Now" to send the article directly to your website as a published post.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Schedule Publishing</h3>
                    <p>
                      Choose a future date and time to automatically publish the article. Perfect for maintaining a consistent content calendar.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Save as Draft</h3>
                    <p>
                      Save the article to your CMS as a draft for manual review before publishing.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Export</h3>
                    <p>
                      Download the article as HTML, Markdown, or plain text to manually upload to your site.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-8">
              <h2 className="mb-4 font-display text-[24px] font-semibold text-foreground">Pro Tips</h2>
              <ul className="space-y-3 text-[16px] text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Always review AI-generated content for accuracy and brand alignment</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Use the internal linking feature to improve site structure and SEO</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Longer articles (1500+ words) tend to rank better for competitive keywords</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Add your own expertise and unique insights to stand out</span>
                </li>
              </ul>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
