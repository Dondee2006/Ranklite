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

interface LinkSuggestion {
  id: string;
  source_url: string;
  target_url: string;
  anchor_text: string;
  relevance_score: number;
  reasoning: string;
  status: 'pending' | 'approved' | 'rejected';
}

export function LinkingConfigurationPage() {
  const [linkSource, setLinkSource] = useState<LinkSource>("sitemap");
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedLinks, setDetectedLinks] = useState<DetectedLink[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkSuggestions, setLinkSuggestions] = useState<LinkSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load saved links and suggestions on mount
  useEffect(() => {
    loadDetectedLinks();
    loadLinkSuggestions();
  }, []);

  const loadDetectedLinks = async () => {
    try {
      const response = await fetch('/api/linking/get-detected-links');
      if (!response.ok) {
        throw new Error('Failed to load detected links');
      }
      const data = await response.json();
      setDetectedLinks(data.links || []);
    } catch (err) {
      console.error('Error loading detected links:', err);
    }
  };

  const handleDetectLinks = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const response = await fetch('/api/linking/scan-sitemap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sitemapUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to scan sitemap');
      }

      const data = await response.json();

      // Reload detected links from database
      await loadDetectedLinks();

      setError(null);
    } catch (err) {
      console.error('Failed to detect links:', err);
      setError(err instanceof Error ? err.message : 'Failed to scan sitemap. Please check the URL and try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const loadLinkSuggestions = async () => {
    try {
      const response = await fetch('/api/linking/get-link-suggestions');
      if (!response.ok) {
        throw new Error('Failed to load link suggestions');
      }
      const data = await response.json();
      setLinkSuggestions(data.suggestions || []);
    } catch (err) {
      console.error('Error loading link suggestions:', err);
    }
  };

  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      // Pass empty object to let backend use user's site
      const response = await fetch('/api/linking/generate-internal-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Failed to generate suggestions');
      }

      await loadLinkSuggestions();
    } catch (err) {
      console.error('Failed to generate suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
    } finally {
      setIsGenerating(false);
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
                  placeholder="Enter your sitemap URL (e.g., https://example.com/sitemap.xml)"
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

              {error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 flex gap-3">
                  <Info className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700 leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

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

              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Internal Linking</h3>
                <Button
                  onClick={handleGenerateSuggestions}
                  disabled={isGenerating || detectedLinks.length < 2}
                  className="w-full bg-purple-600 text-white hover:bg-purple-700 rounded-lg py-5 text-sm font-medium transition-colors"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Generating Suggestions...
                    </>
                  ) : (
                    "Generate Link Suggestions"
                  )}
                </Button>
                {detectedLinks.length < 2 && (
                  <p className="text-xs text-gray-500 mt-2">
                    Detect at least 2 pages to generate linking suggestions.
                  </p>
                )}
              </div>
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


        {/* Link Suggestions Section */}
        {linkSuggestions.length > 0 && (
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <LinkIcon className="h-4 w-4 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">
                Internal Link Suggestions
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th className="px-6 py-3">Source Page</th>
                    <th className="px-6 py-3">Target Page</th>
                    <th className="px-6 py-3">Suggested Anchor</th>
                    <th className="px-6 py-3">Format</th>
                  </tr>
                </thead>
                <tbody>
                  {linkSuggestions.map((suggestion) => (
                    <tr key={suggestion.id} className="bg-white border-b hover:bg-gray-50">
                      <td className="px-6 py-4 font-medium text-gray-900 truncate max-w-xs" title={suggestion.source_url}>
                        {suggestion.source_url}
                      </td>
                      <td className="px-6 py-4 truncate max-w-xs" title={suggestion.target_url}>
                        {suggestion.target_url}
                      </td>
                      <td className="px-6 py-4 text-blue-600 font-medium">
                        {suggestion.anchor_text}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${suggestion.relevance_score > 80 ? 'bg-green-100 text-green-800' :
                            suggestion.relevance_score > 50 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                            {suggestion.relevance_score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{suggestion.reasoning}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LinkingConfigurationPage;