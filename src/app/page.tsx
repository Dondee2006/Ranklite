import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import ProblemsSolution from "@/components/sections/problems-solution";
import HowItWorks from "@/components/sections/how-it-works";
import FeaturesSeoAnalysis from "@/components/sections/features-seo-analysis";
import FeaturesNaturalRanking from "@/components/sections/features-natural-ranking";
import FeaturesArticleStyle from "@/components/sections/features-article-style";
import FeaturesOnBrandImages from "@/components/sections/features-on-brand-images";
import FeaturesAutopilotPublishing from "@/components/sections/features-autopilot-publishing";
import BoostVisibility from "@/components/sections/boost-visibility";
import AdditionalFeatures from "@/components/sections/additional-features";
import WritingExamples from "@/components/sections/writing-examples";
import AIInSEO from "@/components/sections/ai-in-seo";
import WhyRanklite from "@/components/sections/why-ranklite";
import Pricing from "@/components/sections/pricing";
import FAQSection from "@/components/sections/faq";
import CtaSection from "@/components/sections/cta-section";
import Footer from "@/components/sections/footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <ProblemsSolution />
        <HowItWorks />
        <section className="container mx-auto max-w-[1320px] px-5 md:px-8">
          <div className="mb-12 text-center lg:mb-20">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold text-[#16A34A]">
              Features
            </span>
            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
              Accelerate your{" "}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                SEO growth
              </span>
            </h2>
          </div>
          <FeaturesSeoAnalysis />
          <FeaturesNaturalRanking />
          <FeaturesArticleStyle />
          <FeaturesOnBrandImages />
          <FeaturesAutopilotPublishing />
        </section>
        <BoostVisibility />
        <AdditionalFeatures />
        <WritingExamples />
        <AIInSEO />
        <WhyRanklite />
        <Pricing />
        <FAQSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}