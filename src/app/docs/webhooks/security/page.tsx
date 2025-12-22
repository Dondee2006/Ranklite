import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { ChevronRight, Shield, Lock, Key, AlertCircle, CheckCircle } from "lucide-react";
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
            Webhook Security & Verification
          </h1>
          <p className="max-w-3xl text-[18px] leading-relaxed text-muted-foreground">
            Learn how to secure your webhook endpoints and verify that requests are genuinely from Ranklite.
          </p>
        </div>

        <div className="mb-16 rounded-2xl border border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-6 w-6 shrink-0 text-red-600" />
            <div>
              <h3 className="mb-2 text-[20px] font-semibold text-red-900">Critical Security Notice</h3>
              <p className="text-[15px] leading-relaxed text-red-800">
                Always verify webhook signatures before processing payloads. Without verification, malicious actors could send fake webhooks to your endpoint.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">How Webhook Signing Works</h2>
          <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
            <p>
              Ranklite signs every webhook with a secret key using HMAC-SHA256. Each webhook request includes an <code className="rounded bg-slate-100 px-2 py-1 text-[14px] text-slate-700">X-Ranklite-Signature</code> header containing the signature.
            </p>
            <div className="rounded-lg bg-[#F0FDF4] p-6">
              <h3 className="mb-3 text-[18px] font-semibold text-foreground">Verification Process:</h3>
              <ol className="ml-6 space-y-2 text-[15px]">
                <li>Ranklite creates a signature using your webhook secret</li>
                <li>The signature is sent in the request header</li>
                <li>Your server recreates the signature using the same secret</li>
                <li>If signatures match, the webhook is authentic</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Implementing Signature Verification</h2>

          <div className="mb-8">
            <h3 className="mb-4 text-[20px] font-semibold text-foreground">Node.js / Express</h3>
            <div className="overflow-x-auto">
              <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
                {`import crypto from 'crypto';
import express from 'express';

const app = express();

// Important: Use raw body for signature verification
app.use('/api/webhooks', express.raw({ type: 'application/json' }));

function verifyWebhookSignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(rawBody).digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

app.post('/api/webhooks/ranklite', (req, res) => {
  const signature = req.headers['x-ranklite-signature'];
  const secret = process.env.RANKLITE_WEBHOOK_SECRET;
  
  if (!signature || !verifyWebhookSignature(req.body, signature, secret)) {
    console.error('Invalid signature');
    return res.status(401).send('Unauthorized');
  }
  
  // Parse the verified body
  const event = JSON.parse(req.body.toString());
  
  // Process the webhook
  console.log('Verified webhook:', event.type);
  
  res.status(200).send('OK');
});`}
              </pre>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-[20px] font-semibold text-foreground">Python / Flask</h3>
            <div className="overflow-x-auto">
              <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
                {`import hmac
import hashlib
import os
from flask import Flask, request, abort

app = Flask(__name__)

def verify_signature(payload, signature, secret):
    expected_sig = 'sha256=' + hmac.new(
        secret.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()
    
    return hmac.compare_digest(expected_sig, signature)

@app.route('/api/webhooks/ranklite', methods=['POST'])
def webhook():
    signature = request.headers.get('X-Ranklite-Signature')
    secret = os.environ.get('RANKLITE_WEBHOOK_SECRET')
    
    if not signature or not verify_signature(request.data, signature, secret):
        abort(401)
    
    event = request.get_json()
    print(f"Verified webhook: {event['type']}")
    
    return 'OK', 200`}
              </pre>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="mb-4 text-[20px] font-semibold text-foreground">PHP</h3>
            <div className="overflow-x-auto">
              <pre className="rounded-lg bg-slate-900 p-6 text-[13px] text-slate-100">
                {`<?php
function verifyWebhookSignature($payload, $signature, $secret) {
    $expectedSignature = 'sha256=' . hash_hmac('sha256', $payload, $secret);
    return hash_equals($expectedSignature, $signature);
}

$payload = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_RANKLITE_SIGNATURE'];
$secret = getenv('RANKLITE_WEBHOOK_SECRET');

if (!verifyWebhookSignature($payload, $signature, $secret)) {
    http_response_code(401);
    die('Unauthorized');
}

$event = json_decode($payload, true);
error_log("Verified webhook: " . $event['type']);

http_response_code(200);
echo 'OK';
?>`}
              </pre>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Security Best Practices</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Always Use HTTPS</p>
                <p className="text-[14px] text-muted-foreground">Ranklite only sends webhooks to HTTPS endpoints to prevent man-in-the-middle attacks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Store Secrets Securely</p>
                <p className="text-[14px] text-muted-foreground">Never hardcode webhook secrets. Use environment variables or secure secret management</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Use Timing-Safe Comparison</p>
                <p className="text-[14px] text-muted-foreground">Use constant-time string comparison to prevent timing attacks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Verify Before Processing</p>
                <p className="text-[14px] text-muted-foreground">Always verify the signature before processing any webhook data</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Implement Rate Limiting</p>
                <p className="text-[14px] text-muted-foreground">Protect your endpoint from abuse with rate limiting</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 shrink-0 text-[#22C55E]" />
              <div>
                <p className="text-[15px] font-semibold text-foreground">Log Security Events</p>
                <p className="text-[14px] text-muted-foreground">Log all verification failures for security monitoring</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-border bg-white p-8 shadow-sm">
          <h2 className="mb-6 font-display text-[28px] font-semibold text-foreground">Rotating Webhook Secrets</h2>
          <p className="mb-6 text-[16px] text-muted-foreground">
            If you suspect your webhook secret has been compromised, rotate it immediately:
          </p>
          <ol className="space-y-4">
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">1</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Generate New Secret</p>
                <p className="text-[14px] text-muted-foreground">Go to Settings → Webhooks → Edit webhook → Regenerate Secret</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">2</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Update Your Endpoint</p>
                <p className="text-[14px] text-muted-foreground">Update your server with the new secret before the old one expires</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F0FDF4] text-[14px] font-semibold text-[#22C55E]">3</span>
              <div>
                <p className="text-[15px] font-semibold text-foreground">Test Verification</p>
                <p className="text-[14px] text-muted-foreground">Use the &quot;Test Webhook&quot; button to verify the new secret works</p>
              </div>
            </li>
          </ol>
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <p className="text-[14px] text-amber-800">
                The old secret remains valid for 24 hours after rotation to prevent service disruption.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-16 rounded-2xl border border-blue-200 bg-blue-50 p-8">
          <h3 className="mb-4 text-[20px] font-semibold text-blue-900">Testing Signature Verification</h3>
          <p className="mb-4 text-[15px] text-blue-800">
            You can test your signature verification with this example payload and secret:
          </p>
          <div className="overflow-x-auto">
            <pre className="rounded-lg bg-slate-900 p-4 text-[12px] text-slate-100">
              {`Secret: whsec_test_secret_12345
Payload: {"id":"evt_test","type":"article.published","created":1734134400}
Expected Signature: sha256=9c5b94b1e7f3d6c4a8f2e1d3b5c7a9e2f4d6c8b0a1e3c5d7e9b2a4c6d8e0f2`}
            </pre>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Link
            href="/docs/webhooks/events"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">← Event Types</h3>
            <p className="text-[14px] text-muted-foreground">Learn about all available webhook events</p>
          </Link>
          <Link
            href="/docs/webhooks/troubleshooting"
            className="rounded-2xl border border-border bg-white p-6 shadow-sm transition-all hover:border-[#22C55E] hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-[20px] font-semibold text-foreground">Troubleshooting →</h3>
            <p className="text-[14px] text-muted-foreground">Resolve common webhook issues</p>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
