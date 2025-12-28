import Link from "next/link";
import { Send, Twitter, Linkedin, Github } from "lucide-react";

const productLinks = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#howitworks" },
  { label: "Backlink Exchange", href: "/dashboard/backlink-exchange" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Integrations", href: "/integrations" },
];

const resourceLinks = [
  { label: "Free SEO Tools", href: "/tools" },
  { label: "Keyword Generator", href: "/tools/keyword-generator" },
  { label: "Content Brief", href: "/tools/content-brief" },
  { label: "SEO Title Generator", href: "/tools/seo-title" },
  { label: "Article Summarizer", href: "/tools/summarizer" },
];

const documentationLinks = [
  { label: "Getting Started", href: "/docs" },
  { label: "API Reference", href: "/docs/api" },
  { label: "WordPress Plugin", href: "/docs/wordpress" },
  { label: "Webhooks", href: "/docs/webhooks" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "Affiliate Program", href: "/affiliate" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];

function RankliteLogo() {
  return (
    <span className="text-[28px] font-bold tracking-tight text-[#22C55E]" style={{ fontFamily: "var(--font-display)" }}>
      Ranklite
    </span>
  );
}

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-gradient-to-b from-white to-[#FAFFFE]">
      <div className="pointer-events-none absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-[#DCFCE7] opacity-30 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-48 w-48 rounded-full bg-[#D1FAE5] opacity-20 blur-3xl" />

      <div className="container relative mx-auto px-5 pb-10 pt-16 md:px-8 md:pb-12 md:pt-20">
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-16 xl:gap-24">
          <div className="flex shrink-0 flex-col items-start gap-6 lg:w-[260px]">
            <Link href="/" className="block">
              <RankliteLogo />
            </Link>
            <p className="text-[15px] leading-relaxed text-muted-foreground">
              Build Organic Traffic On Autopilot
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: Twitter, href: "https://twitter.com/ranklite", label: "Twitter" },
                { icon: Linkedin, href: "https://linkedin.com/company/ranklite", label: "LinkedIn" },
                { icon: Github, href: "https://github.com/ranklite", label: "GitHub" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-white text-muted-foreground transition-all hover:border-[#22C55E]/30 hover:bg-[#F0FDF4] hover:text-[#22C55E]"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-8 sm:grid-cols-4 md:gap-y-10">
            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-foreground">Product</h4>
              <ul className="flex flex-col gap-3">
                {productLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-foreground">Resources</h4>
              <ul className="flex flex-col gap-3">
                {resourceLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-foreground">Docs</h4>
              <ul className="flex flex-col gap-3">
                {documentationLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="text-[14px] font-semibold text-foreground">Company</h4>
              <ul className="flex flex-col gap-3">
                {companyLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-[14px] text-muted-foreground">
            © 2025 Ranklite. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-[14px] text-muted-foreground">
            <Link href="/terms" className="transition-colors hover:text-foreground">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-foreground">Privacy</Link>
            <Link href="/cookies" className="transition-colors hover:text-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}