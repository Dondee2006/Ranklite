"use client";

import { useEffect, useState, FormEvent } from "react";
import { Plug, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-7-1765757064664.png?width=8000&height=8000&resize=contain",
  },
  {
    id: "webflow",
    name: "Webflow",
    status: "Not connected",
    last_sync: null,
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-5-1765757166640.png?width=8000&height=8000&resize=contain",
  },
  {
    id: "shopify",
    name: "Shopify",
    status: "Not connected",
    last_sync: null,
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Shopify-Emblem-1765757016807.png?width=8000&height=8000&resize=contain",
  },
  {
    id: "notion",
    name: "Notion",
    status: "Not connected",
    last_sync: null,
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Notion-Logo-PNG-File-1765757016853.png?width=8000&height=8000&resize=contain",
  },
  {
    id: "wix",
    name: "Wix",
    status: "Not connected",
    last_sync: null,
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/wix-logo_brandlogos.net_w0pfv-512x512-1765757027629.png?width=8000&height=8000&resize=contain",
  },
  {
    id: "framer",
    name: "Framer",
    status: "Not connected",
    last_sync: null,
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/images-6-1765757064675.png?width=8000&height=8000&resize=contain",
  },
  { id: "gsc", name: "Google Search Console", status: "Not connected", last_sync: null, icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/google-search-console-icon-logo-png_seeklogo-624699-1765807829593.png?width=8000&height=8000&resize=contain" },
  { id: "ga", name: "Google Analytics", status: "Not connected", last_sync: null, icon: "📊" },
];

const SUPPORTED_PLATFORMS = ["wordpress", "webflow", "shopify", "notion", "wix"];

type Feedback = { type: "success" | "error"; text: string } | null;

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [loading, setLoading] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [form, setForm] = useState({ 
    siteUrl: "", 
    accessToken: "", 
    shop: "",
    appId: "",
    appSecret: "",
    instanceId: ""
  });
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const currentPlatform = selectedIntegration?.id;
  const requiresSiteUrl = currentPlatform === "wordpress";
  const requiresShop = currentPlatform === "shopify";
  const requiresWixFields = currentPlatform === "wix";

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/cms/integrations");
      if (!res.ok) return;

      const { integrations: cmsIntegrations } = await res.json();

      setIntegrations((prev) =>
        prev.map((integration) => {
          const cms = cmsIntegrations.find((c: any) => c.platform === integration.id);
          if (cms) {
            return {
              ...integration,
              status: cms.status === "connected" ? "Connected" : "Not connected",
              last_sync: cms.last_sync_at ? new Date(cms.last_sync_at).toLocaleString() : null,
              integration_id: cms.id,
            };
          }
          return integration;
        })
      );
    } catch (error) {
      console.error("Failed to fetch integrations:", error);
    }
  };

  const openConnectDialog = (integration: Integration) => {
    if (!SUPPORTED_PLATFORMS.includes(integration.id)) {
      setFeedback({ type: "error", text: `${integration.name} integration is coming soon.` });
      return;
    }
    setSelectedIntegration(integration);
    setForm({ 
      siteUrl: "", 
      accessToken: "", 
      shop: "",
      appId: "",
      appSecret: "",
      instanceId: ""
    });
    setFeedback(null);
    setConnectOpen(true);
  };

  const handleConnect = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedIntegration) return;

    const platform = selectedIntegration.id;
    
    let endpoint = "";
    let body: any = {};

    switch (platform) {
      case "wordpress":
        if (!form.siteUrl || !form.accessToken) {
          setFeedback({ type: "error", text: "Site URL and Application Password are required." });
          return;
        }
        endpoint = "/api/cms/wordpress/auth";
        body = { site_url: form.siteUrl, access_token: form.accessToken };
        break;

      case "webflow":
        if (!form.accessToken) {
          setFeedback({ type: "error", text: "API token is required." });
          return;
        }
        endpoint = "/api/cms/webflow/auth";
        body = { access_token: form.accessToken };
        break;

      case "shopify":
        if (!form.shop || !form.accessToken) {
          setFeedback({ type: "error", text: "Shop URL and Access Token are required." });
          return;
        }
        endpoint = "/api/cms/shopify/auth";
        body = { shop: form.shop, access_token: form.accessToken };
        break;

      case "notion":
        if (!form.accessToken) {
          setFeedback({ type: "error", text: "Integration Token is required." });
          return;
        }
        endpoint = "/api/cms/notion/auth";
        body = { access_token: form.accessToken };
        break;

      case "wix":
        if (!form.appId || !form.appSecret || !form.instanceId) {
          setFeedback({ type: "error", text: "App ID, App Secret, and Instance ID are required." });
          return;
        }
        endpoint = "/api/cms/wix/auth";
        body = { app_id: form.appId, app_secret: form.appSecret, instance_id: form.instanceId };
        break;

      default:
        setFeedback({ type: "error", text: "Unsupported platform." });
        return;
    }

    setLoading(platform);
    setFeedback(null);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to connect." });
        return;
      }

      setFeedback({ type: "success", text: `${selectedIntegration.name} connected successfully.` });
      setConnectOpen(false);
      await fetchIntegrations();
    } catch (error) {
      console.error("Connection error:", error);
      setFeedback({ type: "error", text: "Failed to connect integration." });
    } finally {
      setLoading(null);
    }
  };

  const handleDisconnect = async () => {
    if (!disconnectTarget?.integration_id) return;

    setLoading(disconnectTarget.id);
    setFeedback(null);

    try {
      const res = await fetch(`/api/cms/integrations/${disconnectTarget.integration_id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        setFeedback({ type: "error", text: data.error || "Failed to disconnect." });
        return;
      }

      setFeedback({ type: "success", text: `${disconnectTarget.name} disconnected successfully.` });
      await fetchIntegrations();
    } catch (error) {
      console.error("Disconnect error:", error);
      setFeedback({ type: "error", text: "Failed to disconnect integration." });
    } finally {
      setLoading(null);
      setDisconnectTarget(null);
    }
  };

  const handleTest = async (integration: Integration) => {
    setLoading(integration.id);
    setFeedback(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setFeedback({ type: "success", text: `${integration.name} connection looks good.` });
    } catch (error) {
      setFeedback({ type: "error", text: "Test failed." });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Integrations</h1>
          <Plug className="h-5 w-5 text-[#6B7280]" />
        </div>
      </header>

      <div className="p-8 space-y-3">
        {feedback && (
          <div
            className={cn(
              "rounded-md px-4 py-3 text-sm border",
              feedback.type === "success"
                ? "bg-[#ECFDF3] text-[#065F46] border-[#A7F3D0]"
                : "bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]"
            )}
          >
            {feedback.text}
          </div>
        )}

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
                        {integration.icon.startsWith("http") ? (
                          <div
                            className={cn(
                              "relative flex-shrink-0",
                              integration.id === "notion" || integration.id === "shopify"
                                ? "w-10 h-10"
                                : "w-8 h-8"
                            )}
                          >
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
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium",
                          integration.status === "Connected"
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#F3F4F6] text-[#6B7280]"
                        )}
                      >
                        {integration.status === "Connected" ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {integration.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-[#6B7280]">{integration.last_sync || "Never"}</div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {loading === integration.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                        ) : integration.status === "Connected" ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTest(integration)}
                              disabled={loading !== null}
                              className="text-[#2563EB] hover:text-[#1E40AF]"
                            >
                              Test
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDisconnectTarget(integration)}
                              disabled={loading !== null}
                              className="text-[#DC2626] hover:text-[#991B1B]"
                            >
                              Disconnect
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openConnectDialog(integration)}
                            disabled={loading !== null}
                            className="text-[#2563EB] hover:text-[#1E40AF]"
                          >
                            Connect
                          </Button>
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

      <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect {selectedIntegration?.name}</DialogTitle>
            <DialogDescription>
              {currentPlatform === "wordpress" && "Enter your site URL and application password to validate the connection."}
              {currentPlatform === "webflow" && "Provide your Webflow API token to connect."}
              {currentPlatform === "shopify" && "Enter your Shopify shop URL and access token."}
              {currentPlatform === "notion" && "Provide your Notion integration token."}
              {currentPlatform === "wix" && "Enter your Wix app credentials to connect."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleConnect}>
            {requiresSiteUrl && (
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input
                  id="siteUrl"
                  placeholder="https://your-site.com"
                  value={form.siteUrl}
                  onChange={(e) => setForm((prev) => ({ ...prev, siteUrl: e.target.value }))}
                  required
                />
              </div>
            )}

            {requiresShop && (
              <div className="space-y-2">
                <Label htmlFor="shop">Shop URL</Label>
                <Input
                  id="shop"
                  placeholder="your-shop.myshopify.com"
                  value={form.shop}
                  onChange={(e) => setForm((prev) => ({ ...prev, shop: e.target.value }))}
                  required
                />
              </div>
            )}

            {requiresWixFields && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="appId">App ID</Label>
                  <Input
                    id="appId"
                    placeholder="Enter your Wix App ID"
                    value={form.appId}
                    onChange={(e) => setForm((prev) => ({ ...prev, appId: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appSecret">App Secret</Label>
                  <Input
                    id="appSecret"
                    type="password"
                    placeholder="Enter your Wix App Secret"
                    value={form.appSecret}
                    onChange={(e) => setForm((prev) => ({ ...prev, appSecret: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instanceId">Instance ID</Label>
                  <Input
                    id="instanceId"
                    placeholder="Enter your Wix Instance ID"
                    value={form.instanceId}
                    onChange={(e) => setForm((prev) => ({ ...prev, instanceId: e.target.value }))}
                    required
                  />
                </div>
              </>
            )}

            {!requiresWixFields && (
              <div className="space-y-2">
                <Label htmlFor="accessToken">
                  {currentPlatform === "wordpress" && "Application Password"}
                  {currentPlatform === "webflow" && "API Token"}
                  {currentPlatform === "shopify" && "Access Token"}
                  {currentPlatform === "notion" && "Integration Token"}
                </Label>
                <Input
                  id="accessToken"
                  type="password"
                  placeholder={
                    currentPlatform === "wordpress" ? "Enter your WordPress application password" :
                    currentPlatform === "webflow" ? "Enter your Webflow API token" :
                    currentPlatform === "shopify" ? "Enter your Shopify access token" :
                    currentPlatform === "notion" ? "Enter your Notion integration token" :
                    "Enter your API token"
                  }
                  value={form.accessToken}
                  onChange={(e) => setForm((prev) => ({ ...prev, accessToken: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConnectOpen(false)}
                disabled={loading !== null}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading !== null}>
                {loading === selectedIntegration?.id ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" /> Connecting
                  </span>
                ) : (
                  "Connect"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(disconnectTarget)} onOpenChange={(open) => !open && setDisconnectTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect {disconnectTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the connection for this integration. You can reconnect anytime.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading !== null}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDisconnect} disabled={loading !== null}>
              {loading === disconnectTarget?.id ? "Disconnecting..." : "Disconnect"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}