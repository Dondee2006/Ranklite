"use client";

import { useState, useEffect } from "react";
import { Play, Trash2, Info, Loader2, Plus, X, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CMSIntegration {
  id: string;
  cms_type: string;
  site_url: string;
  status: string;
  last_sync_at: string | null;
  auto_publish_enabled: boolean;
  created_at: string;
  settings: Record<string, any>;
}

const CMS_TYPES = [
  { id: "wordpress", name: "WordPress", icon: "W" },
  { id: "shopify", name: "Shopify", icon: "S" },
  { id: "notion", name: "Notion", icon: "N" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<CMSIntegration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [wpSiteUrl, setWpSiteUrl] = useState("");
  const [wpAccessToken, setWpAccessToken] = useState("");
  
  const [shopifyShop, setShopifyShop] = useState("");
  const [shopifyAccessToken, setShopifyAccessToken] = useState("");
  
  const [notionAccessToken, setNotionAccessToken] = useState("");
  const [notionDatabaseId, setNotionDatabaseId] = useState("");

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  async function loadIntegrations() {
    try {
      const response = await fetch("/api/cms/integrations");
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error("Failed to load integrations:", error);
      setAlert({ type: 'error', message: 'Failed to load integrations' });
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/cms/integrations/${id}`, { method: "DELETE" });
      if (response.ok) {
        setIntegrations(integrations.filter((item) => item.id !== id));
        setAlert({ type: 'success', message: 'Integration disconnected successfully' });
      } else {
        setAlert({ type: 'error', message: 'Failed to disconnect integration' });
      }
    } catch (error) {
      console.error("Failed to delete integration:", error);
      setAlert({ type: 'error', message: 'Failed to disconnect integration' });
    } finally {
      setDeleting(null);
    }
  };

  const handleSync = async (id: string) => {
    setSyncing(id);
    try {
      const response = await fetch("/api/cms/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integration_id: id }),
      });
      const data = await response.json();
      if (response.ok) {
        setAlert({ type: 'success', message: data.message || 'Sync completed successfully' });
        loadIntegrations();
      } else {
        setAlert({ type: 'error', message: data.error || 'Sync failed' });
      }
    } catch (error) {
      console.error("Failed to sync:", error);
      setAlert({ type: 'error', message: 'Failed to sync content' });
    } finally {
      setSyncing(null);
    }
  };

  const handleConnect = async () => {
    if (!selectedType) return;
    setSaving(true);
    try {
      let response;
      
      if (selectedType === 'wordpress') {
        if (!wpSiteUrl || !wpAccessToken) {
          setAlert({ type: 'error', message: 'Please fill all WordPress fields' });
          setSaving(false);
          return;
        }
        response = await fetch("/api/cms/wordpress/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ site_url: wpSiteUrl, access_token: wpAccessToken }),
        });
      } else if (selectedType === 'shopify') {
        if (!shopifyShop || !shopifyAccessToken) {
          setAlert({ type: 'error', message: 'Please fill all Shopify fields' });
          setSaving(false);
          return;
        }
        response = await fetch("/api/cms/shopify/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shop: shopifyShop, access_token: shopifyAccessToken }),
        });
      } else if (selectedType === 'notion') {
        if (!notionAccessToken) {
          setAlert({ type: 'error', message: 'Please fill Notion access token' });
          setSaving(false);
          return;
        }
        response = await fetch("/api/cms/notion/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            access_token: notionAccessToken,
            database_id: notionDatabaseId || undefined,
          }),
        });
      }

      if (response && response.ok) {
        const data = await response.json();
        setAlert({ type: 'success', message: data.message || 'Connected successfully' });
        setShowAddModal(false);
        resetForm();
        loadIntegrations();
      } else {
        const data = await response?.json();
        setAlert({ type: 'error', message: data?.error || 'Connection failed' });
      }
    } catch (error) {
      console.error("Connection error:", error);
      setAlert({ type: 'error', message: 'Failed to connect CMS' });
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedType("");
    setWpSiteUrl("");
    setWpAccessToken("");
    setShopifyShop("");
    setShopifyAccessToken("");
    setNotionAccessToken("");
    setNotionDatabaseId("");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="px-8 py-6">
        {alert && (
          <div className={cn(
            "mb-4 p-4 rounded-xl border flex items-center gap-3",
            alert.type === 'success' ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
          )}>
            {alert.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <X className="h-5 w-5" />}
            <span className="text-sm font-medium">{alert.message}</span>
          </div>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CMS Integrations</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Connect CMS
          </Button>
        </div>

        {integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No CMS platforms connected yet.</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Connect Your First CMS
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Platform
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Site URL
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Last Sync
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {integrations.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {item.cms_type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{item.site_url}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          item.status === 'connected' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.status === 'connected' ? "bg-green-500" : "bg-gray-400"
                          )} />
                          {item.status === 'connected' ? "Connected" : "Disconnected"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(item.last_sync_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSync(item.id)}
                            disabled={syncing === item.id}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Sync now"
                          >
                            {syncing === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Disconnect"
                          >
                            {deleting === item.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 p-4 bg-gray-50 border border-gray-200 rounded-xl">
          <Info className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
          <div className="text-sm text-gray-600">
            <span>Connect your CMS platform to sync content and publish articles automatically. </span>
            <span>Supported platforms: WordPress, Shopify, and Notion.</span>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Connect CMS Platform</h3>
              <button onClick={() => { setShowAddModal(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Platform</label>
                <div className="grid grid-cols-3 gap-2">
                  {CMS_TYPES.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        selectedType === type.id
                          ? "border-[#22C55E] bg-[#F0FDF4]"
                          : "border-gray-200 hover:border-gray-300"
                      )}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs font-medium">{type.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {selectedType === 'wordpress' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WordPress Site URL *</label>
                    <Input
                      value={wpSiteUrl}
                      onChange={(e) => setWpSiteUrl(e.target.value)}
                      placeholder="https://yoursite.com"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token *</label>
                    <Input
                      type="password"
                      value={wpAccessToken}
                      onChange={(e) => setWpAccessToken(e.target.value)}
                      placeholder="Your WordPress access token"
                      className="h-11"
                    />
                  </div>
                </>
              )}

              {selectedType === 'shopify' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
                    <Input
                      value={shopifyShop}
                      onChange={(e) => setShopifyShop(e.target.value)}
                      placeholder="yourstore.myshopify.com"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token *</label>
                    <Input
                      type="password"
                      value={shopifyAccessToken}
                      onChange={(e) => setShopifyAccessToken(e.target.value)}
                      placeholder="Your Shopify access token"
                      className="h-11"
                    />
                  </div>
                </>
              )}

              {selectedType === 'notion' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Access Token *</label>
                    <Input
                      type="password"
                      value={notionAccessToken}
                      onChange={(e) => setNotionAccessToken(e.target.value)}
                      placeholder="Your Notion integration token"
                      className="h-11"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Database ID (optional)</label>
                    <Input
                      value={notionDatabaseId}
                      onChange={(e) => setNotionDatabaseId(e.target.value)}
                      placeholder="Notion database ID for publishing"
                      className="h-11"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConnect}
                  disabled={!selectedType || saving}
                  className="flex-1 h-11 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Connect"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}