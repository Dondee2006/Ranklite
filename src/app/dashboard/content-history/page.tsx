"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  image_url: string | null;
  title: string;
  keyword: string | null;
  difficulty: number | null;
  volume: number | null;
  published_at: string | null;
  status: string;
}

function getDifficultyBadge(difficulty: number | null) {
  if (difficulty === null) return <span className="text-gray-300">-</span>;

  // Style: Outlined box with colored border and text, slightly rounded
  let colorClass = "border-red-200 text-red-600 bg-red-50";
  if (difficulty <= 20) colorClass = "border-[#22C55E] text-[#22C55E] bg-[#22C55E]/10";
  else if (difficulty <= 40) colorClass = "border-yellow-300 text-yellow-700 bg-yellow-50";
  else if (difficulty <= 60) colorClass = "border-orange-300 text-orange-700 bg-orange-50";

  return (
    <span className={cn("inline-flex items-center justify-center min-w-[32px] h-7 px-2 border rounded-md text-xs font-semibold", colorClass)}>
      {difficulty}
    </span>
  );
}

function getStatusBadge(status: string) {
  const s = status?.toLowerCase() || "draft";
  let styles = "bg-gray-100 text-gray-600 border-gray-200";

  if (s === "published") styles = "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20";
  else if (s === "scheduled") styles = "bg-blue-50 text-blue-600 border-blue-200";
  else if (s === "generated") styles = "bg-purple-50 text-purple-600 border-purple-200";

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border", styles)}>
      {s}
    </span>
  );
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ContentHistoryPage() {
  const [articles, setArticles] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    async function loadArticles() {
      try {
        const response = await fetch("/api/articles");
        const data = await response.json();
        // Sort by date desc default
        const sorted = (data.articles || []).sort((a: any, b: any) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setArticles(sorted);
      } catch (error) {
        console.error("Failed to load articles:", error);
      } finally {
        setLoading(false);
      }
    }
    loadArticles();
  }, []);

  const toggleSelectAll = () => {
    if (selectedItems.length === articles.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(articles.map((item) => item.id));
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSort = (field: string) => {
    // Sorting logic placeholder - for now just UI updates
    setSortField(field);
    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <div className="px-8 py-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-[#1A1F2E]" style={{ fontFamily: "var(--font-display)" }}>Content History</h1>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
            <p className="text-gray-500">No articles found. Start by planning content in the Content Planner.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/30">
                    <th className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length > 0 && selectedItems.length === articles.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E] focus:ring-offset-0"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Image
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("title")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Title <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("keyword")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Keyword <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("difficulty")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Difficulty <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("volume")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Volume <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("status")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Status <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left">
                      <button onClick={() => handleSort("date")} className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600">
                        Date <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {articles.map((item) => (
                    <tr
                      key={item.id}
                      className={cn("group transition-colors", selectedItems.includes(item.id) ? "bg-green-50/30" : "hover:bg-gray-50/50")}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E] focus:ring-offset-0"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-12 w-16 rounded-lg bg-gray-100 overflow-hidden relative border border-gray-100 dark:border-gray-800">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-300">
                              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-[#1A1F2E] line-clamp-2 max-w-[280px]">
                          {item.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 font-medium">{item.keyword || "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getDifficultyBadge(item.difficulty)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500 font-medium">{item.volume ? item.volume.toLocaleString() : "—"}</span>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-500">{formatDate(item.published_at || (item as any).created_at)}</span>
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