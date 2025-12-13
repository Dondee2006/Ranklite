import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[900px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-12">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[48px]">
            Terms of Service
          </h1>
          <p className="text-[15px] text-muted-foreground">Last updated: December 13, 2025</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">1. Acceptance of Terms</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              By accessing and using Ranklite ("Service"), you accept and agree to be bound by the terms and provision
              of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">2. Description of Service</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Ranklite provides AI-powered content creation and SEO optimization services. The Service includes but is
              not limited to: automated content generation, SEO analysis, content publishing, and related features.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">3. User Accounts</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                To use certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">4. Acceptable Use</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>You agree not to use the Service to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Generate content that violates any applicable laws or regulations</li>
                <li>Create misleading, defamatory, or harmful content</li>
                <li>Infringe on intellectual property rights of others</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any commercial purpose without authorization</li>
                <li>Resell or redistribute the Service without permission</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">5. Subscription and Payment</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                Certain features of the Service require a paid subscription. By subscribing, you agree to pay all fees
                associated with your chosen plan. Subscriptions automatically renew unless cancelled before the renewal
                date.
              </p>
              <p>
                We reserve the right to change our pricing at any time. Price changes will not affect your current
                billing cycle but will apply to subsequent renewal periods.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">6. Content Ownership</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                You retain all rights to content you create using our Service. However, you grant us a license to use,
                store, and process your content solely for the purpose of providing and improving the Service.
              </p>
              <p>
                You are responsible for ensuring that content generated through our Service complies with all applicable
                laws and does not infringe on third-party rights.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">7. Intellectual Property</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              The Service and its original content, features, and functionality are owned by Ranklite and are protected
              by international copyright, trademark, patent, trade secret, and other intellectual property laws.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">8. Termination</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                We reserve the right to terminate or suspend your account and access to the Service immediately, without
                prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or
                third parties.
              </p>
              <p>
                You may terminate your account at any time through your account settings or by contacting us.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">9. Disclaimers</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
                IMPLIED. WE DO NOT GUARANTEE THAT THE SERVICE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
              </p>
              <p>
                We do not guarantee specific SEO results or rankings. Results may vary based on numerous factors outside
                our control.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">10. Limitation of Liability</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, RANKLITE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY
              OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">11. Changes to Terms</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes via
              email or through the Service. Your continued use of the Service after such modifications constitutes your
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">12. Governing Law</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
              Ranklite operates, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">13. Contact Us</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              If you have any questions about these Terms, please contact us at:{" "}
              <a href="mailto:legal@ranklite.com" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                legal@ranklite.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
