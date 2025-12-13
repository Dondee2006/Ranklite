import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { CheckCircle2 } from "lucide-react";

const integrations = [
  {
    name: "WordPress",
    description: "Publish content directly to your WordPress site with our seamless integration.",
    logo: "bg-[#21759B]",
    category: "CMS",
    features: ["Auto-publish", "Custom post types", "Categories & tags"],
  },
  {
    name: "Webflow",
    description: "Sync your AI-generated content with Webflow CMS collections.",
    logo: "bg-[#4353FF]",
    category: "CMS",
    features: ["CMS integration", "Dynamic content", "Custom fields"],
  },
  {
    name: "Shopify",
    description: "Create SEO-optimized product descriptions and blog posts for your Shopify store.",
    logo: "bg-[#96BF48]",
    category: "E-commerce",
    features: ["Product descriptions", "Blog posts", "Meta optimization"],
  },
  {
    name: "Notion",
    description: "Export your content to Notion databases for easy collaboration.",
    logo: "bg-[#000000]",
    category: "Productivity",
    features: ["Database sync", "Templates", "Collaboration"],
  },
  {
    name: "Wix",
    description: "Publish AI-generated content to your Wix blog and pages.",
    logo: "bg-[#0C6EFC]",
    category: "CMS",
    features: ["Blog integration", "Page builder", "SEO tools"],
  },
  {
    name: "Google Search Console",
    description: "Analyze search performance and generate content based on real data.",
    logo: "bg-[#4285F4]",
    category: "Analytics",
    features: ["Search data", "Keyword insights", "Performance tracking"],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            Powerful{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Integrations
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            Connect Ranklite with your favorite tools and platforms to streamline your content workflow.
          </p>
        </div>

        <div className="mb-12 flex flex-wrap items-center justify-center gap-3">
          {["All", "CMS", "E-commerce", "Analytics", "Productivity"].map((category) => (
            <button
              key={category}
              className={`rounded-full border px-5 py-2 text-[14px] font-medium transition-all ${
                category === "All"
                  ? "border-[#22C55E] bg-[#F0FDF4] text-[#22C55E]"
                  : "border-border bg-white text-muted-foreground hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => (
            <div
              key={integration.name}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-4 border-b border-border p-6">
                <div
                  className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${integration.logo} text-white shadow-md`}
                >
                  <span className="text-[18px] font-bold">{integration.name[0]}</span>
                </div>
                <div>
                  <h3 className="font-display text-[20px] font-semibold text-foreground">{integration.name}</h3>
                  <div className="mt-1 inline-flex rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-[12px] font-medium text-[#22C55E]">
                    {integration.category}
                  </div>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <p className="mb-4 text-[15px] leading-relaxed text-muted-foreground">{integration.description}</p>
                <div className="mb-4 space-y-2">
                  {integration.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-[14px] text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#22C55E]" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button className="mt-auto rounded-xl border border-border bg-white px-6 py-2.5 text-[14px] font-semibold text-foreground transition-all hover:border-[#22C55E] hover:bg-[#F0FDF4] hover:text-[#22C55E]">
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-12 text-center">
          <h2 className="mb-4 font-display text-[32px] font-bold text-foreground">Need a Custom Integration?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[17px] leading-relaxed text-muted-foreground">
            We're constantly adding new integrations. Let us know which tools you'd like to connect with Ranklite.
          </p>
          <a
            href="mailto:integrations@ranklite.com?subject=Integration Request"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] px-8 py-4 text-[16px] font-semibold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Request Integration
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
