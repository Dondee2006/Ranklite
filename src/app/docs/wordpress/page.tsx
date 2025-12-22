import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Plug, Download, Settings, CheckCircle, ChevronRight, AlertCircle } from "lucide-react";
import Link from "next/link";

const features = [
  "Automatic content publishing to WordPress",
  "Custom post types and taxonomies support",
  "Featured image optimization",
  "SEO metadata synchronization",
  "Scheduled publishing",
  "Category and tag management",
];

const steps = [
  {
    number: 1,
    title: "Install the Plugin",
    description: "Download and install the Ranklite WordPress plugin from the WordPress plugin repository or upload it manually.",
    icon: Download,
  },
  {
    number: 2,
    title: "Connect Your Account",
    description: "Navigate to Settings > Ranklite in your WordPress dashboard and enter your API key to connect your Ranklite account.",
    icon: Plug,
  },
  {
    number: 3,
    title: "Configure Settings",
    description: "Set your publishing preferences, default categories, author settings, and post format options.",
    icon: Settings,
  },
  {
    number: 4,
    title: "Start Publishing",
    description: "Your Ranklite articles will now automatically publish to WordPress based on your configured settings.",
    icon: CheckCircle,
  },
];

export default function WordPressDocsPage() {
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
            WordPress Integration
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Automatically publish your Ranklite-generated content directly to your WordPress site. No manual copying and pasting required.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">What You&apos;ll Get</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
                <span className="text-[15px] text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Setup Guide</h2>
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[18px] font-bold text-white shadow-md shadow-green-500/20">
                  {step.number}
                </div>
                <div className="flex-1">
                  <div className="mb-4 flex items-center gap-3">
                    <step.icon className="h-6 w-6 text-[#22C55E]" />
                    <h3 className="font-display text-[22px] font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-[16px] leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Plugin Installation</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Method 1: WordPress Repository</h3>
              <ol className="list-decimal space-y-2 pl-6 text-[15px] text-muted-foreground">
                <li>Go to Plugins &gt; Add New in your WordPress dashboard</li>
                <li>Search for &quot;Ranklite&quot;</li>
                <li>Click &quot;Install Now&quot; and then &quot;Activate&quot;</li>
              </ol>
            </div>
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Method 2: Manual Upload</h3>
              <ol className="list-decimal space-y-2 pl-6 text-[15px] text-muted-foreground">
                <li>
                  Download the plugin from{" "}
                  <a href="https://downloads.ranklite.com/wordpress-plugin.zip" className="text-[#22C55E] hover:underline">
                    downloads.ranklite.com
                  </a>
                </li>
                <li>Go to Plugins &gt; Add New &gt; Upload Plugin</li>
                <li>Choose the downloaded ZIP file and click &quot;Install Now&quot;</li>
                <li>Activate the plugin</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Configuration</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Getting Your API Key</h3>
              <p className="mb-3 text-[15px] text-muted-foreground">
                Your API key is required to connect WordPress with Ranklite:
              </p>
              <ol className="list-decimal space-y-2 pl-6 text-[15px] text-muted-foreground">
                <li>
                  Log in to your{" "}
                  <Link href="/dashboard" className="text-[#22C55E] hover:underline">
                    Ranklite dashboard
                  </Link>
                </li>
                <li>Navigate to Settings &gt; API Keys</li>
                <li>Click &quot;Generate New Key&quot; and copy it</li>
                <li>Paste the key in Settings &gt; Ranklite in your WordPress dashboard</li>
              </ol>
            </div>
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Publishing Settings</h3>
              <div className="rounded-lg bg-slate-50 p-4">
                <ul className="space-y-2 text-[14px] text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Default Status:</strong> Choose between Draft, Pending Review, or Publish
                  </li>
                  <li>
                    <strong className="text-foreground">Default Author:</strong> Select which WordPress user should be the author
                  </li>
                  <li>
                    <strong className="text-foreground">Categories:</strong> Map Ranklite topics to WordPress categories
                  </li>
                  <li>
                    <strong className="text-foreground">Featured Images:</strong> Enable automatic featured image setting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Troubleshooting</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">Plugin not connecting?</h3>
              <p className="text-[14px] text-muted-foreground">
                Make sure your API key is correct and that your WordPress site can make outbound HTTPS connections. Check with your hosting provider if you&apos;re behind a firewall.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">Articles not publishing?</h3>
              <p className="text-[14px] text-muted-foreground">
                Verify that the WordPress user associated with the plugin has permission to publish posts. Check Settings &gt; Ranklite &gt; Logs for detailed error messages.
              </p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">Images not appearing?</h3>
              <p className="text-[14px] text-muted-foreground">
                Ensure your WordPress media library has sufficient storage space and that the uploads directory is writable. Check your PHP upload_max_filesize setting.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 text-[18px] font-semibold text-blue-900">Need Help?</h3>
              <p className="mb-4 text-[15px] leading-relaxed text-blue-800">
                If you&apos;re experiencing issues with the WordPress integration, our support team is here to help.
              </p>
              <a
                href="mailto:support@ranklite.com"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
