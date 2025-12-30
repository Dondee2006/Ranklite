import Header from "@/components/sections/header";
import HeroSection from "@/components/sections/hero";
import ProblemsSolution from "@/components/sections/problems-solution";
import HowItWorks from "@/components/sections/how-it-works";
import FeaturesNaturalRanking from "@/components/sections/features-natural-ranking";
import FeaturesArticleStyle from "@/components/sections/features-article-style";
import FeaturesOnBrandImages from "@/components/sections/features-on-brand-images";
import FeaturesAutopilotPublishing from "@/components/sections/features-autopilot-publishing";
import BoostVisibility from "@/components/sections/boost-visibility";
import ContentPlannerSection from "@/components/sections/content-planner-section";
import AdditionalFeatures from "@/components/sections/additional-features";
import WritingExamples from "@/components/sections/writing-examples";
import AIInSEO from "@/components/sections/ai-in-seo";
import WhyRanklite from "@/components/sections/why-ranklite";
import Pricing from "@/components/sections/pricing";
import FAQSection from "@/components/sections/faq";
import CtaSection from "@/components/sections/cta-section";
import Footer from "@/components/sections/footer";
import BlogSection from "@/components/sections/blog-section";

import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function Home() {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <Header />
            <main>
                <ScrollReveal variant="fade-in">
                    <HeroSection />
                </ScrollReveal>

                <ScrollReveal>
                    <ProblemsSolution />
                </ScrollReveal>

                <ScrollReveal>
                    <HowItWorks />
                </ScrollReveal>

                <ScrollReveal>
                    <ContentPlannerSection />
                </ScrollReveal>

                <ScrollReveal>
                    <FeaturesOnBrandImages />
                </ScrollReveal>

                <ScrollReveal>
                    <FeaturesNaturalRanking />
                </ScrollReveal>

                <ScrollReveal>
                    <FeaturesArticleStyle />
                </ScrollReveal>

                <ScrollReveal>
                    <FeaturesAutopilotPublishing />
                </ScrollReveal>

                <ScrollReveal>
                    <BoostVisibility />
                </ScrollReveal>

                <ScrollReveal>
                    <AdditionalFeatures />
                </ScrollReveal>

                <ScrollReveal>
                    <WritingExamples />
                </ScrollReveal>

                <ScrollReveal>
                    <AIInSEO />
                </ScrollReveal>

                <ScrollReveal>
                    <WhyRanklite />
                </ScrollReveal>

                <ScrollReveal>
                    <Pricing />
                </ScrollReveal>

                <BlogSection />

                <ScrollReveal>
                    <FAQSection />
                </ScrollReveal>

                <ScrollReveal>
                    <CtaSection />
                </ScrollReveal>
            </main>
            <Footer />
        </div>
    );
}
