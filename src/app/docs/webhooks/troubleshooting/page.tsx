import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Wrench, AlertCircle, CheckCircle2, XCircle, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";

const issues = [
  {
    title: "Webhooks Not Being Received",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    solutions: [
      {
        problem: "Endpoint is not publicly accessible",
        solution: "Ensure your webhook endpoint is accessible from the internet. Test it using a tool like curl or Postman from outside your network. Localhost URLs won't work."
      },
      {
        problem: "Firewall blocking requests",
        solution: "Check your firewall settings and whitelist Ranklite's webhook IPs: 54.243.252.0/22, 54.243.128.0/22"
      },
      {
        problem: "SSL certificate issues",
        solution: "Ensure your HTTPS endpoint has a valid SSL certificate. Self-signed certificates are not supported."
      }
    ]
  },
  {
    title: "Signature Verification Failing",
    icon: AlertCircle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    solutions: [
      {
        problem: "Using wrong webhook secret",
        solution: "Verify you're using the correct webhook secret from your dashboard. Each webhook has its own unique secret."
      },
      {
        problem: "Modified request body",
        solution: "Ensure you're calculating the signature using the raw request body before any parsing or modification. Use raw body middleware in Express."
      },
      {
        problem: "Character encoding issues",
        solution: "Make sure the request body is UTF-8 encoded when calculating the signature hash."
      }
    ]
  },
  {
    title: "Webhook Timeouts",
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    solutions: [
      {
        problem: "Processing takes too long",
        solution: "Respond with 200 immediately and process the webhook asynchronously using a queue or background job."
      },
      {
        problem: "Database queries blocking response",
        solution: "Move all database operations and external API calls to an async background worker."
      },
      {
        problem: "Network latency",
        solution: "Ensure your server has good network connectivity and is geographically close to your target services."
      }
    ]
  },
  {
    title: "Duplicate Events",
    icon: CheckCircle2,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    solutions: [
      {
        problem: "No idempotency handling",
        solution: "Store processed event IDs in a database and check before processing. Use the event.id field as a unique identifier."
      },
      {
        problem: "Retry logic triggering duplicates",
        solution: "This is expected behavior. Always implement idempotency checks to handle duplicate deliveries gracefully."
      }
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
            Solutions to common webhook issues and debugging tips.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Quick Diagnostics</h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                Check Webhook Logs
              </h3>
              <p className="text-[14px] text-muted-foreground">
                Go to Settings → Webhooks in your dashboard. Click on your webhook to see delivery logs, including response codes and error messages.
              </p>
            </div>
            
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                Test Your Endpoint
              </h3>
              <p className="text-[14px] text-muted-foreground">
                Use the "Send Test Webhook" button in your dashboard to verify your endpoint is working correctly.
              </p>
            </div>
            
            <div className="rounded-lg border border-border p-4">
              <h3 className="mb-2 flex items-center gap-2 text-[16px] font-semibold text-foreground">
                <CheckCircle2 className="h-5 w-5 text-[#22C55E]" />
                Check Server Logs
              </h3>
              <p className="text-[14px] text-muted-foreground">
                Review your server logs for any errors or exceptions when receiving webhook requests.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {issues.map((issue) => (
            <div key={issue.title} className="rounded-2xl border border-border bg-white p-8 shadow-sm">
              <div className="mb-6 flex items-center gap-3">
                <div className={`rounded-lg ${issue.bgColor} p-3`}>
                  <issue.icon className={`h-6 w-6 ${issue.color}`} />
                </div>
                <h2 className="font-display text-[24px] font-semibold text-foreground">{issue.title}</h2>
              </div>
              
              <div className="space-y-6">
                {issue.solutions.map((solution, index) => (
                  <div key={index} className="rounded-lg border border-border p-5">
                    <div className="mb-3 flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div>
                        <h3 className="mb-1 text-[15px] font-semibold text-foreground">{solution.problem}</h3>
                        <p className="text-[14px] text-muted-foreground">{solution.solution}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Testing Tools</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-border p-5">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">webhook.site</h3>
              <p className="mb-3 text-[14px] text-muted-foreground">
                Get a unique URL to test webhook payloads without writing any code.
              </p>
              <a
                href="https://webhook.site"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#F59E0B] hover:underline"
              >
                Visit webhook.site →
              </a>
            </div>
            
            <div className="rounded-lg border border-border p-5">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">ngrok</h3>
              <p className="mb-3 text-[14px] text-muted-foreground">
                Create a public URL for your local development server to test webhooks.
              </p>
              <a
                href="https://ngrok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#F59E0B] hover:underline"
              >
                Visit ngrok.com →
              </a>
            </div>
            
            <div className="rounded-lg border border-border p-5">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">RequestBin</h3>
              <p className="mb-3 text-[14px] text-muted-foreground">
                Inspect HTTP requests in real-time with detailed headers and body.
              </p>
              <a
                href="https://requestbin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#F59E0B] hover:underline"
              >
                Visit requestbin.com →
              </a>
            </div>
            
            <div className="rounded-lg border border-border p-5">
              <h3 className="mb-2 text-[16px] font-semibold text-foreground">Postman</h3>
              <p className="mb-3 text-[14px] text-muted-foreground">
                Simulate webhook requests to test your endpoint's response handling.
              </p>
              <a
                href="https://postman.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] text-[#F59E0B] hover:underline"
              >
                Visit postman.com →
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Debug Checklist</h2>
          <div className="space-y-3">
            {[
              "Endpoint is publicly accessible via HTTPS",
              "SSL certificate is valid and not self-signed",
              "Webhook secret matches the one in dashboard",
              "Signature verification is implemented correctly",
              "Using raw request body for signature calculation",
              "Responding with 200 status code within 5 seconds",
              "Idempotency checks are in place",
              "Server logs show incoming requests",
              "No firewall or network restrictions",
              "Error handling and logging are implemented"
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-1 h-4 w-4 rounded border border-border"></div>
                <span className="text-[14px] text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-blue-600" />
            <div>
              <h3 className="mb-2 text-[18px] font-semibold text-blue-900">Still Having Issues?</h3>
              <p className="mb-4 text-[15px] leading-relaxed text-blue-800">
                If you've tried these solutions and are still experiencing problems, our support team can help debug your webhook implementation.
              </p>
              <a
                href="mailto:support@ranklite.com"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-[14px] font-semibold text-white transition-all hover:bg-blue-700"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/setup"
            className="group rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#F59E0B] hover:shadow-md"
          >
            <h3 className="mb-2 text-[18px] font-semibold text-foreground group-hover:text-[#F59E0B]">
              Webhook Setup →
            </h3>
            <p className="text-[14px] text-muted-foreground">
              Review the setup guide
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
              Check security best practices
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
