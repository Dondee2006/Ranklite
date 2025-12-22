import Header from "@/components/sections/header";
import Footer from "@/components/sections/footer";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto max-w-[900px] px-5 py-16 md:px-8 md:py-24">
        <div className="mb-12">
          <h1 className="mb-4 font-display text-[42px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[48px]">
            Cookie Policy
          </h1>
          <p className="text-[15px] text-muted-foreground">Last updated: December 13, 2025</p>
        </div>

        <div className="prose prose-slate max-w-none">
          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">1. What Are Cookies</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Cookies are small text files that are placed on your device when you visit a website. They help websites
              remember your preferences and improve your browsing experience. Ranklite uses cookies and similar
              technologies to provide and improve our Service.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">2. Types of Cookies We Use</h2>
            <div className="space-y-6 text-[16px] leading-relaxed text-muted-foreground">
              <div>
                <h3 className="mb-2 font-semibold text-foreground">Essential Cookies</h3>
                <p>
                  These cookies are necessary for the Service to function properly. They enable basic features like
                  authentication, security, and network management. The Service cannot function properly without these
                  cookies.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Performance and Analytics Cookies</h3>
                <p>
                  These cookies help us understand how visitors interact with our Service by collecting and reporting
                  information anonymously. This helps us improve the Service and user experience.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Functional Cookies</h3>
                <p>
                  These cookies enable enhanced functionality and personalization, such as remembering your preferences
                  and settings. They may be set by us or third-party providers whose services we use on our pages.
                </p>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-foreground">Targeting and Advertising Cookies</h3>
                <p>
                  These cookies are used to deliver relevant advertisements and track the effectiveness of our marketing
                  campaigns. They may be set by our advertising partners through our Service.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">3. Third-Party Cookies</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>We use several third-party services that may set cookies on your device:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Google Analytics:</strong> For website analytics and performance tracking
                </li>
                <li>
                  <strong>Supabase:</strong> For authentication and database services
                </li>
                <li>
                  <strong>Marketing Platforms:</strong> For advertising and campaign tracking
                </li>
              </ul>
              <p className="mt-4">
                These third parties have their own privacy policies and cookie policies. We recommend reviewing them to
                understand how they use cookies.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">4. How We Use Cookies</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>We use cookies for the following purposes:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Authenticating users and preventing fraudulent use</li>
                <li>Remembering your preferences and settings</li>
                <li>Analyzing how you use our Service</li>
                <li>Improving Service performance and user experience</li>
                <li>Delivering relevant content and advertisements</li>
                <li>Measuring the effectiveness of our marketing campaigns</li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">5. Cookie Duration</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>Cookies can be either session or persistent cookies:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>
                  <strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser
                </li>
                <li>
                  <strong>Persistent Cookies:</strong> Remain on your device for a specified period or until you delete
                  them
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">6. Managing Cookies</h2>
            <div className="space-y-4 text-[16px] leading-relaxed text-muted-foreground">
              <p>You can control and manage cookies in several ways:</p>

              <h3 className="mt-6 font-semibold text-foreground">Browser Settings</h3>
              <p>
                Most browsers allow you to refuse or accept cookies, delete existing cookies, and set preferences for
                certain websites. You can usually find these settings in your browser&apos;s options or preferences menu.
              </p>

              <h3 className="mt-6 font-semibold text-foreground">Third-Party Opt-Out Tools</h3>
              <p>You can opt out of certain third-party cookies through:</p>
              <ul className="ml-6 list-disc space-y-2">
                <li>Network Advertising Initiative opt-out page</li>
                <li>Digital Advertising Alliance opt-out page</li>
                <li>Your Online Choices (for EU users)</li>
              </ul>

              <h3 className="mt-6 font-semibold text-foreground">Important Note</h3>
              <p>
                Please note that blocking or deleting cookies may impact your experience of our Service. Some features
                may not function properly without cookies, particularly essential cookies required for authentication and
                security.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">7. Do Not Track Signals</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not want to have
              your online activity tracked. Currently, there is no industry standard for how to respond to DNT signals.
              At this time, our Service does not respond to DNT browser signals.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">8. Updates to This Policy</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              We may update this Cookie Policy from time to time to reflect changes in our practices or for other
              operational, legal, or regulatory reasons. Please review this page periodically for the latest information
              on our cookie practices.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="mb-4 font-display text-[28px] font-bold text-foreground">9. Contact Us</h2>
            <p className="mb-4 text-[16px] leading-relaxed text-muted-foreground">
              If you have questions about our use of cookies or this Cookie Policy, please contact us at:{" "}
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
