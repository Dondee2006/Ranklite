"use client";

import { useState, useEffect } from "react";
import { Check, ChevronRight, HelpCircle, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type ImageStyle = "brand-text" | "watercolor" | "cinematic" | "illustration" | "sketch";
type SettingsTab = "articles" | "blog";

const IMAGE_STYLES: { id: ImageStyle; label: string }[] = [
  { id: "brand-text", label: "Brand & Text" },
  { id: "watercolor", label: "Watercolor" },
  { id: "cinematic", label: "Cinematic" },
  { id: "illustration", label: "Illustration" },
  { id: "sketch", label: "Sketch" },
];

export default function ArticlesSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("articles");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [articleStyle, setArticleStyle] = useState("Informative");
  const [internalLinks, setInternalLinks] = useState("3 links per article");
  const [globalInstructions, setGlobalInstructions] = useState("");
  const [brandColor, setBrandColor] = useState("#000000");
  const [selectedImageStyle, setSelectedImageStyle] = useState<ImageStyle>("brand-text");
  const [titleBasedImage, setTitleBasedImage] = useState(false);
  const [youtubeVideo, setYoutubeVideo] = useState(false);
  const [callToAction, setCallToAction] = useState(false);
  const [includeInfographics, setIncludeInfographics] = useState(false);
  const [includeEmojis, setIncludeEmojis] = useState(false);

  // Blog settings
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [mainBlogAddress, setMainBlogAddress] = useState("");
  const [exampleUrls, setExampleUrls] = useState(["", "", ""]);
  const [siteUrl, setSiteUrl] = useState("");
  const [fetchingBlogInfo, setFetchingBlogInfo] = useState(false);
  const [blogInfoFetched, setBlogInfoFetched] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === "blog" && siteUrl && !sitemapUrl && !mainBlogAddress && !blogInfoFetched) {
      fetchBlogInfo();
    }
  }, [activeTab, siteUrl, sitemapUrl, mainBlogAddress, blogInfoFetched]);

  async function fetchBlogInfo() {
    if (!siteUrl || fetchingBlogInfo) return;

    setFetchingBlogInfo(true);
    try {
      const response = await fetch("/api/scrape-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: siteUrl }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        if (data.data.sitemapUrl && !sitemapUrl) {
          setSitemapUrl(data.data.sitemapUrl);
        }
        if (data.data.blogUrl && !mainBlogAddress) {
          setMainBlogAddress(data.data.blogUrl);
        }
      }
    } catch (error) {
      console.error("Failed to fetch blog info:", error);
    } finally {
      setFetchingBlogInfo(false);
      setBlogInfoFetched(true);
    }
  }

  async function loadSettings() {
    try {
      const response = await fetch("/api/article-settings");
      const data = await response.json();
      if (data.siteUrl) {
        setSiteUrl(data.siteUrl);
      }
      if (data.settings) {
        setAutoPublish(data.settings.auto_publish ?? true);
        setArticleStyle(data.settings.article_style || "Informative");
        setInternalLinks(data.settings.internal_links || "3 links per article");
        setGlobalInstructions(data.settings.global_instructions || "");
        setBrandColor(data.settings.brand_color || "#000000");
        setSelectedImageStyle(data.settings.image_style || "brand-text");
        setTitleBasedImage(data.settings.title_based_image ?? false);
        setYoutubeVideo(data.settings.youtube_video ?? false);
        setCallToAction(data.settings.call_to_action ?? false);
        setIncludeInfographics(data.settings.include_infographics ?? false);
        setIncludeEmojis(data.settings.include_emojis ?? false);
        setSitemapUrl(data.settings.sitemap_url || "");
        setMainBlogAddress(data.settings.blog_address || "");
        setExampleUrls(data.settings.example_urls || ["", "", ""]);
        if (data.settings.sitemap_url || data.settings.blog_address) {
          setBlogInfoFetched(true);
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function saveSettings() {
    setSaving(true);
    try {
      await fetch("/api/article-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sitemapUrl,
          blogAddress: mainBlogAddress,
          articleExamples: exampleUrls.filter(u => u.trim()),
          autoPublish,
          articleStyle,
          internalLinks,
          globalInstructions,
          brandColor,
          imageStyle: selectedImageStyle,
          titleBasedImage,
          youtubeVideo,
          callToAction,
          includeInfographics,
          includeEmojis,
        }),
      });
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  }

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
            onClick={() => setActiveTab("articles")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === "articles"
                ? "bg-[#1F2937] text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Articles
          </button>
          <button
            onClick={() => setActiveTab("blog")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium transition-all",
              activeTab === "blog"
                ? "bg-[#1F2937] text-white"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Blog
          </button>
        </div>

        {activeTab === "blog" ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Content details
              </h1>
              <p className="text-gray-500">
                Share your content details to help us create more relevant and targeted blog posts for your audience
              </p>
            </div>

            {fetchingBlogInfo && (
              <div className="flex items-center justify-center gap-2 mb-6 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Auto-detecting blog info...
              </div>
            )}

            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-700">Sitemap URL</span>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        Your website&apos;s sitemap URL
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <button
                    onClick={() => { setBlogInfoFetched(false); fetchBlogInfo(); }}
                    disabled={fetchingBlogInfo || !siteUrl}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-[#22C55E] disabled:opacity-50"
                  >
                    <RefreshCw className={cn("h-3 w-3", fetchingBlogInfo && "animate-spin")} />
                    Re-detect
                  </button>
                </div>
                <Input
                  type="text"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  className="w-full bg-white"
                  placeholder="https://example.com/sitemap.xml"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-medium text-gray-700">Main blog address</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      The main URL of your blog
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Input
                  type="text"
                  value={mainBlogAddress}
                  onChange={(e) => setMainBlogAddress(e.target.value)}
                  className="w-full bg-white"
                  placeholder="https://example.com/blog"
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-sm font-medium text-gray-700">Your best article examples URL</span>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      URLs of your best articles for style reference
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="space-y-3">
                  {exampleUrls.map((url, index) => (
                    <Input
                      key={index}
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const newUrls = [...exampleUrls];
                        newUrls[index] = e.target.value;
                        setExampleUrls(newUrls);
                      }}
                      className="w-full bg-white"
                      placeholder="https://example.com/blog/article"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] h-12 text-base"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Settings
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Configure your article preferences
              </h1>
              <p className="text-gray-500">
                Set your preferences once to ensure all future articles maintain your quality standards and brand consistency
              </p>
            </div>

            <div className="space-y-6">
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Content & SEO</h2>
                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">Auto-publish</div>
                      <div className="text-sm text-gray-500">Publish new articles automatically</div>
                    </div>
                    <Switch
                      checked={autoPublish}
                      onCheckedChange={setAutoPublish}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm font-medium text-gray-700">Article Style</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Choose the writing style for your articles
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={articleStyle} onValueChange={setArticleStyle}>
                        <SelectTrigger className="h-11">
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

                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm font-medium text-gray-700">Internal Links</span>
                        <Tooltip>
                          <TooltipTrigger>
                            <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            Number of internal links per article
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Select value={internalLinks} onValueChange={setInternalLinks}>
                        <SelectTrigger className="h-11">
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

                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-sm font-medium text-gray-700">Global Article Instructions</span>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          Instructions that apply to all generated articles
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <Textarea
                      placeholder="Enter global instructions for all articles (e.g., 'Always include practical examples', 'Focus on actionable insights')..."
                      value={globalInstructions}
                      onChange={(e) => setGlobalInstructions(e.target.value)}
                      className="min-h-[100px] resize-none"
                    />
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h2>
                <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Brand Color</label>
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-lg border border-gray-200"
                        style={{ backgroundColor: brandColor }}
                      />
                      <Input
                        value={brandColor}
                        onChange={(e) => setBrandColor(e.target.value)}
                        className="h-11 w-32"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Image Style</label>
                    <div className="grid grid-cols-5 gap-3">
                      {IMAGE_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedImageStyle(style.id)}
                          className={cn(
                            "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all",
                            selectedImageStyle === style.id
                              ? "border-[#22C55E] bg-[#F0FDF4]"
                              : "border-gray-200 hover:border-[#22C55E]/50"
                          )}
                        >
                          <div className="h-16 w-full rounded-lg bg-gray-100" />
                          <span className="flex items-center gap-1 text-xs font-medium">
                            {style.label} <HelpCircle className="h-3 w-3 text-gray-400" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-medium text-gray-900">
                        Title-Based Featured Image
                        <span className="rounded bg-[#22C55E] px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Improved Featured Images that include article title and your brand color.
                      </div>
                    </div>
                    <Switch
                      checked={titleBasedImage}
                      onCheckedChange={setTitleBasedImage}
                    />
                  </div>

                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">YouTube Video</div>
                        <div className="text-sm text-gray-500">Automatically finds and adds relevant YouTube videos based on article content.</div>
                      </div>
                      <Switch
                        checked={youtubeVideo}
                        onCheckedChange={setYoutubeVideo}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Call-to-Action</div>
                        <div className="text-sm text-gray-500">Automatically adds a call-to-action section with your website URL to drive engagement.</div>
                      </div>
                      <Switch
                        checked={callToAction}
                        onCheckedChange={setCallToAction}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Include Infographics</div>
                        <div className="text-sm text-gray-500">Automatically replaces images with data visualizations when articles contain statistics or comparisons.</div>
                      </div>
                      <Switch
                        checked={includeInfographics}
                        onCheckedChange={setIncludeInfographics}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">Include Emojis</div>
                        <div className="text-sm text-gray-500">Automatically adds relevant emojis to enhance engagement and visual appeal.</div>
                      </div>
                      <Switch
                        checked={includeEmojis}
                        onCheckedChange={setIncludeEmojis}
                      />
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <div className="mt-8">
              <Button
                onClick={saveSettings}
                disabled={saving}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] h-12 text-base"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Settings
              </Button>
            </div>
          </>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
          <Button variant="outline" className="px-6">
            Back
          </Button>
          <Button className="bg-[#22C55E] hover:bg-[#16A34A] px-8">
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}