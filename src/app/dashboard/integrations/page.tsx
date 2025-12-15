"use client";

import { useState, useEffect } from "react";
import { Plug, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface Integration {
  id: string;
  name: string;
  status: "Connected" | "Not connected";
  last_sync: string | null;
  icon: string;
}

const INTEGRATIONS: Integration[] = [
  { 
    id: "wordpress", 
    name: "WordPress", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-7-1765757064664.png?width=8000&height=8000&resize=contain" 
  },
  { 
    id: "webflow", 
    name: "Webflow", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-5-1765757166640.png?width=8000&height=8000&resize=contain" 
  },
  { 
    id: "shopify", 
    name: "Shopify", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Shopify-Emblem-1765757016807.png?width=8000&height=8000&resize=contain" 
  },
  { 
    id: "notion", 
    name: "Notion", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Notion-Logo-PNG-File-1765757016853.png?width=8000&height=8000&resize=contain" 
  },
  { 
    id: "wix", 
    name: "Wix", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/wix-logo_brandlogos.net_w0pfv-512x512-1765757027629.png?width=8000&height=8000&resize=contain" 
  },
  { 
    id: "framer", 
    name: "Framer", 
    status: "Not connected", 
    last_sync: null, 
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-6-1765757064675.png?width=8000&height=8000&resize=contain" 
  },
  { id: "gsc", name: "Google Search Console", status: "Not connected", last_sync: null, icon: "🔍" },
  { id: "ga", name: "Google Analytics", status: "Not connected", last_sync: null, icon: "📊" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <h1 className="text-2xl font-semibold text-[#1A1A1A]">Integrations</h1>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Integration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Last Sync
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E5E5]">
                {integrations.map((integration) => (
                  <tr key={integration.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {integration.icon.startsWith('http') ? (
                          <div className={cn(
                            "relative flex-shrink-0",
                            integration.id === "notion" || integration.id === "shopify" 
                              ? "w-10 h-10" 
                              : "w-8 h-8"
                          )}>
                            <Image 
                              src={integration.icon} 
                              alt={integration.name}
                              fill
                              sizes="(max-width: 768px) 40px, 40px"
                              className="object-contain"
                            />
                          </div>
                        ) : (
                          <span className="text-2xl">{integration.icon}</span>
                        )}
                        <span className="text-sm font-medium text-[#1A1A1A]">{integration.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium",
                        integration.status === "Connected"
                          ? "bg-[#D1FAE5] text-[#065F46]"
                          : "bg-[#F3F4F6] text-[#6B7280]"
                      )}>
                        {integration.status === "Connected" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {integration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#6B7280]">
                        {integration.last_sync || "Never"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {integration.status === "Connected" ? (
                          <>
                            <button className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]">
                              Test
                            </button>
                            <button className="text-sm font-medium text-[#DC2626] hover:text-[#991B1B]">
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF]">
                            Connect
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}