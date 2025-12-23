"use client";

import { useState, useEffect } from "react";
import { HelpCircle, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

type SettingsTab = "business" | "audience" | "gsc";

export function SettingsContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>("business");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [niche, setNiche] = useState("");
  const [language, setLanguage] = useState("English");
  const [country, setCountry] = useState("United States");
  const [description, setDescription] = useState("");

  const [audienceInput, setAudienceInput] = useState("");
  const [audiences, setAudiences] = useState<string[]>([]);

  const [competitorInput, setCompetitorInput] = useState("");
  const [competitors, setCompetitors] = useState<{ name: string; favicon: string }[]>([]);

  const [gscConnected, setGscConnected] = useState(false);
  const [gscLoading, setGscLoading] = useState(false);
  const [gscError, setGscError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch("/api/settings");
        const data = await response.json();
        if (data.settings) {
          setWebsiteUrl(data.settings.url || "");
          setBusinessName(data.settings.name || "");
          setNiche(data.settings.niche || "");
          setLanguage(data.settings.language || "English");
          setCountry(data.settings.country || "United States");
          setDescription(data.settings.description || "");
          if (data.settings.target_audiences) {
            setAudiences(data.settings.target_audiences.map((a: { name: string }) => a.name));
          }
          if (data.settings.competitors) {
            setCompetitors(data.settings.competitors.map((c: { url: string }) => ({
              name: c.url.replace(/^https?:\/\//, "").replace(/\/$/, ""),
              favicon: `https://www.google.com/s2/favicons?domain=${c.url}&sz=32`,
            })));
          }
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  useEffect(() => {
    const tab = searchParams?.get("tab");
    if (tab === "gsc") {
      setActiveTab("gsc");
    }

    const success = searchParams?.get("success");
    const error = searchParams?.get("error");

    if (success === "true") {
      setGscConnected(true);
      toast.success("Successfully connected to Google Search Console!");
    }

    if (error) {
      const errorMessages: Record<string, string> = {
        access_denied: "You denied access to Google Search Console",
        missing_code: "Authorization failed. Please try again",
        unauthorized: "Session expired. Please try again",
        config_missing: "Google OAuth is not configured properly",
        token_exchange_failed: "Failed to authenticate with Google",
        no_site: "No site found. Please complete onboarding first",
        db_error: "Failed to save credentials. Please try again",
        unknown: "An unexpected error occurred",
      };
      toast.error(errorMessages[error] || errorMessages.unknown);
    }
  }, [searchParams]);

  const connectGSC = async () => {
    setGscLoading(true);
    setGscError(null);
    try {
      const response = await fetch("/api/gsc/auth");
      const data = await response.json();
      
      if (data.error) {
        toast.error(data.error);
        setGscLoading(false);
        return;
      }

      window.location.href = data.authUrl;
    } catch (error) {
      console.error("Failed to initiate GSC connection:", error);
      setGscError("Failed to connect. Please try again");
      setGscLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          url: websiteUrl,
          niche,
          language,
          country,
          description,
          targetAudience: audiences.join(", "),
          competitors: competitors.map((c) => c.name),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success("Settings saved successfully!");
      } else {
        toast.error(data.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const addAudience = () => {
    if (audienceInput.trim() && audiences.length < 7) {
      setAudiences([...audiences, audienceInput.trim()]);
      setAudienceInput("");
    }
  };

  const removeAudience = (index: number) => {
    setAudiences(audiences.filter((_, i) => i !== index));
  };

  const addCompetitor = () => {
    if (competitorInput.trim() && competitors.length < 7) {
      const domain = competitorInput.trim().replace(/^https?:\/\//, "").replace(/\/$/, "");
      setCompetitors([
        ...competitors,
        { name: domain, favicon: `https://www.google.com/s2/favicons?domain=${domain}&sz=32` },
      ]);
      setCompetitorInput("");
    }
  };

  const removeCompetitor = (index: number) => {
    setCompetitors(competitors.filter((_, i) => i !== index));
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
      <div className="mx-auto max-w-3xl px-6 py-8">
        <div className="mb-8 flex items-center justify-center gap-1">
          <button
            onClick={() => setActiveTab("business")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === "business"
                ? "bg-[#1F2937] text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Business
          </button>
          <button
            onClick={() => setActiveTab("audience")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === "audience"
                ? "bg-[#1F2937] text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Audience and Competitors
          </button>
          <button
            onClick={() => setActiveTab("gsc")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === "gsc"
                ? "bg-[#1F2937] text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Google Search Console
          </button>
        </div>

        {activeTab === "business" && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                About your business
              </h1>
              <p className="text-gray-500">
                Provide your business information to personalize content generation and SEO strategies
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Website to business
                </label>
                <Input
                  type="text"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  className="w-full bg-white border-gray-200 h-11"
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business name
                </label>
                <Input
                  type="text"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-white border-gray-200 h-11"
                  placeholder="Your business name"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <label className="text-sm font-medium text-gray-700">Niche / Industry</label>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      Your business niche or industry (e.g., "SEO marketing", "digital marketing", "content strategy"). This is used to generate relevant keywords and content.
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  className="w-full bg-white border-gray-200 h-11"
                  placeholder="e.g., SEO marketing, digital marketing, content strategy"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the primary language for your content
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="relative">
                    <Input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full bg-white border-gray-200 h-11"
                      placeholder="Select language"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <label className="text-sm font-medium text-gray-700">Country</label>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Select the primary country for your target audience
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-white border-gray-200 h-11"
                    placeholder="Select country"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-gray-200 min-h-[180px] resize-none"
                  placeholder="Describe your business..."
                />
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </>
        )}

        {activeTab === "audience" && (
          <>
            <div className="text-center mb-10">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Define your Target Audience and Competitors
              </h1>
              <p className="text-gray-500">
                Understanding your audience and competition ensures we generate the most effective keywords
              </p>
            </div>

            <div className="space-y-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Target Audiences</h2>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                    {audiences.length}/7
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Enter your target audience groups to create relevant content. Better audience understanding improves results
                </p>

                <div className="flex gap-3 mb-4">
                  <Input
                    type="text"
                    value={audienceInput}
                    onChange={(e) => setAudienceInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addAudience()}
                    className="flex-1 bg-white border-gray-200 h-11"
                    placeholder="Enter your target audience groups (e.g., Developers, Project Managers)"
                  />
                  <button
                    onClick={addAudience}
                    className="px-6 h-11 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {audiences.map((audience, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 leading-snug">{audience}</span>
                      <button
                        onClick={() => removeAudience(index)}
                        className="text-gray-400 hover:text-gray-600 mt-0.5 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Competitors</h2>
                  <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                    {competitors.length}/7
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">
                  Enter competitors to discover the SEO keywords they rank for. Bigger competitors provide more valuable insights
                </p>

                <div className="flex gap-3 mb-4">
                  <Input
                    type="text"
                    value={competitorInput}
                    onChange={(e) => setCompetitorInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                    className="flex-1 bg-white border-gray-200 h-11"
                    placeholder="Enter competitor URLs or company names (e.g. https://revid.ai or revid.ai)"
                  />
                  <button
                    onClick={addCompetitor}
                    className="px-6 h-11 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {competitors.map((competitor, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={competitor.favicon}
                          alt=""
                          className="w-5 h-5 rounded"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3C/svg%3E";
                          }}
                        />
                        <span className="text-sm text-gray-700">{competitor.name}</span>
                      </div>
                      <button
                        onClick={() => removeCompetitor(index)}
                        className="text-gray-400 hover:text-gray-600 shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={saveSettings}
                disabled={saving}
                className="w-full py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </>
        )}

        {activeTab === "gsc" && (
          <>
            <div className="text-center mb-10">
              <img
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/google-search-console-icon-logo-png_seeklogo-624699-1765824559889.png?width=8000&height=8000&resize=contain"
                alt="Google Search Console logo"
                className="mx-auto mb-4 h-20 w-20 object-contain"
              />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Google Search Console
              </h1>
              <p className="text-gray-500">
                Connect your Google Search Console to track performance
              </p>
            </div>

            {/* Removed local success/error banners */}

            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center">
                <p className="text-gray-500 mb-4">
                  {gscConnected 
                    ? "Your Google Search Console is connected and tracking performance data"
                    : "Connect your Google Search Console account to get insights about your search performance"
                  }
                </p>
                {gscConnected ? (
                  <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-green-50 text-green-700 rounded-lg font-medium border border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    Connected
                  </div>
                ) : (
                  <button 
                    onClick={connectGSC}
                    disabled={gscLoading}
                    className="px-6 py-2.5 bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-lg font-medium transition-colors disabled:opacity-50 inline-flex items-center gap-2"
                  >
                    {gscLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Connect Google Search Console
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}