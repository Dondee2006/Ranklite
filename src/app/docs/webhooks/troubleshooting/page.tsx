import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ChevronRight, AlertCircle, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import Link from "next/link";

const issues = [
  {
    title: "Webhooks Not Being Received",
    icon: XCircle,
    color: "text-red-600 bg-red-50",
    causes: [
      "Endpoint URL is incorrect or unreachable",
      "Firewall blocking incoming requests",
      "Endpoint not using HTTPS",
      "Server is down or timing out"
    ],
    solutions: [
      "Verify your endpoint URL is correct and publicly accessible",
      "Check firewall rules allow incoming HTTPS traffic",
      "Ensure your endpoint uses a valid SSL certificate",
      "Check server logs for errors or timeouts",
      "Test endpoint with curl: curl -X POST https://your-endpoint.com"
    ]
  },
  {
    title: "Signature Verification Failing",
    icon: AlertCircle,
    color: "text-amber-600 bg-amber-50",
    causes: [
      "Using wrong webhook secret",
      "Modifying request body before verification",
      "Incorrect signature computation",
      "Secret not properly stored in environment"
    ],
    solutions: [
      "Copy secret from webhook settings and update environment variables",
      "Use raw request body for signature verification",
      "Verify you're using HMAC-SHA256 with 'sha256=' prefix",
      "Check for timing-safe comparison implementation",
      "Test with provided example payload and secret"
    ]
  },
  {
    title: "Webhook Timeouts",
    icon: Clock,
    color: "text-orange-600 bg-orange-50",
    causes: [
      "Endpoint taking too long to respond",
      "Synchronous processing of heavy operations",
      "Database queries blocking response",
      "External API calls delaying response"
    ],
    solutions: [
      "Respond with 200 immediately and process asynchronously",
      "Queue webhook data for background processing",
      "Optimize database queries and use indexes",
      "Move external API calls to background jobs",
      "Aim for response under 3 seconds (timeout at 5 seconds)"
    ]
  },
  {
    title: "Receiving Duplicate Webhooks",
    icon: Zap,
    color: "text-blue-600 bg-blue-50",
    causes: [
      "Endpoint not responding quickly enough",
      "Network issues causing retries",
      "Server returning non-200 status codes"
    ],
    solutions: [
      "Implement idempotency using event ID",
      "Store processed event IDs in database or cache",
      "Always respond with 200 even if event was already processed",
      "Check for duplicate IDs before processing",
      "Use Redis or database to track processed events"
    ]
  },
  {
    title: "Missing Expected Events",
    icon: AlertCircle,
    color: "text-purple-600 bg-purple-50",
    causes: [
      "Webhook not subscribed to specific event types",
      "Events filtered in webhook settings",
      "Webhook disabled or deleted"
    ],
    solutions: [
      "Check webhook event subscriptions in settings",
      "Verify webhook is active and enabled",
      "Review webhook logs in dashboard",
      "Test with 'Send Test Webhook' button",
      "Check webhook event history for patterns"
    ]
  }
];

export default function WebhookTroubleshootingPage() {
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
            Webhook Troubleshooting
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Common webhook issues and how to resolve them quickly.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <h3 className="mb-4 text-[20px] font-semibold text-blue-900">Debugging Tools</h3>
          <div className="space-y-3 text-[15px] text-blue-800">
            <p><strong>Webhook Logs:</strong> Dashboard → Settings → Webhooks → View Logs</p>
            <p><strong>Test Webhook:</strong> Send test payload to verify endpoint is working</p>
            <p><strong>Request Logs:</strong> Check recent webhook attempts, responses, and errors</p>
            <p><strong>Retry History:</strong> View failed deliveries and retry attempts</p>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 font-display text-[32px] font-semibold text-foreground">Common Issues</h2>
          <div className="space-y-8">
            {issues.map((issue, index) => (
              <div key={index} className="rounded-2xl border border-border bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-start gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${issue.color}`}>
                    <issue.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-display text-[22px] font-semibold text-foreground">{issue.title}</h3>
                  </div>
                </div>

                <div className="mb-6">
                  <h4 className="mb-3 text-[16px] font-semibold text-foreground">Common Causes:</h4>
                  <ul className="ml-6 space-y-2">
                    {issue.causes.map((cause, i) => (
                      <li key={i} className="text-[14px] text-muted-foreground">• {cause}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-3 text-[16px] font-semibold text-foreground">Solutions:</h4>
                  <div className="space-y-3">
                    {issue.solutions.map((solution, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
                        <p className="text-[14px] text-muted-foreground">{solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Testing Webhooks Locally</h2>
          <p className="mb-6 text-[16px] text-muted-foreground">
            To test webhooks on your local development environment, use a tunneling service:
          </p>

          <div className="mb-6">
            <h3 className="mb-3 text-[18px] font-semibold text-foreground">Using ngrok</h3>
            <div className="overflow-x-auto">
              <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
                {`# Install ngrok
npm install -g ngrok

# Start your local server (e.g., port 3000)
npm run dev

# In another terminal, create tunnel
ngrok http 3000

# Use the HTTPS URL from ngrok as your webhook endpoint
# Example: https://abc123.ngrok.io/api/webhooks/ranklite`}
              </pre>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-[18px] font-semibold text-foreground">Using Hookdeck (Alternative)</h3>
            <p className="mb-3 text-[15px] text-muted-foreground">
              Hookdeck provides additional debugging features for webhook development:
            </p>
            <ul className="ml-6 space-y-2 text-[14px] text-muted-foreground">
              <li>• Inspect webhook payloads in detail</li>
              <li>• Replay webhooks for testing</li>
              <li>• Filter and search webhook history</li>
              <li>• Monitor webhook performance</li>
            </ul>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Debugging Checklist</h2>
          <div className="space-y-3">
            {[
              "Verify endpoint URL is correct and publicly accessible",
              "Check webhook is enabled and subscribed to correct events",
              "Confirm HTTPS is used with valid SSL certificate",
              "Test signature verification with example payload",
              "Check server logs for errors or exceptions",
              "Verify endpoint responds within 5 seconds",
              "Test with &apos;Send Test Webhook&apos; in dashboard",
              "Review webhook delivery logs for error messages",
              "Confirm firewall allows incoming HTTPS traffic",
              "Validate webhook secret matches environment variable"
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-4">
                <input type="checkbox" className="mt-1 h-5 w-5 shrink-0 rounded border-gray-300 text-[#22C55E] focus:ring-[#22C55E]" />
                <label className="text-[15px] text-muted-foreground">{item}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Sample Curl Test</h2>
          <p className="mb-4 text-[16px] text-muted-foreground">
            Test your endpoint manually with curl:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
              {`curl -X POST https://your-domain.com/api/webhooks/ranklite \\
  -H "Content-Type: application/json" \\
  -H "X-Ranklite-Signature: sha256=test_signature" \\
  -d '{
    "id": "evt_test_123",
    "type": "article.published",
    "created": 1734134400,
    "data": {
      "article": {
        "id": "art_test",
        "title": "Test Article",
        "status": "published"
      }
    }
  }'`}
            </pre>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-amber-200 bg-amber-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
            <div>
              <h3 className="mb-2 text-[18px] font-semibold text-amber-900">Still Having Issues?</h3>
              <p className="mb-4 text-[15px] leading-relaxed text-amber-800">
                If you&apos;ve tried these solutions and still experiencing problems, contact our support team with:
              </p>
              <ul className="ml-6 space-y-2 text-[14px] text-amber-800">
                <li>• Your webhook endpoint URL</li>
                <li>• Webhook ID from settings</li>
                <li>• Recent error messages from logs</li>
                <li>• Screenshots of webhook configuration</li>
                <li>• Server logs showing the issue</li>
              </ul>
              <a
                href="mailto:support@ranklite.com"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-amber-600 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-amber-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/security"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">← Security & Verification</h3>
            <p className="text-[14px] text-muted-foreground">Learn how to secure webhook endpoints</p>
          </Link>
          <Link
            href="/docs/webhooks/setup"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">Webhook Setup →</h3>
            <p className="text-[14px] text-muted-foreground">Start from the beginning</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
