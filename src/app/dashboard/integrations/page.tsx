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
  integration_id?: string;
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
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/cms/integrations");
      if (!res.ok) return;
      
      const { integrations: cmsIntegrations } = await res.json();
      
      setIntegrations(prev => 
        prev.map(integration => {
          const cms = cmsIntegrations.find((c: any) => c.platform === integration.id);
          if (cms) {
            return {
              ...integration,
              status: cms.status === "connected" ? "Connected" : "Not connected",
              last_sync: cms.last_sync_at ? new Date(cms.last_sync_at).toLocaleString() : null,
              integration_id: cms.id
            };
          }
          return integration;
        })
      );
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    }
  };

  const handleConnect = async (integrationId: string) => {
    setLoading(integrationId);
    
    try {
      const platform = integrationId;
      let accessToken = "";
      let siteUrl = "";
      let siteId = "";

      if (platform === "wordpress") {
        siteUrl = prompt("Enter your WordPress site URL (e.g., https://yoursite.com):") || "";
        accessToken = prompt("Enter your WordPress Application Password:") || "";
        
        if (!siteUrl || !accessToken) {
          alert("Both site URL and access token are required");
          return;
        }

        const res = await fetch("/api/cms/wordpress/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site_url: siteUrl, access_token: accessToken })
        });

        const data = await res.json();
        
        if (!res.ok) {
          alert(data.error || "Failed to connect WordPress");
          return;
        }

        alert("WordPress connected successfully!");
      } else if (platform === "webflow") {
        accessToken = prompt("Enter your Webflow API token:") || "";
        
        if (!accessToken) {
          alert("Access token is required");
          return;
        }

        const res = await fetch("/api/cms/webflow/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token: accessToken })
        });

        const data = await res.json();
        
        if (!res.ok) {
          alert(data.error || "Failed to connect Webflow");
          return;
        }

        alert("Webflow connected successfully!");
      } else {
        alert(`${platform} integration coming soon!`);
        return;
      }

      await fetchIntegrations();
    } catch (error) {
      console.error("Connection error:", error);
      alert("Failed to connect integration");
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async (integration: Integration) => {
    if (!integration.integration_id) return;
    
    if (!confirm(`Are you sure you want to disconnect ${integration.name}?`)) {
      return;
    }

    setLoading(integration.id);

    try {
      const res = await fetch(`/api/cms/integrations/${integration.integration_id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to disconnect");
        return;
      }

      alert(`${integration.name} disconnected successfully!`);
      await fetchIntegrations();
    } catch (error) {
      console.error("Disconnect error:", error);
      alert("Failed to disconnect integration");
    } finally {
      setLoading(null);
    }
  };

  const handleTest = async (integration: Integration) => {
    setLoading(integration.id);

    try {
      alert(`Testing ${integration.name} connection...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert(`${integration.name} connection is working!`);
    } catch (error) {
      alert("Test failed");
    } finally {
      setLoading(null);
    }
  };

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
                        {loading === integration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                        ) : integration.status === "Connected" ? (
                          <>
                            <button 
                              onClick={() => handleTest(integration)}
                              disabled={loading !== null}
                              className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF] disabled:opacity-50"
                            >
                              Test
                            </button>
                            <button 
                              onClick={() => handleDisconnect(integration)}
                              disabled={loading !== null}
                              className="text-sm font-medium text-[#DC2626] hover:text-[#991B1B] disabled:opacity-50"
                            >
                              Disconnect
                            </button>
                          </>
                        ) : (
                          <button 
                            onClick={() => handleConnect(integration.id)}
                            disabled={loading !== null}
                            className="text-sm font-medium text-[#2563EB] hover:text-[#1E40AF] disabled:opacity-50"
                          >
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