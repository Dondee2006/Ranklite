import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ChevronRight, FileText, Clock, Trash2, AlertTriangle } from "lucide-react";
import Link from "next/link";

const events = [
  {
    name: "article.created",
    icon: FileText,
    color: "text-blue-600 bg-blue-50",
    description: "Triggered when a new article is generated or created",
    payload: {
      article: {
        id: "art_abc123",
        title: "Your Article Title",
        status: "draft",
        created_at: "2025-12-14T10:00:00Z",
        word_count: 2500,
      }
    }
  },
  {
    name: "article.published",
    icon: FileText,
    color: "text-green-600 bg-green-50",
    description: "Triggered when an article is published to your website",
    payload: {
      article: {
        id: "art_abc123",
        title: "Your Article Title",
        url: "https://example.com/article",
        status: "published",
        published_at: "2025-12-14T10:00:00Z",
        word_count: 2500,
      }
    }
  },
  {
    name: "article.updated",
    icon: Clock,
    color: "text-amber-600 bg-amber-50",
    description: "Triggered when an existing article is modified",
    payload: {
      article: {
        id: "art_abc123",
        title: "Updated Article Title",
        status: "published",
        updated_at: "2025-12-14T11:30:00Z",
        changes: ["title", "content"],
      }
    }
  },
  {
    name: "article.deleted",
    icon: Trash2,
    color: "text-red-600 bg-red-50",
    description: "Triggered when an article is deleted from the system",
    payload: {
      article: {
        id: "art_abc123",
        title: "Deleted Article",
        deleted_at: "2025-12-14T12:00:00Z",
      }
    }
  },
  {
    name: "article.scheduled",
    icon: Clock,
    color: "text-purple-600 bg-purple-50",
    description: "Triggered when an article is scheduled for future publication",
    payload: {
      article: {
        id: "art_abc123",
        title: "Scheduled Article",
        status: "scheduled",
        scheduled_for: "2025-12-15T09:00:00Z",
      }
    }
  },
  {
    name: "article.failed",
    icon: AlertTriangle,
    color: "text-red-600 bg-red-50",
    description: "Triggered when article generation or publishing fails",
    payload: {
      article: {
        id: "art_abc123",
        title: "Failed Article",
        status: "failed",
        error: "Publishing failed: Connection timeout",
        failed_at: "2025-12-14T10:30:00Z",
      }
    }
  },
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
            Webhook Event Types
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Complete reference of all webhook events you can subscribe to in Ranklite.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-4 font-display text-[28px] font-semibold text-foreground">Event Structure</h2>
          <p className="mb-6 text-[16px] text-muted-foreground">
            All webhook events follow this consistent structure:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
{`{
  "id": "evt_1234567890",      // Unique event identifier
  "type": "article.published",  // Event type
  "created": 1734134400,        // Unix timestamp
  "data": {
    // Event-specific payload
  }
}`}
            </pre>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Available Events</h2>
          <div className="space-y-6">
            {events.map((event) => (
              <div key={event.name} className="rounded-2xl border border-border bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${event.color}`}>
                    <event.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-mono text-[20px] font-semibold text-foreground">{event.name}</h3>
                    <p className="text-[15px] text-muted-foreground">{event.description}</p>
                  </div>
                </div>
                <div>
                  <h4 className="mb-3 text-[16px] font-semibold text-foreground">Example Payload</h4>
                  <div className="overflow-x-auto">
                    <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
                      {JSON.stringify({
                        id: "evt_1234567890",
                        type: event.name,
                        created: 1734134400,
                        data: event.payload
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Event Filtering</h2>
          <p className="mb-4 text-[16px] text-muted-foreground">
            When creating a webhook, you can subscribe to specific events or all events. To filter events:
          </p>
          <ol className="ml-6 space-y-3 text-[15px] text-muted-foreground">
            <li><strong className="text-foreground">1. Go to Settings → Webhooks</strong></li>
            <li><strong className="text-foreground">2. Edit your webhook</strong></li>
            <li><strong className="text-foreground">3. Select the events you want to receive</strong></li>
            <li><strong className="text-foreground">4. Save your changes</strong></li>
          </ol>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Handling Events</h2>
          <p className="mb-4 text-[16px] text-muted-foreground">
            Example of handling multiple event types in your webhook endpoint:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
{`app.post('/api/webhooks/ranklite', async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'article.created':
      // Handle new article
      await handleNewArticle(data.article);
      break;
      
    case 'article.published':
      // Send notification
      await sendNotification(\`Article published: \${data.article.title}\`);
      break;
      
    case 'article.updated':
      // Sync with external system
      await syncArticle(data.article);
      break;
      
    case 'article.failed':
      // Alert team
      await alertTeam(data.article.error);
      break;
      
    default:
      console.log(\`Unhandled event type: \${type}\`);
  }
  
  res.status(200).send('OK');
});`}
            </pre>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <h3 className="mb-3 text-[20px] font-semibold text-blue-900">Event Delivery</h3>
          <ul className="ml-6 space-y-2 text-[15px] text-blue-800">
            <li><strong>Order:</strong> Events are delivered in the order they occur</li>
            <li><strong>Retry:</strong> Failed deliveries are retried up to 3 times with exponential backoff</li>
            <li><strong>Timeout:</strong> Your endpoint must respond within 5 seconds</li>
            <li><strong>Idempotency:</strong> Use the event ID to handle duplicate deliveries</li>
          </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/setup"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">← Webhook Setup</h3>
            <p className="text-[14px] text-muted-foreground">Learn how to create and configure webhooks</p>
          </Link>
          <Link
            href="/docs/webhooks/security"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">Security & Verification →</h3>
            <p className="text-[14px] text-muted-foreground">Secure your webhook endpoints</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
