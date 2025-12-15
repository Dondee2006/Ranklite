import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { CheckCircle2 } from "lucide-react";

const integrations = [
  {
    name: "WordPress",
    description: "Publish content directly to your WordPress site with our seamless integration.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.469 6.825c.84 1.537 1.318 3.3 1.318 5.175 0 3.979-2.156 7.456-5.363 9.325l3.295-9.527c.615-1.54.82-2.771.82-3.864 0-.405-.026-.78-.07-1.11m-7.981.105c.647-.03 1.232-.105 1.232-.105.582-.075.514-.93-.067-.899 0 0-1.755.135-2.88.135-1.064 0-2.85-.15-2.85-.15-.585-.03-.661.855-.075.885 0 0 .54.061 1.125.09l1.68 4.605-2.37 7.08L5.354 6.9c.649-.03 1.234-.1 1.234-.1.585-.064.516-.93-.065-.896 0 0-1.746.138-2.874.138-.2 0-.438-.008-.69-.015C5.911 3.15 8.235 1.215 11.4 1.215c2.353 0 4.494.903 6.084 2.388-.038-.008-.075-.015-.113-.015-1.046 0-1.787.909-1.787 1.887 0 .882.512 1.617 1.046 2.482.405.705.878 1.592.878 2.891 0 .903-.346 1.962-.955 3.428l-1.254 4.178-4.553-13.556zm-2.79 14.97c-.358.12-.73.226-1.113.32L6.227 11.27l-.015-.045c.1-.195.195-.39.3-.584l3.39 9.29zm9.302-9.3c0 1.188-.225 2.526-.899 4.192l-3.616 10.45c3.523-2.055 5.89-5.894 5.89-10.274 0-1.65-.338-3.22-.95-4.65l.576 1.282z"/>
      </svg>
    ),
    category: "CMS",
    features: ["Auto-publish", "Custom post types", "Categories & tags"],
  },
  {
    name: "Webflow",
    description: "Sync your AI-generated content with Webflow CMS collections.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 7.582c0-1.424-1.029-2.095-2.427-1.424l-1.919 1.424-1.919-1.424c-1.398-.671-2.427 0-2.427 1.424v9.836c0 1.424 1.029 2.095 2.427 1.424l1.919-1.424 1.919 1.424c1.398.671 2.427 0 2.427-1.424V7.582zM11.47 6.158L9.551 12.06 7.632 6.158c-.287-1.005-.767-1.299-1.534-1.299-.958 0-1.534.294-1.821 1.299L2.358 12.06.439 6.158C.152 5.153-.232 4.859-1 4.859c-.767 0-1 .294-1 .588v.882c0 .294.096.588.192.882l2.94 9.542c.287 1.005.767 1.299 1.534 1.299.958 0 1.534-.294 1.821-1.299l1.919-5.902 1.919 5.902c.287 1.005.863 1.299 1.821 1.299.767 0 1.247-.294 1.534-1.299l2.94-9.542c.096-.294.192-.588.192-.882v-.882c0-.294-.233-.588-1-.588-.768 0-1.152.294-1.439 1.299z"/>
      </svg>
    ),
    category: "CMS",
    features: ["CMS integration", "Dynamic content", "Custom fields"],
  },
  {
    name: "Shopify",
    description: "Create SEO-optimized product descriptions and blog posts for your Shopify store.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.337 2.783c-.137-.005-1.358-.027-1.358-.027s-1.135-1.099-1.285-1.249c-.149-.149-.438-.106-.552-.074 0 0-.096.03-.254.08-.456-1.32-1.253-2.513-2.666-2.513-.048 0-.098.005-.149.01C8.83-.356 8.438 0 8.056.58c-.545.83-.964 2.09-1.115 2.95-.936.287-1.592.488-1.682.516-.563.176-.58.193-.653.726-.054.396-1.544 11.907-1.544 11.907l11.604 2.24L24 17.16S15.474 2.787 15.337 2.783zm-2.836.615l-1.257.391c.119-.458.348-1.028.627-1.517.383-.07.707-.026.96.073-.043.35-.172.742-.33 1.053zm-.96-2.166c.146 0 .284.029.414.08-.562.33-.955.805-1.254 1.535l-2.152.671c.328-1.237 1.127-2.214 2.992-2.286zm.257 4.08l-1.73.539s.043-1.724.192-2.57c.106-.602.327-1.085.6-1.435.348.405.654 1.147.938 3.466zM8.754 2.457c.094-.294.217-.588.363-.868.385-.74.916-1.195 1.545-1.297-.05.118-.095.243-.137.371-.268.807-.479 2.067-.479 3.597l-1.292.402z"/>
      </svg>
    ),
    category: "E-commerce",
    features: ["Product descriptions", "Blog posts", "Meta optimization"],
  },
  {
    name: "Notion",
    description: "Export your content to Notion databases for easy collaboration.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952l1.448.327s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.841-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
      </svg>
    ),
    category: "Productivity",
    features: ["Database sync", "Templates", "Collaboration"],
  },
  {
    name: "Wix",
    description: "Publish AI-generated content to your Wix blog and pages.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M13.856 10.402l-1.035-3.373c-.392-1.218-.621-2.177-.736-2.961-.07.557-.314 1.478-.728 2.763l-1.091 3.571h3.59zm6.966-6.639l-1.88 8.825c-.315 1.488-.582 2.697-.799 3.626-.196-.859-.458-1.994-.785-3.404l-1.529-6.609c-.098-.441-.379-.679-.839-.679h-1.492c-.37 0-.608.189-.707.553l-1.669 6.126c-.461 1.698-.766 2.982-.918 3.853-.152-.902-.45-2.225-.892-3.96l-1.826-8.518c-.055-.225-.311-.338-.563-.338H4.019c-.252 0-.392.113-.336.353l3.163 13.386c.056.24.323.353.575.353h1.492c.35 0 .588-.197.686-.566l1.858-6.74c.396-1.451.653-2.539.777-3.262.139.695.378 1.774.718 3.234l1.83 6.768c.084.369.323.566.673.566h1.492c.239 0 .505-.113.574-.353l3.163-13.386c.041-.24-.112-.353-.35-.353h-1.492c-.238 0-.435.113-.491.338z"/>
      </svg>
    ),
    category: "CMS",
    features: ["Blog integration", "Page builder", "SEO tools"],
  },
  {
    name: "Google Search Console",
    description: "Analyze search performance and generate content based on real data.",
    logo: (
      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm5.696 14.943c-1.747 2.52-5.197 3.174-7.715 1.427-2.52-1.747-3.174-5.197-1.427-7.715 1.747-2.52 5.197-3.174 7.715-1.427.488.338.912.743 1.267 1.196l-1.98 1.372c-.506-.73-1.348-1.21-2.31-1.21-1.54 0-2.79 1.25-2.79 2.79s1.25 2.79 2.79 2.79c1.23 0 2.272-.795 2.646-1.897h-2.646v-2.325h5.307c.07.37.105.75.105 1.14 0 2.312-1.006 4.388-2.66 5.85z"/>
      </svg>
    ),
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
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 shadow-md">
                  {integration.logo}
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