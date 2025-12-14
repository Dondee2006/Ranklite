import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Webhook, Code, Settings, Key, ChevronRight, CheckCircle, Copy } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: 1,
    title: "Create a Webhook Endpoint",
    description: "Set up an HTTPS endpoint on your server that can receive POST requests. Your endpoint must respond with a 200 status code within 5 seconds.",
    code: `// Express.js example
app.post('/webhooks/ranklite', async (req, res) => {
  const event = req.body;
  console.log('Received webhook:', event.type);
  res.status(200).json({ received: true });
});`,
  },
  {
    number: 2,
    title: "Add Webhook in Dashboard",
    description: "Navigate to Settings > Webhooks in your Ranklite dashboard. Enter your endpoint URL and select which events you want to receive.",
  },
  {
    number: 3,
    title: "Verify the Webhook",
    description: "Click 'Test Webhook' to send a test event. Your endpoint should receive a test payload and respond with a 200 status code.",
  },
  {
    number: 4,
    title: "Handle Events",
    description: "Process incoming webhook events based on their type. Each event contains relevant data about the action that occurred.",
  },
];

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
            Configure webhooks to receive real-time notifications when articles are generated, published, or updated.
          </p>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Setup Steps</h2>
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] text-[18px] font-bold text-white shadow-md shadow-orange-500/20">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="mb-3 font-display text-[22px] font-semibold text-foreground">{step.title}</h3>
                  <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">{step.description}</p>
                  {step.code && (
                    <div className="relative">
                      <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                        <code>{step.code}</code>
                      </pre>
                      <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Webhook Configuration</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Endpoint Requirements</h3>
              <ul className="space-y-2 text-[15px] text-muted-foreground">
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <span>Must be a valid HTTPS URL (HTTP not supported for security)</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <span>Must respond with HTTP 200-299 status code within 5 seconds</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <span>Should process events asynchronously to avoid timeouts</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0 text-[#F59E0B]" />
                  <span>Must be publicly accessible (no localhost or private IPs)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Event Selection</h2>
          <p className="mb-6 text-[15px] text-muted-foreground">
            Choose which events you want to receive. You can subscribe to all events or select specific ones:
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              { name: "article.generated", description: "Article content has been generated" },
              { name: "article.published", description: "Article has been published to CMS" },
              { name: "article.updated", description: "Article content has been updated" },
              { name: "article.deleted", description: "Article has been deleted" },
              { name: "integration.connected", description: "New integration connected" },
              { name: "integration.error", description: "Integration error occurred" },
            ].map((event) => (
              <div key={event.name} className="rounded-lg border border-border p-4">
                <code className="mb-2 block text-[13px] font-mono text-[#F59E0B]">{event.name}</code>
                <p className="text-[14px] text-muted-foreground">{event.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Complete Example</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-foreground">Express.js Webhook Handler</h3>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                  <code>{`const express = require('express');
const crypto = require('crypto');

app.use(express.json());

app.post('/webhooks/ranklite', async (req, res) => {
  // Verify webhook signature (recommended)
  const signature = req.headers['x-ranklite-signature'];
  const webhookSecret = process.env.RANKLITE_WEBHOOK_SECRET;
  
  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== hash) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process event
  const event = req.body;
  
  switch (event.type) {
    case 'article.generated':
      await handleArticleGenerated(event.data);
      break;
    case 'article.published':
      await handleArticlePublished(event.data);
      break;
    default:
      console.log('Unhandled event type:', event.type);
  }
  
  // Respond quickly
  res.status(200).json({ received: true });
});

async function handleArticleGenerated(data) {
  console.log('New article:', data.article.title);
  // Your custom logic here
}

async function handleArticlePublished(data) {
  console.log('Published:', data.article.url);
  // Your custom logic here
}`}</code>
                </pre>
                <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Testing Webhooks</h2>
          <div className="space-y-4">
            <p className="text-[15px] text-muted-foreground">
              Use the webhook testing tools in your dashboard to verify your endpoint is working correctly:
            </p>
            <ol className="list-decimal space-y-3 pl-6 text-[15px] text-muted-foreground">
              <li>Click "Test Webhook" in the dashboard</li>
              <li>Check your server logs to see if the test event was received</li>
              <li>Verify the response status code is 200</li>
              <li>Review the event payload structure</li>
            </ol>
            <div className="mt-6 rounded-lg bg-blue-50 p-4">
              <p className="text-[14px] text-blue-900">
                <strong>Pro Tip:</strong> Use tools like{" "}
                <a href="https://webhook.site" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  webhook.site
                </a>{" "}
                or{" "}
                <a href="https://ngrok.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  ngrok
                </a>{" "}
                to test webhooks during development.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/events"
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#F59E0B] hover:shadow-md"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-foreground group-hover:text-[#F59E0B]">
              Event Types →
            </h3>
            <p className="text-[14px] text-muted-foreground">
              Learn about all available webhook events and their payloads
            </p>
          </Link>
          <Link
            href="/docs/webhooks/security"
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#F59E0B] hover:shadow-md"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-foreground group-hover:text-[#F59E0B]">
              Security & Verification →
            </h3>
            <p className="text-[14px] text-muted-foreground">
              Best practices for securing your webhook endpoints
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
