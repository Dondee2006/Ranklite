"use client";

import { useState, useEffect } from "react";
import { 
  Check, 
  ChevronRight, 
  HelpCircle, 
  Loader2, 
  RefreshCw, 
  Plus, 
  X, 
  Globe, 
  Sparkles,
  Search,
  Layout,
  Type,
  Image as ImageIcon,
  Share2,
  Settings as SettingsIcon,
  MousePointer2,
  FileText
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo (DRC)", "Congo (Republic)",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador",
  "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France",
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau",
  "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland",
  "Israel", "Italy", "Ivory Coast", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kosovo",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania",
  "Luxembourg", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius",
  "Mexico", "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia",
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway",
  "Oman", "Pakistan", "Palau", "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands",
  "Somalia", "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland",
  "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan",
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const IMAGE_STYLES = [
  { id: "brand-text", label: "Brand & Text" },
  { id: "watercolor", label: "Watercolor" },
  { id: "cinematic", label: "Cinematic" },
  { id: "illustration", label: "Illustration" },
  { id: "sketch", label: "Sketch" },
];

function getCompetitorLogo(competitor: string): string {
  const domain = competitor.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
}

function getCompetitorDomain(competitor: string): string {
  return competitor.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0];
}

export default function ArticlesSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [newAudience, setNewAudience] = useState("");
  const [newCompetitor, setNewCompetitor] = useState("");

  const [formData, setFormData] = useState({
    site: {
      name: "",
      url: "",
      language: "English",
      country: "United States",
      description: "",
    },
    audiences: [] as string[],
    competitors: [] as string[],
    articleSettings: {
      article_style: "Informative",
      internal_links: "3 links per article",
      global_instructions: "",
      brand_color: "#000000",
      image_style: "brand-text",
      title_based_image: false,
      youtube_video: false,
      call_to_action: false,
      include_infographics: false,
      include_emojis: false,
      auto_publish: true,
      sitemap_url: "",
      blog_address: "",
      example_urls: ["", "", ""],
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const response = await fetch("/api/article-settings");
      const data = await response.json();
      
      if (data.site) {
        setFormData(prev => ({
          ...prev,
          site: {
            name: data.site.name || "",
            url: data.site.url || "",
            language: data.site.language || "English",
            country: data.site.country || "United States",
            description: data.site.description || "",
          },
          audiences: data.audiences?.map((a: any) => a.name) || [],
          competitors: data.competitors?.map((c: any) => c.url) || [],
          articleSettings: {
            ...prev.articleSettings,
            article_style: data.articleSettings?.article_style || "Informative",
            internal_links: data.articleSettings?.internal_links || "3 links per article",
            global_instructions: data.articleSettings?.global_instructions || "",
            brand_color: data.articleSettings?.brand_color || "#000000",
            image_style: data.articleSettings?.image_style || "brand-text",
            title_based_image: data.articleSettings?.title_based_image ?? false,
            youtube_video: data.articleSettings?.youtube_video ?? false,
            call_to_action: data.articleSettings?.call_to_action ?? false,
            include_infographics: data.articleSettings?.include_infographics ?? false,
            include_emojis: data.articleSettings?.include_emojis ?? false,
            auto_publish: data.articleSettings?.auto_publish ?? true,
            sitemap_url: data.articleSettings?.sitemap_url || "",
            blog_address: data.articleSettings?.blog_address || "",
            example_urls: data.articleSettings?.example_urls || ["", "", ""],
          },
        }));
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      const response = await fetch("/api/article-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const updateSite = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      site: { ...prev.site, [key]: value }
    }));
  };

  const updateArticleSettings = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      articleSettings: { ...prev.articleSettings, [key]: value }
    }));
  };

  const addAudience = () => {
    if (newAudience.trim() && formData.audiences.length < 7) {
      setFormData(prev => ({
        ...prev,
        audiences: [...prev.audiences, newAudience.trim()]
      }));
      setNewAudience("");
    }
  };

  const removeAudience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      audiences: prev.audiences.filter((_, i) => i !== index)
    }));
  };

  const addCompetitor = () => {
    if (newCompetitor.trim() && formData.competitors.length < 7) {
      setFormData(prev => ({
        ...prev,
        competitors: [...prev.competitors, newCompetitor.trim()]
      }));
      setNewCompetitor("");
    }
  };

  const removeCompetitor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      competitors: prev.competitors.filter((_, i) => i !== index)
    }));
  };

  const fetchBusinessInfo = async () => {
    if (!formData.site.url.trim()) return;
    setFetching(true);
    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: formData.site.url }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setFormData(prev => ({
          ...prev,
          site: {
            ...prev.site,
            name: data.data.businessName || prev.site.name,
            description: data.data.description || prev.site.description,
            language: data.data.language || prev.site.language,
            country: data.data.country || prev.site.country,
          },
          audiences: data.data.suggestedAudiences?.length > 0
            ? data.data.suggestedAudiences
            : prev.audiences,
          articleSettings: {
            ...prev.articleSettings,
            sitemap_url: data.data.sitemapUrl || prev.articleSettings.sitemap_url,
            blog_address: data.data.blogUrl || prev.articleSettings.blog_address,
          }
        }));
        toast.success("Website information updated from URL");
      }
    } catch (error) {
      console.error("Failed to fetch website info:", error);
      toast.error("Failed to fetch website info");
    } finally {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#FAFAFA]">
        <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-[#1A1A1A]">Article Settings</h1>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-6 font-medium"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </header>

        <div className="p-8 pb-20">
          <div className="mx-auto max-w-4xl space-y-8">
            {/* Section 1: Business Info */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <Globe className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Business Details</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Website URL</label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.site.url}
                        onChange={(e) => updateSite("url", e.target.value)}
                        placeholder="https://yourbusiness.com"
                        className="rounded-xl"
                      />
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={fetchBusinessInfo}
                        disabled={fetching || !formData.site.url}
                        className="rounded-xl shrink-0"
                      >
                        <RefreshCw className={cn("h-4 w-4", fetching && "animate-spin")} />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Business Name</label>
                    <Input
                      value={formData.site.name}
                      onChange={(e) => updateSite("name", e.target.value)}
                      placeholder="Your Business Name"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Language</label>
                    <Select value={formData.site.language} onValueChange={(v) => updateSite("language", v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Spanish">Spanish</SelectItem>
                        <SelectItem value="French">French</SelectItem>
                        <SelectItem value="German">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Country</label>
                    <Select value={formData.site.country} onValueChange={(v) => updateSite("country", v)}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {COUNTRIES.map((country) => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Business Description</label>
                  <Textarea
                    value={formData.site.description}
                    onChange={(e) => updateSite("description", e.target.value)}
                    placeholder="Describe your business..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Audience & Competitors */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <Search className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Audience & Competitors</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-8">
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Target Audiences</h3>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                      {formData.audiences.length}/7
                    </span>
                  </div>
                  <div className="mb-4 flex gap-2">
                    <Input
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      placeholder="e.g., Developers, Project Managers"
                      className="rounded-xl"
                      onKeyDown={(e) => e.key === "Enter" && addAudience()}
                    />
                    <Button onClick={addAudience} variant="outline" className="rounded-xl shrink-0">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.audiences.map((audience, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-1.5 text-sm">
                        <span>{audience}</span>
                        <button onClick={() => removeAudience(index)} className="text-muted-foreground hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-foreground">Competitors</h3>
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-[#22C55E]">
                      {formData.competitors.length}/7
                    </span>
                  </div>
                  <div className="mb-4 flex gap-2">
                    <Input
                      value={newCompetitor}
                      onChange={(e) => setNewCompetitor(e.target.value)}
                      placeholder="e.g., https://competitor.com"
                      className="rounded-xl"
                      onKeyDown={(e) => e.key === "Enter" && addCompetitor()}
                    />
                    <Button onClick={addCompetitor} variant="outline" className="rounded-xl shrink-0">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.competitors.map((competitor, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-lg border border-border bg-gray-50 px-3 py-1.5 text-sm shadow-sm">
                        <img src={getCompetitorLogo(competitor)} alt="" className="h-4 w-4 rounded" />
                        <span className="font-medium">{getCompetitorDomain(competitor)}</span>
                        <button onClick={() => removeCompetitor(index)} className="text-muted-foreground hover:text-red-500">
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section 3: Content & SEO */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Content & SEO</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div>
                    <h3 className="font-semibold text-foreground">Auto-publish</h3>
                    <p className="text-xs text-muted-foreground">Automatically publish generated articles to your CMS</p>
                  </div>
                  <Switch
                    checked={formData.articleSettings.auto_publish}
                    onCheckedChange={(v) => updateArticleSettings("auto_publish", v)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Article Style</label>
                    <Select 
                      value={formData.articleSettings.article_style} 
                      onValueChange={(v) => updateArticleSettings("article_style", v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Informative">Informative</SelectItem>
                        <SelectItem value="Conversational">Conversational</SelectItem>
                        <SelectItem value="Professional">Professional</SelectItem>
                        <SelectItem value="Casual">Casual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Internal Links</label>
                    <Select 
                      value={formData.articleSettings.internal_links} 
                      onValueChange={(v) => updateArticleSettings("internal_links", v)}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1 link per article">1 link per article</SelectItem>
                        <SelectItem value="2 links per article">2 links per article</SelectItem>
                        <SelectItem value="3 links per article">3 links per article</SelectItem>
                        <SelectItem value="5 links per article">5 links per article</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Global Article Instructions</label>
                  <Textarea
                    value={formData.articleSettings.global_instructions}
                    onChange={(e) => updateArticleSettings("global_instructions", e.target.value)}
                    placeholder="Instructions applied to all articles..."
                    className="min-h-[100px] rounded-xl resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Section 4: Images & Media */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Images & Media</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-xl border border-gray-200 cursor-pointer shadow-sm hover:ring-2 hover:ring-green-500/20 transition-all"
                      style={{ backgroundColor: formData.articleSettings.brand_color }}
                      onClick={() => document.getElementById('color-picker')?.click()}
                    />
                    <Input
                      value={formData.articleSettings.brand_color}
                      onChange={(e) => updateArticleSettings("brand_color", e.target.value)}
                      className="h-11 w-32 font-mono text-sm rounded-xl"
                      placeholder="#000000"
                    />
                    <input
                      id="color-picker"
                      type="color"
                      value={formData.articleSettings.brand_color}
                      onChange={(e) => updateArticleSettings("brand_color", e.target.value)}
                      className="hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Image Style</label>
                  <div className="grid grid-cols-5 gap-3">
                    {IMAGE_STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => updateArticleSettings("image_style", style.id)}
                        className={cn(
                          "flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all",
                          formData.articleSettings.image_style === style.id
                            ? "border-[#22C55E] bg-[#F0FDF4]"
                            : "border-gray-100 hover:border-gray-200 bg-white"
                        )}
                      >
                        <div className="h-20 w-full rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
                          <img
                            src={`/images/article-styles/${style.id}.png`}
                            alt={style.label}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <ImageIcon className="hidden h-6 w-6 text-gray-300" />
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 truncate w-full">
                          {style.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  {[
                    { key: "title_based_image", label: "Title-Based Featured Image", desc: "Include article title and brand color in featured images." },
                    { key: "include_infographics", label: "Include Infographics", desc: "Add data visualizations for statistics or comparisons." },
                    { key: "include_emojis", label: "Include Emojis", desc: "Use relevant emojis to enhance engagement." },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                      <Switch
                        checked={formData.articleSettings[item.key as keyof typeof formData.articleSettings] as boolean}
                        onCheckedChange={(v) => updateArticleSettings(item.key, v)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Section 5: Engagement */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <MousePointer2 className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Engagement</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">YouTube Video</h4>
                    <p className="text-xs text-muted-foreground">Add relevant YouTube videos to your articles automatically.</p>
                  </div>
                  <Switch
                    checked={formData.articleSettings.youtube_video}
                    onCheckedChange={(v) => updateArticleSettings("youtube_video", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">Call-to-Action</h4>
                    <p className="text-xs text-muted-foreground">Add a CTA section at the end of articles.</p>
                  </div>
                  <Switch
                    checked={formData.articleSettings.call_to_action}
                    onCheckedChange={(v) => updateArticleSettings("call_to_action", v)}
                  />
                </div>
              </div>
            </section>

            {/* Section 6: Blog Details */}
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 text-[#22C55E]">
                  <Layout className="h-4 w-4" />
                </div>
                <h2 className="text-lg font-bold text-foreground">Blog Details</h2>
              </div>
              <div className="rounded-2xl border border-border bg-white p-6 shadow-sm space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Sitemap URL</label>
                    <Input
                      value={formData.articleSettings.sitemap_url}
                      onChange={(e) => updateArticleSettings("sitemap_url", e.target.value)}
                      placeholder="https://yoursite.com/sitemap.xml"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Main Blog Address</label>
                    <Input
                      value={formData.articleSettings.blog_address}
                      onChange={(e) => updateArticleSettings("blog_address", e.target.value)}
                      placeholder="https://yoursite.com/blog"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Best Article Examples (Style reference)</label>
                  {formData.articleSettings.example_urls.map((url, index) => (
                    <Input
                      key={index}
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...formData.articleSettings.example_urls];
                        newUrls[index] = e.target.value;
                        updateArticleSettings("example_urls", newUrls);
                      }}
                      placeholder={`Example URL #${index + 1}`}
                      className="rounded-xl"
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 lg:left-[200px] right-0 bg-white border-t border-border p-4 flex justify-center z-40">
          <div className="max-w-4xl w-full flex justify-end gap-3">
            <Link href="/dashboard/overview">
              <Button variant="outline" className="rounded-xl px-6">Cancel</Button>
            </Link>
            <Button
              onClick={saveSettings}
              disabled={saving}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white px-8 font-medium rounded-xl"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
