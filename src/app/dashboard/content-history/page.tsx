"use client";

import { useState, useEffect } from "react";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  image_url: string;
  title: string;
  keyword: string;
  difficulty: number;
  volume: number;
  published_at: string;
}

function getDifficultyColor(difficulty: number) {
  if (difficulty <= 15) return "bg-green-100 text-green-700";
  if (difficulty <= 25) return "bg-yellow-100 text-yellow-700";
  if (difficulty <= 35) return "bg-orange-100 text-orange-700";
  return "bg-red-100 text-red-700";
}

function formatDate(dateString: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "2-digit",
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
        const response = await fetch("/api/articles?status=published");
        const data = await response.json();
        setArticles(data.articles || []);
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
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Content History</h1>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
            <p className="text-gray-500">No published articles yet. Articles will appear here once published.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="w-12 px-4 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === articles.length}
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-gray-500">
                      Image
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort("title")}
                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Title
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort("keyword")}
                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Keyword
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort("difficulty")}
                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Difficulty
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort("volume")}
                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Volume
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left">
                      <button
                        onClick={() => handleSort("date")}
                        className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                      >
                        Date
                        <ArrowUpDown className="h-3.5 w-3.5" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt=""
                            className="h-12 w-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-12 w-16 rounded-lg bg-gray-100" />
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-medium text-gray-900 line-clamp-2 max-w-xs">
                          {item.title}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{item.keyword || "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        {item.difficulty ? (
                          <span
                            className={cn(
                              "inline-flex items-center justify-center h-7 w-10 rounded-full text-xs font-semibold",
                              getDifficultyColor(item.difficulty)
                            )}
                          >
                            {item.difficulty}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{item.volume || "-"}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-600">{formatDate(item.published_at)}</span>
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