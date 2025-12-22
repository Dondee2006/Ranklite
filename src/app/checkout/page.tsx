"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Lock,
  Shield,
  CheckCircle2,
  ArrowLeft,
  Building2,
  User,
  Mail,
  Phone
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      alert("Payment simulation complete! Add your Flutterwave keys to enable real payments.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F7FA] via-white to-[#FEF3E2]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto max-w-[1200px] px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-[#FF6B2C] hover:opacity-80 transition-opacity">
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1.5 border-emerald-200 bg-emerald-50 text-emerald-700">
                <Shield className="h-3 w-3" />
                Secure Checkout
              </Badge>
              <img
                src="https://flutterwave.com/images/logo/full.svg"
                alt="Flutterwave"
                className="h-6"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden text-lg font-bold text-[#FF6B2C]">Flutterwave</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-[1200px] px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr,420px]">
          {/* Left: Payment Form */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card className="border-0 shadow-lg shadow-black/5">
              <div className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF9B5C] flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                    <p className="text-sm text-gray-500">We&apos;ll send your receipt here</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone Number
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+1 (555) 000-0000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="pl-10 h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Method */}
            <Card className="border-0 shadow-lg shadow-black/5">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#FF6B2C] to-[#FF9B5C] flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Payment Details</h2>
                    <p className="text-sm text-gray-500">Complete your secure payment</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber" className="text-sm font-medium text-gray-700">
                      Card Number
                    </Label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="cardNumber"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        maxLength={19}
                        className="pl-10 h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry" className="text-sm font-medium text-gray-700">
                        Expiry Date
                      </Label>
                      <Input
                        id="expiry"
                        type="text"
                        placeholder="MM / YY"
                        value={expiryDate}
                        onChange={(e) => setExpiryDate(e.target.value)}
                        maxLength={7}
                        className="h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv" className="text-sm font-medium text-gray-700">
                        CVV
                      </Label>
                      <Input
                        id="cvv"
                        type="text"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value)}
                        maxLength={4}
                        className="h-11 border-gray-200 focus:border-[#FF6B2C] focus:ring-[#FF6B2C]"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4">
                  <div className="flex gap-3">
                    <Lock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-blue-900">
                        Your payment is secure
                      </p>
                      <p className="text-xs text-blue-700">
                        This is a mockup. Add your Flutterwave API keys to enable real payments processing.
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-semibold bg-gradient-to-r from-[#FF6B2C] to-[#FF9B5C] hover:from-[#FF5A1F] hover:to-[#FF8A4C] text-white shadow-lg shadow-orange-500/25 transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </div>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Pay $49.00
                    </>
                  )}
                </Button>

                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    PCI Compliant
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    256-bit SSL
                  </span>
                </div>
              </form>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:sticky lg:top-24 h-fit">
            <Card className="border-0 shadow-lg shadow-black/5 overflow-hidden">
              <div className="bg-gradient-to-br from-[#FF6B2C] to-[#FF9B5C] p-6 text-white">
                <h3 className="text-lg font-semibold mb-1">Order Summary</h3>
                <p className="text-sm text-orange-50">Review your purchase</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Product */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <h4 className="font-semibold text-gray-900">Professional Plan</h4>
                      <p className="text-sm text-gray-500">Monthly subscription</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">$49.00</p>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Unlimited articles</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Advanced SEO analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Priority support</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">$49.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">$0.00</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-base font-semibold text-gray-900">Total due</span>
                  <span className="text-2xl font-bold text-gray-900">$49.00</span>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 border-t space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span>Secured by Flutterwave</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Lock className="h-4 w-4 text-emerald-600" />
                    <span>Your data is encrypted and secure</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <Building2 className="h-4 w-4 text-emerald-600" />
                    <span>PCI DSS Level 1 Certified</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Support */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need help?{" "}
                <Link href="#" className="text-[#FF6B2C] font-medium hover:underline">
                  Contact support
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
