import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[900px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-12">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[48px]">
            Privacy Policy
          </h1>
          <p className="text-[15px] text-muted-foreground">Last updated: December 13, 2025</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">1. Introduction</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Ranklite (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how
              we collect, use, disclose, and safeguard your information when you use our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">2. Information We Collect</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <h3 className="font-semibold text-foreground">Personal Information</h3>
              <p>We collect information that you provide directly to us, including:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Name and email address</li>
                <li>Payment information (processed securely through third-party payment processors)</li>
                <li>Account credentials</li>
                <li>Profile information</li>
                <li>Communications with us</li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">Usage Information</h3>
              <p>We automatically collect certain information about your use of the Service:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage patterns and preferences</li>
                <li>Content you create or upload</li>
                <li>Log data and analytics</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">3. How We Use Your Information</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>We use the information we collect to:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Provide, maintain, and improve our Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices and support messages</li>
                <li>Respond to your comments and questions</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Monitor and analyze trends and usage</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">4. Information Sharing</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>We may share your information in the following circumstances:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Service Providers:</strong> With third-party vendors who perform services on our behalf
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law or to protect our rights
                </li>
                <li>
                  <strong>With Your Consent:</strong> When you explicitly agree to share information
                </li>
              </ul>
              <p className="mt-4">
                We do not sell your personal information to third parties.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">5. Data Security</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              We implement appropriate technical and organizational measures to protect your personal information.
              However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive
              to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">6. Data Retention</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              We retain your information for as long as necessary to provide our Service and fulfill the purposes
              outlined in this Privacy Policy. We may also retain information to comply with legal obligations, resolve
              disputes, and enforce our agreements.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">7. Your Rights</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>Depending on your location, you may have the following rights:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Withdraw consent</li>
                <li>Opt-out of marketing communications</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at{" "}
                <a href="mailto:privacy@ranklite.com" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                  privacy@ranklite.com
                </a>
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">8. Cookies and Tracking</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>
                We use cookies and similar tracking technologies to collect information about your browsing activities.
                You can control cookies through your browser settings. For more information, see our{" "}
                <a href="/cookies" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                  Cookie Policy
                </a>
                .
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">9. Third-Party Services</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Our Service may contain links to third-party websites or integrate with third-party services. We are not
              responsible for the privacy practices of these third parties. We encourage you to review their privacy
              policies.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">10. Children&apos;s Privacy</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Our Service is not intended for children under 13 years of age. We do not knowingly collect personal
              information from children under 13. If you believe we have collected information from a child under 13,
              please contact us immediately.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">11. International Data Transfers</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Your information may be transferred to and processed in countries other than your country of residence.
              These countries may have different data protection laws. By using our Service, you consent to such
              transfers.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">12. Changes to This Policy</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting
              the new policy on this page and updating the &quot;Last updated&quot; date. Your continued use of the Service after
              such changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">13. Contact Us</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:{" "}
              <a href="mailto:privacy@ranklite.com" className="font-semibold text-[#22C55E] hover:text-[#16A34A]">
                privacy@ranklite.com
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
