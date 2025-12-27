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
        <section id="features" className="container mx-auto max-w-[1320px] px-5 md:px-8">
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