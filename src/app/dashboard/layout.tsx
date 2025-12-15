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
      { id: "seo-cycle", label: "SEO Cycle", href: "/dashboard/seo-cycle", icon: RefreshCw },
      { id: "content-planner", label: "Content Planner", href: "/dashboard/content-planner", icon: Calendar },
      { id: "content", label: "Content", href: "/dashboard/content", icon: FileText },
      { id: "backlinks", label: "Backlinks", href: "/dashboard/backlinks", icon: Link2 },
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
      }
    }
    loadUserData();
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[200px] flex-col bg-[#F7F7F7] border-r border-[#E5E5E5]">
        <div className="flex items-center justify-between px-4 py-6 border-b border-[#E5E5E5]">
          <div className="flex items-center gap-2">
            {websiteUrl ? (
              <img 
                src={`https://www.google.com/s2/favicons?domain=${websiteUrl}&sz=128`}
                alt={websiteName}
                className="h-7 w-7 rounded-md"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={cn(
              "h-7 w-7 rounded-md bg-[#10B981] flex items-center justify-center",
              websiteUrl && "hidden"
            )}>
              <span className="text-white text-xs font-bold">
                {websiteName.charAt(0).toUpperCase()}
              </span>
            </div>
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
          <div className="mt-2 px-2 py-1 rounded-md bg-[#DBEAFE] text-center">
            <span className="text-[10px] font-medium text-[#1E40AF]">Superadmin</span>
          </div>
        </div>
      </aside>

      <main className="ml-[200px] flex-1">
        {children}
      </main>
    </div>
  );
}