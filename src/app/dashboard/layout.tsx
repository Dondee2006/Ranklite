"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  RefreshCw,
  FileText,
  Link2,
  ShieldCheck,
  TrendingUp,
  FileBarChart,
  Plug,
  Settings,
  Flag,
  ClipboardList,
  LogOut,
  CreditCard,
  Calendar,
  Globe,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV_SECTIONS = [
  {
    id: "overview",
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", href: "/dashboard/overview", icon: LayoutDashboard },
    ],
  },
  {
    id: "seo-engine",
    label: "SEO ENGINE",
    items: [
      { id: "content-planner", label: "Content Planner", href: "/dashboard/content-planner", icon: Calendar },
      { id: "content", label: "Content", href: "/dashboard/content", icon: FileText },
      { id: "authority-exchange", label: "Authority Exchange", href: "/dashboard/authority-exchange", icon: Link2 },
      { id: "qa-validation", label: "QA & Validation", href: "/dashboard/qa-validation", icon: ShieldCheck },
    ],
  },
  {
    id: "performance",
    label: "PERFORMANCE",
    items: [
      { id: "performance", label: "Performance", href: "/dashboard/performance", icon: TrendingUp },
      { id: "reports", label: "Reports", href: "/dashboard/reports", icon: FileBarChart },
    ],
  },
  {
    id: "resources",
    label: "RESOURCES",
    items: [
      { id: "integrations", label: "Integrations", href: "/dashboard/integrations", icon: Plug },
    ],
  },
  {
    id: "configuration",
    label: "CONFIGURATION",
    items: [
      { id: "settings", label: "Settings", href: "/dashboard/settings", icon: Settings },
      { id: "article-settings", label: "Article Settings", href: "/dashboard/articles-settings", icon: FileText },
      { id: "billing", label: "Billing 💳", href: "/dashboard/billing", icon: CreditCard },
      { id: "feature-flags", label: "Feature Flags", href: "/dashboard/feature-flags", icon: Flag },
    ],
  },
  {
    id: "audit",
    label: "AUDIT",
    items: [
      { id: "audit-logs", label: "Audit Logs", href: "/dashboard/audit-logs", icon: ClipboardList },
    ],
  },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [userEmail, setUserEmail] = useState("");
  const [websiteName, setWebsiteName] = useState("Website");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [faviconError, setFaviconError] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");

        // Fetch website data
        const { data: siteData } = await supabase
          .from("sites")
          .select("name, website_url")
          .eq("user_id", user.id)
          .single();

        if (siteData) {
          setWebsiteName(siteData.name || "Website");
          setWebsiteUrl(siteData.website_url || "");
        }

        // --- PAYMENT WALL CHECK ---
        const ADMIN_EMAILS = ["dondorian7@gmail.com"]; // Matches your bypass
        const isAdmin = ADMIN_EMAILS.includes(user.email || "");

        if (isAdmin) {
          setIsAuthorized(true);
        } else {
          const { data: userPlan } = await supabase
            .from("user_plans")
            .select("status, current_period_end")
            .eq("user_id", user.id)
            .single();

          const hasActivePlan = userPlan &&
            userPlan.status === "active" &&
            new Date(userPlan.current_period_end) > new Date();

          if (!hasActivePlan && pathname !== "/dashboard/billing") {
            setIsAuthorized(false);
            router.push("/dashboard/billing");
          } else {
            setIsAuthorized(true);
          }
        }
      } else {
        router.push("/login");
      }
    }
    loadUserData();
  }, [supabase, pathname, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white rounded-md shadow-md border border-[#E5E5E5]"
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      <aside className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col bg-white border-r border-[#E5E5E5] transition-transform",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            {websiteName.toLowerCase().includes("ranklite") || (websiteUrl && websiteUrl.includes("ranklite")) ? (
              <img
                src="/icon.svg"
                alt="Ranklite"
                className="h-7 w-7 rounded-md"
              />
            ) : websiteUrl && !faviconError ? (
              <img
                src={`https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=128`}
                alt={websiteName}
                className="h-7 w-7 rounded-md"
                onError={() => setFaviconError(true)}
              />
            ) : (
              <div className="h-7 w-7 rounded-md bg-[#10B981] flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {websiteName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-semibold text-[#1A1A1A] truncate max-w-[100px]">
              {websiteName}
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section) => (
            <div key={section.id} className="mb-6">
              <div className="px-2 mb-2">
                <span className="text-[10px] font-semibold text-[#6B7280] tracking-wider">
                  {section.label}
                </span>
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive(item.href)
                        ? "bg-white text-[#1A1A1A] font-medium shadow-sm"
                        : "text-[#6B7280] hover:text-[#1A1A1A] hover:bg-white/50"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-[#E5E5E5] p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] text-xs font-semibold text-white flex-shrink-0">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs text-[#6B7280] truncate">{userEmail.split('@')[0]}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1 text-[#6B7280] hover:text-[#DC2626] hover:bg-red-50 rounded transition-colors flex-shrink-0"
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <main className="lg:ml-[200px] flex-1 w-full relative">
        {isAuthorized === null ? (
          <div className="flex h-full items-center justify-center">
            <RefreshCw className="h-8 w-8 text-[#10B981] animate-spin" />
          </div>
        ) : !isAuthorized && pathname !== "/dashboard/billing" ? (
          <div className="flex h-full items-center justify-center bg-white/80 backdrop-blur-sm z-[100]">
            <div className="text-center animate-in fade-in duration-500">
              <CreditCard className="mx-auto h-12 w-12 text-[#10B981] mb-4" />
              <h2 className="text-xl font-bold text-gray-900">Subscription Required</h2>
              <p className="text-gray-500 mt-2">Redirecting to billing...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}