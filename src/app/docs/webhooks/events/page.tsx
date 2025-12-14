import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Webhook, FileText, Link as LinkIcon, AlertCircle, ChevronRight, Copy } from "lucide-react";
import Link from "next/link";

const events = [
  {
    type: "article.generated",
    description: "Triggered when an article is successfully generated",
    payload: {
      id: "evt_1234567890",
      type: "article.generated",
      created: 1703001234,
      data: {
        article: {
          id: "art_abc123",
          title: "10 Best SEO Practices for 2024",
          content: "Full article content here...",
          status: "draft",
          word_count: 1500,
          metadata: {
            keywords: ["SEO", "content marketing"],
            meta_description: "Learn the best SEO practices..."
          }
        }
      }
    }
  },
  {
    type: "article.published",
    description: "Triggered when an article is published to a CMS",
    payload: {
      id: "evt_0987654321",
      type: "article.published",
      created: 1703001235,
      data: {
        article: {
          id: "art_abc123",
          title: "10 Best SEO Practices for 2024",
          url: "https://example.com/blog/seo-practices-2024",
          published_at: "2024-12-14T10:30:00Z",
        },
        integration: {
          type: "wordpress",
          name: "My Blog"
        }
      }
    }
  },
  {
    type: "article.updated",
    description: "Triggered when an article's content is updated",
    payload: {
      id: "evt_1122334455",
      type: "article.updated",
      created: 1703001236,
      data: {
        article: {
          id: "art_abc123",
          title: "10 Best SEO Practices for 2024",
          changes: ["content", "metadata"],
          updated_at: "2024-12-14T11:00:00Z"
        }
      }
    }
  },
  {
    type: "article.deleted",
    description: "Triggered when an article is deleted",
    payload: {
      id: "evt_5544332211",
      type: "article.deleted",
      created: 1703001237,
      data: {
        article_id: "art_abc123",
        deleted_at: "2024-12-14T11:30:00Z"
      }
    }
  },
  {
    type: "integration.connected",
    description: "Triggered when a new integration is successfully connected",
    payload: {
      id: "evt_9988776655",
      type: "integration.connected",
      created: 1703001238,
      data: {
        integration: {
          id: "int_xyz789",
          type: "wordpress",
          name: "My Blog",
          url: "https://example.com"
        }
      }
    }
  },
  {
    type: "integration.error",
    description: "Triggered when an integration encounters an error",
    payload: {
      id: "evt_6677889900",
      type: "integration.error",
      created: 1703001239,
      data: {
        integration: {
          id: "int_xyz789",
          type: "wordpress",
          name: "My Blog"
        },
        error: {
          code: "auth_failed",
          message: "Invalid API credentials"
        }
      }
    }
  }
];

export default function WebhookEventsPage() {
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
            Webhook Events
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Reference guide for all webhook event types and their payload structures.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Event Structure</h2>
          <p className="mb-6 text-[15px] text-muted-foreground">
            All webhook events follow a consistent structure with the following fields:
          </p>
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-[14px]">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Field</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-foreground">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="px-6 py-3 font-mono text-[#F59E0B]">id</td>
                  <td className="px-6 py-3 text-muted-foreground">string</td>
                  <td className="px-6 py-3 text-muted-foreground">Unique event identifier</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-[#F59E0B]">type</td>
                  <td className="px-6 py-3 text-muted-foreground">string</td>
                  <td className="px-6 py-3 text-muted-foreground">Event type (e.g., article.generated)</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-[#F59E0B]">created</td>
                  <td className="px-6 py-3 text-muted-foreground">timestamp</td>
                  <td className="px-6 py-3 text-muted-foreground">Unix timestamp when event occurred</td>
                </tr>
                <tr>
                  <td className="px-6 py-3 font-mono text-[#F59E0B]">data</td>
                  <td className="px-6 py-3 text-muted-foreground">object</td>
                  <td className="px-6 py-3 text-muted-foreground">Event-specific payload data</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-12">
          {events.map((event, index) => (
            <div key={event.type} className="rounded-2xl border border-border bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <code className="mb-2 inline-block rounded-lg bg-orange-50 px-4 py-2 text-[15px] font-mono text-[#F59E0B]">
                    {event.type}
                  </code>
                  <p className="text-[15px] text-muted-foreground">{event.description}</p>
                </div>
              </div>
              
              <h3 className="mb-3 text-[16px] font-semibold text-foreground">Example Payload</h3>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                  <code>{JSON.stringify(event.payload, null, 2)}</code>
                </pre>
                <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Event Delivery</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Retry Logic</h3>
              <p className="mb-3 text-[15px] text-muted-foreground">
                If your endpoint fails to respond with a 2xx status code, Ranklite will retry the webhook:
              </p>
              <ul className="space-y-2 text-[15px] text-muted-foreground">
                <li>• Immediately after initial failure</li>
                <li>• After 5 minutes</li>
                <li>• After 30 minutes</li>
                <li>• After 2 hours</li>
                <li>• After 24 hours (final attempt)</li>
              </ul>
            </div>
            
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 text-blue-600" />
                <div>
                  <p className="mb-2 text-[14px] font-semibold text-blue-900">Important Notes</p>
                  <ul className="space-y-1 text-[13px] text-blue-800">
                    <li>• Events are delivered in order, but not guaranteed to arrive in order</li>
                    <li>• Duplicate events may be sent - implement idempotency using the event ID</li>
                    <li>• Events expire after 72 hours if not successfully delivered</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/security"
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#F59E0B] hover:shadow-md"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-foreground group-hover:text-[#F59E0B]">
              Security & Verification →
            </h3>
            <p className="text-[14px] text-muted-foreground">
              Learn how to verify webhook signatures
            </p>
          </Link>
          <Link
            href="/docs/webhooks/troubleshooting"
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#F59E0B] hover:shadow-md"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-foreground group-hover:text-[#F59E0B]">
              Troubleshooting →
            </h3>
            <p className="text-[14px] text-muted-foreground">
              Common issues and how to fix them
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
