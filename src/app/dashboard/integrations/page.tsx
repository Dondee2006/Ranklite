"use client";

import { useState, useEffect } from "react";
import { Play, Trash2, Info, Loader2, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
}

const INTEGRATION_TYPES = [
  { id: "wordpress", name: "WordPress", icon: "W" },
  { id: "notion", name: "Notion", icon: "N" },
  { id: "shopify", name: "Shopify", icon: "S" },
  { id: "webhook", name: "API Webhook", icon: "⚡" },
  { id: "webflow", name: "Webflow", icon: "⬡" },
];

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedType, setSelectedType] = useState("");
  const [integrationName, setIntegrationName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadIntegrations();
  }, []);

  async function loadIntegrations() {
    try {
      const response = await fetch("/api/integrations");
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error("Failed to load integrations:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      const response = await fetch(`/api/integrations/${id}`, { method: "DELETE" });
      if (response.ok) {
        setIntegrations(integrations.filter((item) => item.id !== id));
      }
    } catch (error) {
      console.error("Failed to delete integration:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleAddIntegration = async () => {
    if (!selectedType || !integrationName) return;
    setSaving(true);
    try {
      const response = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: selectedType,
          name: integrationName,
          config: {},
          is_active: true,
        }),
      });
      if (response.ok) {
        setShowAddModal(false);
        setSelectedType("");
        setIntegrationName("");
        loadIntegrations();
      }
    } catch (error) {
      console.error("Failed to add integration:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <Button
            onClick={() => setShowAddModal(true)}
            className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl"
          >
            <Plus className="h-4 w-4" />
            Add Integration
          </Button>
        </div>

        {integrations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-4">No integrations set up yet.</p>
            <Button
              onClick={() => setShowAddModal(true)}
              className="gap-2 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl"
            >
              <Plus className="h-4 w-4" />
              Add Your First Integration
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                      Created
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
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600 capitalize">{item.type}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          item.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          <span className={cn(
                            "h-1.5 w-1.5 rounded-full",
                            item.is_active ? "bg-green-500" : "bg-gray-400"
                          )} />
                          {item.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{formatDate(item.created_at)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Run integration"
                          >
                            <Play className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deleting === item.id}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete integration"
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
            <span>Connect your blog platform to automatically publish articles. </span>
            <span>Supported platforms include WordPress, Notion, Shopify, Webflow, and custom webhooks.</span>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add Integration</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Integration Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {INTEGRATION_TYPES.map((type) => (
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Integration Name *</label>
                <Input
                  value={integrationName}
                  onChange={(e) => setIntegrationName(e.target.value)}
                  placeholder="e.g., My WordPress Blog"
                  className="h-11"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddIntegration}
                  disabled={!selectedType || !integrationName || saving}
                  className="flex-1 h-11 bg-[#22C55E] hover:bg-[#16A34A] text-white"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Integration"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}