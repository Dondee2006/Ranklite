import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ChevronRight, Webhook, Copy, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function WebhookSetupPage() {
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
            Webhook Setup
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Configure webhooks to receive real-time notifications when content is created, published, or updated.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">What are Webhooks?</h2>
          <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
            Webhooks allow you to receive HTTP POST notifications whenever specific events occur in your Ranklite account. 
            This enables real-time integrations with your own systems, automation workflows, and custom applications.
          </p>
          <div className="rounded-lg bg-[#F0FDF4] p-6">
            <h3 className="mb-3 text-[18px] font-semibold text-foreground">Common Use Cases</h3>
            <ul className="ml-6 space-y-2 text-[15px] text-muted-foreground">
              <li>Trigger custom workflows when new content is published</li>
              <li>Update external databases with article metadata</li>
              <li>Send notifications to Slack, Discord, or other platforms</li>
              <li>Sync content status across multiple systems</li>
              <li>Track content performance in custom analytics tools</li>
            </ul>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Creating a Webhook</h2>
          <div className="space-y-6">
            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[18px] font-bold text-white shadow-md shadow-green-500/20">
                1
              </div>
              <div className="flex-1">
                <h3 className="mb-3 font-display text-[22px] font-semibold text-foreground">Navigate to Webhooks Settings</h3>
                <p className="text-[16px] leading-relaxed text-muted-foreground">
                  Go to your <Link href="/dashboard/settings" className="text-[#22C55E] hover:underline">Dashboard → Settings → Webhooks</Link> or access directly through the Integrations menu.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[18px] font-bold text-white shadow-md shadow-green-500/20">
                2
              </div>
              <div className="flex-1">
                <h3 className="mb-3 font-display text-[22px] font-semibold text-foreground">Click "Add Webhook"</h3>
                <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
                  Click the "Add New Webhook" button to open the configuration form.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[18px] font-bold text-white shadow-md shadow-green-500/20">
                3
              </div>
              <div className="flex-1">
                <h3 className="mb-3 font-display text-[22px] font-semibold text-foreground">Configure Webhook Details</h3>
                <div className="rounded-lg border border-border bg-slate-50 p-6">
                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 text-[14px] font-semibold text-foreground">Endpoint URL</p>
                      <p className="text-[14px] text-muted-foreground">Your server endpoint that will receive webhook payloads (must use HTTPS)</p>
                      <code className="mt-2 block rounded bg-slate-100 px-3 py-2 text-[13px] text-slate-700">
                        https://your-domain.com/api/webhooks/ranklite
                      </code>
                    </div>
                    <div>
                      <p className="mb-2 text-[14px] font-semibold text-foreground">Events to Subscribe</p>
                      <p className="text-[14px] text-muted-foreground">Select which events should trigger this webhook</p>
                    </div>
                    <div>
                      <p className="mb-2 text-[14px] font-semibold text-foreground">Description (Optional)</p>
                      <p className="text-[14px] text-muted-foreground">Add a description to help identify this webhook</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-[18px] font-bold text-white shadow-md shadow-green-500/20">
                4
              </div>
              <div className="flex-1">
                <h3 className="mb-3 font-display text-[22px] font-semibold text-foreground">Save and Get Signing Secret</h3>
                <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
                  After saving, you'll receive a signing secret. Store this securely - you'll need it to verify webhook authenticity.
                </p>
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                    <div className="text-[14px] text-amber-800">
                      <strong>Important:</strong> The signing secret is shown only once. Copy it immediately and store it in a secure location like environment variables.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Webhook Payload Structure</h2>
          <p className="mb-4 text-[16px] text-muted-foreground">
            All webhooks send a JSON payload with this structure:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
{`{
  "id": "evt_1234567890",
  "type": "article.published",
  "created": 1734134400,
  "data": {
    "article": {
      "id": "art_abc123",
      "title": "Complete Guide to SEO in 2025",
      "url": "https://example.com/seo-guide-2025",
      "status": "published",
      "published_at": "2025-12-14T10:00:00Z",
      "keywords": ["seo", "search engine optimization"],
      "word_count": 2500
    }
  }
}`}
            </pre>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Testing Your Webhook</h2>
          <p className="mb-6 text-[16px] text-muted-foreground">
            Use the test functionality to verify your endpoint is working correctly:
          </p>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">1</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Click "Test Webhook"</p>
                <p className="text-[14px] text-muted-foreground">This sends a sample payload to your endpoint</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">2</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Verify Receipt</p>
                <p className="text-[14px] text-muted-foreground">Check your server logs to confirm the payload was received</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">3</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Respond with 200</p>
                <p className="text-[14px] text-muted-foreground">Your endpoint must return a 200 status code within 5 seconds</p>
              </div>
            </li>
          </ol>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Example Implementation</h2>
          <p className="mb-4 text-[16px] text-muted-foreground">
            Here's a basic Node.js/Express example:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
{`import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Verify webhook signature
function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

app.post('/api/webhooks/ranklite', (req, res) => {
  const signature = req.headers['x-ranklite-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify the webhook is from Ranklite
  if (!verifySignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }
  
  const { type, data } = req.body;
  
  // Handle different event types
  switch (type) {
    case 'article.published':
      console.log('Article published:', data.article.title);
      // Add your logic here
      break;
    case 'article.updated':
      console.log('Article updated:', data.article.title);
      break;
  }
  
  // Always respond with 200
  res.status(200).send('Webhook received');
});

app.listen(3000);`}
            </pre>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Best Practices</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Respond Quickly</p>
                <p className="text-[14px] text-muted-foreground">Process webhooks asynchronously and respond with 200 immediately</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Verify Signatures</p>
                <p className="text-[14px] text-muted-foreground">Always validate the webhook signature to ensure authenticity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Handle Retries</p>
                <p className="text-[14px] text-muted-foreground">Make your endpoint idempotent as webhooks may be sent multiple times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Use HTTPS</p>
                <p className="text-[14px] text-muted-foreground">Webhook endpoints must use HTTPS for security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Monitor Failures</p>
                <p className="text-[14px] text-muted-foreground">Set up alerts for webhook delivery failures</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/events"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">Event Types →</h3>
            <p className="text-[14px] text-muted-foreground">Learn about all available webhook events</p>
          </Link>
          <Link
            href="/docs/webhooks/security"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">Security & Verification →</h3>
            <p className="text-[14px] text-muted-foreground">Secure your webhook endpoints properly</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
