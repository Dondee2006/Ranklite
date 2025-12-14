import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { Shield, Key, Lock, AlertTriangle, ChevronRight, Copy, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function WebhookSecurityPage() {
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
            Webhook Security
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Best practices for securing your webhook endpoints and verifying webhook authenticity.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-orange-200 bg-orange-50 p-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 shrink-0 text-orange-600" />
            <div>
              <h3 className="mb-2 text-[18px] font-semibold text-orange-900">Security First</h3>
              <p className="text-[15px] leading-relaxed text-orange-800">
                Always verify webhook signatures before processing events. Without verification, attackers could send fake events to your endpoint.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Signature Verification</h2>
          <p className="mb-6 text-[15px] text-muted-foreground">
            Every webhook request includes a signature in the <code className="rounded bg-slate-100 px-2 py-1 font-mono text-[13px]">x-ranklite-signature</code> header. This signature is created using your webhook secret and the request payload.
          </p>
          
          <div className="mb-6">
            <h3 className="mb-3 text-[18px] font-semibold text-foreground">Getting Your Webhook Secret</h3>
            <ol className="list-decimal space-y-2 pl-6 text-[15px] text-muted-foreground">
              <li>Go to Settings → Webhooks in your Ranklite dashboard</li>
              <li>Click on your webhook endpoint</li>
              <li>Copy the "Signing Secret"</li>
              <li>Store it securely as an environment variable</li>
            </ol>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-foreground">Node.js Example</h3>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                  <code>{`const crypto = require('crypto');

function verifyWebhookSignature(req) {
  const signature = req.headers['x-ranklite-signature'];
  const webhookSecret = process.env.RANKLITE_WEBHOOK_SECRET;
  
  // Create HMAC SHA256 hash of the payload
  const payload = JSON.stringify(req.body);
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
  
  // Compare signatures (timing-safe comparison)
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

app.post('/webhooks/ranklite', (req, res) => {
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process the webhook
  const event = req.body;
  console.log('Verified event:', event.type);
  
  res.status(200).json({ received: true });
});`}</code>
                </pre>
                <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-foreground">Python Example</h3>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                  <code>{`import hmac
import hashlib
import os
from flask import Flask, request, jsonify

app = Flask(__name__)

def verify_webhook_signature(request):
    signature = request.headers.get('x-ranklite-signature')
    webhook_secret = os.environ.get('RANKLITE_WEBHOOK_SECRET')
    
    # Create HMAC SHA256 hash of the payload
    payload = request.get_data()
    expected_signature = hmac.new(
        webhook_secret.encode('utf-8'),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    # Compare signatures (timing-safe comparison)
    return hmac.compare_digest(signature, expected_signature)

@app.route('/webhooks/ranklite', methods=['POST'])
def webhook():
    if not verify_webhook_signature(request):
        return jsonify({'error': 'Invalid signature'}), 401
    
    # Process the webhook
    event = request.json
    print(f'Verified event: {event["type"]}')
    
    return jsonify({'received': True}), 200`}</code>
                </pre>
                <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-[16px] font-semibold text-foreground">PHP Example</h3>
              <div className="relative">
                <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
                  <code>{`<?php

function verifyWebhookSignature($payload, $signature) {
    $webhookSecret = getenv('RANKLITE_WEBHOOK_SECRET');
    
    // Create HMAC SHA256 hash of the payload
    $expectedSignature = hash_hmac('sha256', $payload, $webhookSecret);
    
    // Compare signatures (timing-safe comparison)
    return hash_equals($signature, $expectedSignature);
}

// Get the raw POST body
$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_RANKLITE_SIGNATURE'] ?? '';

if (!verifyWebhookSignature($payload, $signature)) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

// Process the webhook
$event = json_decode($payload, true);
error_log('Verified event: ' . $event['type']);

http_response_code(200);
echo json_encode(['received' => true]);`}</code>
                </pre>
                <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Best Practices</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Always Use HTTPS</h3>
                <p className="text-[14px] text-muted-foreground">
                  Webhooks are only sent to HTTPS endpoints to ensure data is encrypted in transit.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Verify Every Request</h3>
                <p className="text-[14px] text-muted-foreground">
                  Always verify the webhook signature before processing events. Never skip this step.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Use Timing-Safe Comparison</h3>
                <p className="text-[14px] text-muted-foreground">
                  Use timing-safe comparison functions to prevent timing attacks when comparing signatures.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Protect Your Webhook Secret</h3>
                <p className="text-[14px] text-muted-foreground">
                  Store your webhook secret securely as an environment variable. Never commit it to version control.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Implement Idempotency</h3>
                <p className="text-[14px] text-muted-foreground">
                  Store processed event IDs to prevent duplicate processing if the same event is delivered multiple times.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <h3 className="mb-1 text-[16px] font-semibold text-foreground">Rate Limit Your Endpoint</h3>
                <p className="text-[14px] text-muted-foreground">
                  Implement rate limiting to protect against potential abuse or misconfiguration.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Idempotency Implementation</h2>
          <p className="mb-6 text-[15px] text-muted-foreground">
            Store processed event IDs to prevent duplicate processing:
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-[13px] text-slate-100">
              <code>{`// Using a Set to store processed event IDs (in production, use a database)
const processedEvents = new Set();

app.post('/webhooks/ranklite', async (req, res) => {
  if (!verifyWebhookSignature(req)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = req.body;
  
  // Check if we've already processed this event
  if (processedEvents.has(event.id)) {
    console.log('Duplicate event ignored:', event.id);
    return res.status(200).json({ received: true });
  }
  
  // Mark event as processed
  processedEvents.add(event.id);
  
  // Process the event
  await handleEvent(event);
  
  res.status(200).json({ received: true });
});`}</code>
            </pre>
            <button className="absolute right-3 top-3 rounded-md bg-slate-800 p-2 text-slate-400 transition-colors hover:bg-slate-700 hover:text-white">
              <Copy className="h-4 w-4" />
            </button>
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
              Learn about all available webhook events
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
              Fix common webhook issues
            </p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
