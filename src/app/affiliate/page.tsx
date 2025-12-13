import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";
import { DollarSign, Users, TrendingUp, Gift } from "lucide-react";

export default function AffiliatePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[1320px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-16 text-center">
          <h1 className="font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[52px] lg:text-[64px]">
            Ranklite{" "}
            <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
              Affiliate Program
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[18px] leading-relaxed text-muted-foreground">
            Earn recurring commissions by referring customers to Ranklite. Share the power of AI-driven SEO and get rewarded.
          </p>
        </div>

        <div className="mb-20">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-12 text-center shadow-xl">
            <h2 className="mb-4 font-display text-[48px] font-bold text-white">30% Recurring Commission</h2>
            <p className="mx-auto max-w-2xl text-[18px] text-white/90">
              Earn 30% commission on every payment from customers you refer, for as long as they remain a subscriber.
            </p>
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-10 text-center font-display text-[32px] font-bold text-foreground">Why Join Our Program?</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: DollarSign,
                title: "Generous Commissions",
                description: "Earn 30% recurring commission on all referred customers.",
              },
              {
                icon: TrendingUp,
                title: "Growing Market",
                description: "SEO and AI content creation is booming. High conversion rates.",
              },
              {
                icon: Users,
                title: "Dedicated Support",
                description: "Get priority support and custom promotional materials.",
              },
              {
                icon: Gift,
                title: "Performance Bonuses",
                description: "Top affiliates receive exclusive bonuses and rewards.",
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 inline-flex rounded-lg bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-3 shadow-md shadow-green-500/20">
                  <benefit.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-[18px] font-semibold text-foreground">{benefit.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20">
          <h2 className="mb-10 text-center font-display text-[32px] font-bold text-foreground">How It Works</h2>
          <div className="mx-auto max-w-3xl space-y-6">
            {[
              {
                step: "1",
                title: "Sign Up",
                description: "Join our affiliate program for free. Get your unique referral link instantly.",
              },
              {
                step: "2",
                title: "Share",
                description: "Share your link with your audience through blogs, social media, or email.",
              },
              {
                step: "3",
                title: "Earn",
                description: "Earn 30% commission on every payment from customers who sign up through your link.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="flex gap-6 rounded-xl border border-border bg-white p-8 shadow-sm"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] font-display text-[24px] font-bold text-white shadow-md shadow-green-500/20">
                  {item.step}
                </div>
                <div>
                  <h3 className="mb-2 text-[20px] font-semibold text-foreground">{item.title}</h3>
                  <p className="text-[15px] leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-20 rounded-2xl bg-gradient-to-br from-[#F0FDF4] to-white p-12">
          <h2 className="mb-6 text-center font-display text-[32px] font-bold text-foreground">Affiliate Resources</h2>
          <div className="mx-auto max-w-2xl space-y-4 text-[16px] leading-relaxed text-muted-foreground">
            <p>
              <strong className="text-foreground">Marketing Materials:</strong> Access a library of banners, email templates, and social media content to promote Ranklite effectively.
            </p>
            <p>
              <strong className="text-foreground">Real-Time Dashboard:</strong> Track clicks, conversions, and earnings in real-time with our intuitive affiliate dashboard.
            </p>
            <p>
              <strong className="text-foreground">Monthly Payouts:</strong> Receive your commissions via PayPal or bank transfer every month. Minimum payout is $50.
            </p>
            <p>
              <strong className="text-foreground">Dedicated Support:</strong> Our affiliate team is here to help you succeed with priority email support.
            </p>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-12 text-center shadow-xl">
          <h2 className="mb-4 font-display text-[32px] font-bold text-white">Ready to Start Earning?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[17px] leading-relaxed text-white/90">
            Join our affiliate program today and start earning recurring commissions for every customer you refer.
          </p>
          <a
            href="mailto:affiliates@ranklite.com?subject=Affiliate Program Application"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-[16px] font-semibold text-[#22C55E] shadow-lg transition-all hover:scale-105 hover:shadow-xl"
          >
            Apply Now
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
