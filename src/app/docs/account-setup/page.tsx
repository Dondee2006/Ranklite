import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ArrowLeft, Settings, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function AccountSetupPage() {
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
              8 min read
            </div>
            <h1 className="mb-6 font-display text-[48px] font-bold leading-[1.1] tracking-tight text-foreground">
              Account Setup Guide
            </h1>
            <p className="text-[20px] leading-relaxed text-muted-foreground">
              Configure your Ranklite account for optimal performance. This guide covers everything from basic profile setup to advanced content preferences and billing management.
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">1</span>
                Profile Information
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Navigate to <strong className="text-foreground">Settings → Profile</strong> to update:
                </p>
                <ul className="ml-6 space-y-2">
                  <li><strong className="text-foreground">Name:</strong> Your display name across the platform</li>
                  <li><strong className="text-foreground">Email:</strong> Primary email for notifications and login</li>
                  <li><strong className="text-foreground">Company Name:</strong> Optional, for team accounts</li>
                  <li><strong className="text-foreground">Profile Picture:</strong> Upload a custom avatar</li>
                  <li><strong className="text-foreground">Timezone:</strong> Set your local timezone for scheduling</li>
                </ul>
                <div className="mt-4 rounded-xl bg-[#F0FDF4] p-4">
                  <p className="text-[16px]">
                    <strong className="text-foreground">💡 Tip:</strong> Setting the correct timezone ensures your scheduled content publishes at the right time for your audience.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">2</span>
                Website Configuration
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Set up your website details in <strong className="text-foreground">Settings → Sites</strong>:
                </p>
                
                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[20px] font-semibold text-foreground">Basic Information</h3>
                  <ul className="space-y-2">
                    <li><strong className="text-foreground">Website URL:</strong> Your site's primary domain</li>
                    <li><strong className="text-foreground">Site Name:</strong> Display name for this website</li>
                    <li><strong className="text-foreground">Description:</strong> Brief overview of your site's purpose</li>
                    <li><strong className="text-foreground">Language:</strong> Primary content language</li>
                  </ul>
                </div>

                <div className="rounded-xl border border-border bg-white p-6">
                  <h3 className="mb-3 text-[20px] font-semibold text-foreground">Content Preferences</h3>
                  <ul className="space-y-2">
                    <li><strong className="text-foreground">Niche/Category:</strong> Your content focus area</li>
                    <li><strong className="text-foreground">Target Audience:</strong> Demographics and expertise level</li>
                    <li><strong className="text-foreground">Writing Tone:</strong> Default voice for content</li>
                    <li><strong className="text-foreground">Keywords:</strong> Primary topics and target keywords</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">3</span>
                Content Settings
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Customize how Ranklite generates content in <strong className="text-foreground">Settings → Content</strong>:
                </p>

                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-3 text-[20px] font-semibold text-foreground">Default Article Settings</h3>
                    <ul className="space-y-2 text-[16px]">
                      <li><strong className="text-foreground">Default Length:</strong> Preferred word count range</li>
                      <li><strong className="text-foreground">Tone of Voice:</strong> Professional, casual, etc.</li>
                      <li><strong className="text-foreground">Include Images:</strong> Auto-suggest featured images</li>
                      <li><strong className="text-foreground">Internal Linking:</strong> Enable automatic link suggestions</li>
                      <li><strong className="text-foreground">Meta Descriptions:</strong> Auto-generate SEO metadata</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-3 text-[20px] font-semibold text-foreground">SEO Preferences</h3>
                    <ul className="space-y-2 text-[16px]">
                      <li><strong className="text-foreground">Focus Keywords:</strong> Primary SEO targets</li>
                      <li><strong className="text-foreground">Heading Structure:</strong> H2/H3 distribution preference</li>
                      <li><strong className="text-foreground">Keyword Density:</strong> Target percentage (1-3% recommended)</li>
                      <li><strong className="text-foreground">Related Keywords:</strong> Include LSI keywords</li>
                    </ul>
                  </div>

                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-3 text-[20px] font-semibold text-foreground">Brand Guidelines</h3>
                    <ul className="space-y-2 text-[16px]">
                      <li><strong className="text-foreground">Brand Voice:</strong> Specific terms and phrases to use</li>
                      <li><strong className="text-foreground">Avoid List:</strong> Words or topics to exclude</li>
                      <li><strong className="text-foreground">Required Elements:</strong> CTAs, disclaimers, etc.</li>
                      <li><strong className="text-foreground">Style Guide URL:</strong> Link to your brand guidelines</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">4</span>
                Notifications
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Manage your notification preferences in <strong className="text-foreground">Settings → Notifications</strong>:
                </p>
                <div className="rounded-xl border border-border bg-white p-6">
                  <ul className="space-y-3 text-[16px]">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <div>
                        <strong className="text-foreground">Content Generation:</strong> Get notified when articles are ready
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <div>
                        <strong className="text-foreground">Publishing Status:</strong> Confirmation when content goes live
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <div>
                        <strong className="text-foreground">Performance Updates:</strong> Weekly analytics summaries
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <div>
                        <strong className="text-foreground">Integration Alerts:</strong> CMS connection issues
                      </div>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                      <div>
                        <strong className="text-foreground">Billing Notices:</strong> Payment and subscription updates
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">5</span>
                Billing & Subscription
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Manage your subscription in <strong className="text-foreground">Settings → Billing</strong>:
                </p>
                <ul className="ml-6 space-y-2">
                  <li><strong className="text-foreground">Plan Selection:</strong> Choose or upgrade your plan</li>
                  <li><strong className="text-foreground">Payment Method:</strong> Add or update credit cards</li>
                  <li><strong className="text-foreground">Billing History:</strong> View past invoices</li>
                  <li><strong className="text-foreground">Usage Metrics:</strong> Track article generation limits</li>
                  <li><strong className="text-foreground">Auto-Renewal:</strong> Configure subscription renewal settings</li>
                </ul>
                <div className="mt-4 rounded-xl bg-[#F0FDF4] p-4">
                  <p className="text-[16px]">
                    <strong className="text-foreground">💡 Note:</strong> You can upgrade or downgrade at any time. Changes take effect on your next billing cycle.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="mb-6 flex items-center gap-3 font-display text-[32px] font-semibold text-foreground">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#22C55E] text-[18px] font-bold text-white">6</span>
                Security Settings
              </h2>
              <div className="space-y-4 text-[17px] leading-relaxed text-muted-foreground">
                <p>
                  Protect your account in <strong className="text-foreground">Settings → Security</strong>:
                </p>
                <div className="space-y-4">
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Password Management</h3>
                    <p className="text-[16px]">
                      Update your password regularly. Use a strong combination of letters, numbers, and symbols.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Two-Factor Authentication</h3>
                    <p className="text-[16px]">
                      Enable 2FA for an extra layer of security. We support authenticator apps and SMS verification.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">Active Sessions</h3>
                    <p className="text-[16px]">
                      View and manage devices logged into your account. Revoke access from unrecognized devices.
                    </p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-6">
                    <h3 className="mb-2 text-[18px] font-semibold text-foreground">API Keys</h3>
                    <p className="text-[16px]">
                      Generate and manage API keys for custom integrations. Keep these private and rotate regularly.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-8">
              <h2 className="mb-4 font-display text-[24px] font-semibold text-foreground">Setup Checklist</h2>
              <ul className="space-y-2 text-[16px] text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Complete profile information</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Add your website and configure preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Set up default content settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Configure notification preferences</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Enable two-factor authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#22C55E]" />
                  <span>Connect your CMS integration</span>
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
