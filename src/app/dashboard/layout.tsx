"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Settings,
  FileText,
  Calendar,
  History,
  Sliders,
  Link2,
  ArrowLeftRight,
  Wrench,
  Sparkles,
  Users,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  Sun,
  Pencil,
  Send,
  LogOut,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  {
    id: "site-selector",
    type: "site-selector",
  },
  {
    id: "general-settings",
    label: "General Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    id: "articles",
    label: "Articles",
    icon: FileText,
    expandable: true,
    children: [
      { id: "content-planner", label: "Content Planner", href: "/dashboard/content-planner", icon: Calendar },
      { id: "content-history", label: "Content History", href: "/dashboard/content-history", icon: History },
      { id: "articles-settings", label: "Articles Settings", href: "/dashboard/articles-settings", icon: Sliders },
      { id: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Link2 },
      { id: "linking-config", label: "Linking Configuration", href: "/dashboard/linking-configuration", icon: LinkIcon },
      { id: "backlink-generator", label: "Backlink Generator", href: "/dashboard/backlink-generator", icon: ArrowLeftRight },
    ],
  },
  {
    id: "seo-tools",
    label: "SEO Tools",
    href: "/dashboard/seo-tools",
    icon: Wrench,
    badge: "Beta",
  },
  {
    id: "add-ons",
    label: "Add-ons",
    icon: Sparkles,
    expandable: true,
    children: [
      { id: "human-curated", label: "Human Curated Service", href: "/dashboard/human-curated", icon: Users, badge: "Beta" },
      { id: "backlinks", label: "Get 350+ Backlinks", href: "/dashboard/backlinks", icon: LinkIcon },
    ],
  },
];

function getWebsiteLogo(url: string): string {
  if (!url) return "";
  const domain = url.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function RankliteLogo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-md shadow-green-500/20">
        <Send className="h-3.5 w-3.5 text-white" />
        <div className="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-[#10B981] ring-2 ring-white" />
      </div>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Ranklite
      </span>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [expandedSections, setExpandedSections] = useState<string[]>(["articles", "add-ons"]);
  const [userEmail, setUserEmail] = useState("");
  const [siteName, setSiteName] = useState("My Site");
  const [siteUrl, setSiteUrl] = useState("");
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
      }

      try {
        const response = await fetch("/api/sites");
        const data = await response.json();
        if (data.site) {
          setSiteName(data.site.name || "My Site");
          setSiteUrl(data.site.url || "");
        }
      } catch (error) {
        console.error("Failed to load site:", error);
      }
    }
    loadUserData();
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-border bg-white">
        <div className="flex items-center justify-between px-5 py-4">
          <Link href="/dashboard">
            <RankliteLogo />
          </Link>
          <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-gray-100">
            <Sun className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3">
          <button className="flex w-full items-center justify-between rounded-xl bg-white border border-border px-3 py-2.5 text-left hover:bg-gray-50">
            <div className="flex items-center gap-2">
              {siteUrl && !logoError ? (
                <img
                  src={getWebsiteLogo(siteUrl)}
                  alt=""
                  className="h-6 w-6 rounded"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-bold text-gray-600">
                  {siteName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="text-sm font-medium text-foreground">{siteName}</div>
                <div className="text-xs text-muted-foreground">{siteUrl || "No website set"}</div>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <nav className="mt-4 flex-1 overflow-y-auto px-3">
          {NAV_ITEMS.filter(item => item.type !== "site-selector").map((item) => (
            <div key={item.id}>
              {item.expandable ? (
                <>
                  <button
                    onClick={() => toggleSection(item.id)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-4 w-4 text-muted-foreground" />}
                      {item.label}
                    </div>
                    {expandedSections.includes(item.id) ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {expandedSections.includes(item.id) && item.children && (
                    <div className="ml-4 space-y-0.5">
                      {item.children.map((child) => (
                        <Link
                          key={child.id}
                          href={child.href}
                          className={cn(
                            "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                            isActive(child.href)
                              ? "bg-[#F0FDF4] font-medium text-[#16A34A]"
                              : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            {child.icon && <child.icon className="h-4 w-4" />}
                            {child.label}
                          </div>
                          {child.badge && (
                            <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={item.href || "#" }
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive(item.href || "")
                      ? "bg-[#F0FDF4] font-medium text-[#16A34A]"
                      : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {item.icon && <item.icon className="h-4 w-4" />}
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <Button className="w-full justify-center gap-2 rounded-xl border-2 border-[#F97316] bg-white py-5 text-[#F97316] hover:bg-orange-50">
            <Sparkles className="h-4 w-4" />
            Upgrade To Premium
          </Button>
        </div>

        <div className="border-t border-border px-5 py-3">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              <span><strong className="font-semibold text-foreground">30</strong> Articles/mo</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LinkIcon className="h-3.5 w-3.5" />
              <span><strong className="font-semibold text-foreground">216</strong> Backlink Credits</span>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-3">
          <div className="flex items-center justify-between rounded-lg px-2 py-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#22C55E] text-sm font-medium text-white">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-foreground truncate max-w-[120px]">{userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="ml-[260px] flex-1">
        {children}
      </main>
    </div>
  );
}