import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Code, Lock, Zap, AlertCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

const apiEndpoints = [
  {
    method: "POST",
    endpoint: "/api/v1/articles/generate",
    description: "Generate a new SEO-optimized article",
    color: "text-green-600 bg-green-50 border-green-200",
  },
  {
    method: "GET",
    endpoint: "/api/v1/articles",
    description: "List all articles in your account",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    method: "GET",
    endpoint: "/api/v1/articles/{id}",
    description: "Retrieve a specific article by ID",
    color: "text-blue-600 bg-blue-50 border-blue-200",
  },
  {
    method: "PATCH",
    endpoint: "/api/v1/articles/{id}",
    description: "Update an existing article",
    color: "text-amber-600 bg-amber-50 border-amber-200",
  },
  {
    method: "DELETE",
    endpoint: "/api/v1/articles/{id}",
    description: "Delete an article",
    color: "text-red-600 bg-red-50 border-red-200",
  },
];

const quickLinks = [
  { title: "API Authentication", href: "/docs/api/auth", description: "Learn how to authenticate API requests" },
  { title: "Generate Content", href: "/docs/api/generate", description: "Create SEO-optimized articles programmatically" },
  { title: "Manage Articles", href: "/docs/api/articles", description: "CRUD operations for your content" },
  { title: "Rate Limits", href: "/docs/api/limits", description: "Understand API usage limits and quotas" },
];

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1200px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16">
          <Link
            href="/docs"
            className="mb-6 inline-flex items-center gap-2 text-[14px] text-muted-foreground transition-colors hover:text-[#22C55E]"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Documentation
          </Link>
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[56px]">
            API Reference
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Integrate Ranklite into your application with our REST API. Generate content, manage articles, and automate your SEO workflow programmatically.
          </p>
        </div>

        <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.title}
              href={link.href}
              className="group rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <h3 className="mb-2 text-[16px] font-semibold text-foreground group-hover:text-[#22C55E]">
                {link.title}
              </h3>
              <p className="text-[14px] text-muted-foreground">{link.description}</p>
            </Link>
          ))}
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] shadow-md shadow-green-500/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="mb-2 font-display text-[24px] font-semibold text-foreground">Authentication</h2>
              <p className="text-[15px] text-muted-foreground">
                All API requests require authentication using an API key. Include your API key in the Authorization header.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 p-4">
            <code className="text-[14px] text-slate-100">
              Authorization: Bearer YOUR_API_KEY
            </code>
          </div>
          <p className="mt-4 text-[14px] text-muted-foreground">
            Get your API key from your{" "}
            <Link href="/dashboard/settings" className="text-[#22C55E] hover:underline">
              account settings
            </Link>
            .
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">API Endpoints</h2>
          <div className="space-y-4">
            {apiEndpoints.map((endpoint, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                <div className="mb-2 flex flex-wrap items-center gap-3">
                  <span className={`rounded-md border px-3 py-1 text-[13px] font-semibold ${endpoint.color}`}>
                    {endpoint.method}
                  </span>
                  <code className="text-[15px] font-medium text-foreground">{endpoint.endpoint}</code>
                </div>
                <p className="text-[14px] text-muted-foreground">{endpoint.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#3B82F6] to-[#2563EB] shadow-md shadow-blue-500/20">
              <Code className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="mb-2 font-display text-[24px] font-semibold text-foreground">Example Request</h2>
              <p className="text-[15px] text-muted-foreground">
                Here&apos;s a basic example of generating an article using the API.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 p-6">
            <pre className="overflow-x-auto text-[13px] leading-relaxed text-slate-100">
              {`curl -X POST https://api.ranklite.com/v1/articles/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "keyword": "best running shoes 2025",
    "tone": "professional",
    "length": 2000,
    "include_images": true
  }'`}
            </pre>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] shadow-md shadow-purple-500/20">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="mb-2 font-display text-[24px] font-semibold text-foreground">Response Format</h2>
              <p className="text-[15px] text-muted-foreground">
                All API responses are returned in JSON format with consistent structure.
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-900 p-6">
            <pre className="overflow-x-auto text-[13px] leading-relaxed text-slate-100">
              {`{
  "success": true,
  "data": {
    "id": "art_abc123",
    "title": "The Best Running Shoes of 2025",
    "content": "...",
    "status": "published",
    "created_at": "2025-12-14T10:30:00Z"
  }
}`}
            </pre>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="mb-2 text-[18px] font-semibold text-amber-900">Rate Limits</h3>
              <p className="text-[15px] leading-relaxed text-amber-800">
                API requests are rate limited to ensure fair usage. Free accounts are limited to 100 requests per day, Pro accounts get 10,000 requests per day. View detailed rate limit information in the{" "}
                <Link href="/docs/api/limits" className="font-semibold underline">
                  Rate Limits documentation
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
