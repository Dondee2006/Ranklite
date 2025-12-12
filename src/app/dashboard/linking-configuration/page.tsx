"use client";

import { useState, useEffect } from "react";
import { Link as LinkIcon, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

type LinkSource = "sitemap" | "rss" | "manual";

interface DetectedLink {
  id: string;
  url: string;
  title: string;
  detected_at: string;
}

export function LinkingConfigurationPage() {
  const [linkSource, setLinkSource] = useState<LinkSource>("sitemap");
  const [sitemapUrl, setSitemapUrl] = useState("https://outranksmart.com/sitemap.xml");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLinks, setDetectedLinks] = useState<DetectedLink[]>([]);

  const handleDetectLinks = async () => {
    setIsDetecting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Mock detected links
      setDetectedLinks([
        {
          id: "1",
          url: "https://outranksmart.com/article-1",
          title: "SEO Best Practices 2025",
          detected_at: new Date().toISOString(),
        },
        {
          id: "2",
          url: "https://outranksmart.com/article-2",
          title: "Content Marketing Strategies",
          detected_at: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Failed to detect links:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="px-8 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Linking Configuration
        </h1>
        <p className="text-sm text-gray-500 mb-8">
          Configure how we find links on your website for internal linking and backlink exchange.
        </p>

        <div className="grid grid-cols-2 gap-6">
          {/* Left Panel - Source Configuration */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100">
                <LinkIcon className="h-4 w-4 text-purple-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Source Configuration
              </h2>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Choose Link Source
                </label>
                <div className="relative">
                  <select
                    value={linkSource}
                    onChange={(e) => setLinkSource(e.target.value as LinkSource)}
                    className="w-full appearance-none rounded-lg border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="sitemap">Sitemap</option>
                    <option value="rss">RSS Feed</option>
                    <option value="manual">Manual Entry</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <svg
                      className="h-4 w-4 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sitemap URL
                </label>
                <input
                  type="text"
                  value={sitemapUrl}
                  onChange={(e) => setSitemapUrl(e.target.value)}
                  placeholder="https://outranksmart.com/sitemap.xml"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Using sitemap from your settings
                </p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 flex gap-3">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 leading-relaxed">
                  We scan your sitemap URL (and any nested sitemaps) to find articles for linking.
                  This works best if you have a sitemap that is updated regularly.
                </p>
              </div>

              <Button
                onClick={handleDetectLinks}
                disabled={isDetecting}
                className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-lg py-5 text-sm font-medium transition-colors"
              >
                {isDetecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Detecting Links...
                  </>
                ) : (
                  "Detect Links"
                )}
              </Button>
            </div>
          </div>

          {/* Right Panel - Detected Links */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100">
                <LinkIcon className="h-4 w-4 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Detected Links
              </h2>
              <button className="ml-auto text-gray-400 hover:text-gray-600">
                <Info className="h-4 w-4" />
              </button>
            </div>

            {detectedLinks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 mb-4">
                  <LinkIcon className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">
                  Run a Link Detection to see the result
                </h3>
                <p className="text-sm text-gray-500 max-w-xs">
                  Choose your link source and click "Detect Links" to find links from your website.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {detectedLinks.map((link) => (
                  <div
                    key={link.id}
                    className="rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="text-sm font-medium text-gray-900 mb-1">
                      {link.title}
                    </h4>
                    <p className="text-xs text-gray-500 truncate">{link.url}</p>
                  </div>
                ))}
                <p className="text-xs text-gray-500 text-center pt-2">
                  {detectedLinks.length} links detected
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LinkingConfigurationPage;
