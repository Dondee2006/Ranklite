"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPost {
  id: string;
  title: string;
  target_keyword: string;
  status: "Planned" | "Generated" | "Published";
  backlinks_assigned: number;
  indexing_status: "Indexed" | "Pending" | "Not Indexed";
  published_date: string;
}

const STATUS_COLORS = {
  Planned: "bg-[#F3F4F6] text-[#6B7280]",
  Generated: "bg-[#ECFDF5] text-[#059669]",
  Published: "bg-[#D1FAE5] text-[#065F46]",
};

const INDEXING_COLORS = {
  Indexed: "bg-[#D1FAE5] text-[#065F46]",
  Pending: "bg-[#FEF3C7] text-[#92400E]",
  "Not Indexed": "bg-[#F3F4F6] text-[#6B7280]",
};

export default function ContentPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setLoading(true);
    try {
      const response = await fetch("/api/content/posts");
      const data = await response.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Failed to load posts:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <header className="border-b border-[#E5E5E5] bg-white px-8 py-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[#1A1A1A]">Content</h1>
        </div>
      </header>

      <div className="p-8">
        <div className="rounded-lg border border-[#E5E5E5] bg-white shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[#22C55E]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-[#E5E5E5] bg-[#F9FAFB]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Target Keyword
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Backlinks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Indexing
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Published
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E5E5]">
                  {posts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-sm text-[#6B7280]">
                        No content yet
                      </td>
                    </tr>
                  ) : (
                    posts.map((post) => (
                      <tr key={post.id} className="hover:bg-[#F9FAFB] transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-[#1A1A1A]">{post.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{post.target_keyword}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                            STATUS_COLORS[post.status]
                          )}>
                            {post.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{post.backlinks_assigned}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium",
                            INDEXING_COLORS[post.indexing_status]
                          )}>
                            {post.indexing_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-[#6B7280]">{post.published_date}</div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/dashboard/content/${post.id}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-[#22C55E] hover:text-[#16A34A]"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
