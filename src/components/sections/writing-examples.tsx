'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FileText, Flame, Video, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const articles = [
  {
    id: 'cloudvault',
    title: '7 Smart File Organization Strategies That Boost Productivity',
    source: 'CloudVault',
    type: 'Listicle',
    icon: <FileText className="w-5 h-5 text-blue-600" />,
    color: 'bg-blue-50 text-blue-600 border-blue-100',
    content: {
      headline: 'Mastering Digital Organization',
      paragraph1: "In an era where information overload is the norm, organizing your digital assets effectively can be the difference between chaos and clarity. From contracts and reports to creative assets and research notes, every file deserves a logical home. The shift from physical storage to cloud-based systems has opened new possibilities - but only for those who approach it strategically.",
      paragraph2: "Effective file organization isn't just about folders and naming conventions. It's about building a system that mirrors how you think and work. The best strategies blend automation with intuitive structures, making retrieval effortless and collaboration seamless. When done right, your digital workspace becomes an extension of your productivity, not an obstacle to it.",
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/fea97de9-5ced-4a93-bc36-1e44268f618e-22.jpg',
    }
  },
  {
    id: 'threadpro',
    title: 'Building a Profitable Personal Brand on Social Media in 2024',
    source: 'ThreadPro',
    type: 'Guide',
    icon: <Flame className="w-5 h-5 text-orange-500" />,
    color: 'bg-orange-50 text-orange-600 border-orange-100',
    content: {
      headline: 'From Followers to Revenue',
      paragraph1: "Social media has transformed from a broadcasting tool into a thriving economy. Creators who understand this shift are building sustainable businesses by cultivating engaged communities rather than chasing vanity metrics. The key lies in authenticity - audiences can spot manufactured content from miles away, but genuine expertise and unique perspectives create loyal followings.",
      paragraph2: "Revenue streams for social creators have diversified dramatically. Beyond sponsored posts and affiliate deals, smart creators are launching membership communities, digital products, and consulting services. The most successful approach combines multiple income sources while maintaining the authentic voice that attracted your audience in the first place. It's a delicate balance, but entirely achievable with the right strategy.",
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/de7a13f1-36f5-4b3a-a7d8-62d4830d7d88-24.jpg',
    }
  },
  {
    id: 'motionlab',
    title: '8 Breakthrough AI Tools Reshaping Video Creation This Year',
    source: 'MotionLab',
    type: 'Tools Listicle',
    icon: <Video className="w-5 h-5 text-emerald-600" />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    content: {
      headline: 'Redefining Visual Storytelling',
      paragraph1: "The barrier to professional video content has crumbled. What once required studios, expensive equipment, and specialized skills can now be accomplished with AI-powered tools that understand natural language. These platforms are empowering entrepreneurs, educators, and marketers to communicate visually without the traditional learning curve or budget requirements.",
      paragraph2: "Our analysis covers the most innovative solutions available today. From text-to-video generators that craft cinematic sequences to AI avatars indistinguishable from real presenters, the options are staggering. Each tool excels in different areas - some prioritize speed, others focus on customization, and a few are pushing the boundaries of what's possible with generative technology. Here's what stands out in each category.",
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/90cddfe8-8d10-48bf-991f-f478afbeb014-23.jpg',
    }
  }
];

export default function WritingExamples() {
  const [activeArticleId, setActiveArticleId] = useState(articles[0].id);
  const activeArticle = articles.find(a => a.id === activeArticleId) || articles[0];

  return (
    <section className="py-16 lg:py-24 bg-white relative overflow-hidden" id="examples">
      <div className="container mx-auto px-4 md:px-6 max-w-[1376px]">

        {/* Header Section */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-16">
          <div className="lg:col-span-5 flex flex-col justify-center">
            <span className="text-xs font-semibold text-green-500 uppercase tracking-[1.44px] mb-4">
              WRITING EXAMPLES
            </span>
            <h2 className="text-4xl lg:text-[56px] font-bold text-black leading-[1.1] tracking-[-1.44px] mb-6 font-display">
              Smart content that <span className="text-green-500">readers actually enjoy.</span>
            </h2>

            <div className="hidden lg:flex items-center gap-2 mb-8 text-sm font-medium text-gray-500 italic transform -rotate-2 translate-x-4">
              <span className="font-handwriting">Browse samples</span>
              <svg
                width="40"
                height="20"
                viewBox="0 0 40 20"
                fill="none"
                className="text-gray-400 rotate-12"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2 10C10 15 25 18 38 5M38 5L28 2M38 5L32 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col gap-4 relative">
              {articles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setActiveArticleId(article.id)}
                  className={`group text-left p-5 rounded-xl border transition-all duration-300 ease-in-out relative
                    ${activeArticleId === article.id
                      ? 'bg-white border-green-500 shadow-lg scale-[1.02] z-10'
                      : 'bg-white border-gray-100 hover:border-green-200 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex flex-col gap-3">
                    <h3 className={`text-lg font-bold leading-snug font-display transition-colors
                      ${activeArticleId === article.id ? 'text-black' : 'text-gray-900'}
                    `}>
                      {article.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-full bg-gray-50 group-hover:bg-white transition-colors`}>
                          {article.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{article.source}</span>
                      </div>

                      <span className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full tracking-wide ${article.color}`}>
                        {article.type}
                      </span>
                    </div>
                  </div>

                  {activeArticleId === article.id && (
                    <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden lg:block text-green-500">
                      <div className="bg-white rounded-full p-1 shadow-sm border border-green-100">
                        <ChevronRight size={20} />
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* CTA for Blog - Mobile */}
            <div className="mt-8 lg:mt-12 lg:hidden flex flex-col items-center text-center">
              <p className="text-gray-600 mb-4 text-sm md:text-base">
                Explore our blog where every article is crafted with Ranklite:
              </p>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-sm px-6 py-3 rounded-full transition-all"
              >
                Explore the Blog
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7 mt-8 lg:mt-0">
            {/* Article Preview Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden h-full flex flex-col">

              {/* Preview Header / Image */}
              <div className="relative h-48 sm:h-64 md:h-80 w-full bg-gray-100 overflow-hidden group">
                {activeArticle.content.image && (
                  <Image
                    src={activeArticle.content.image}
                    alt={activeArticle.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                {/* Overlay Text on Image */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <div className="inline-block px-3 py-1 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-md mb-3 shadow-sm">
                    Productivity Tips
                  </div>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 md:p-8 lg:p-10 flex-1 flex flex-col">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 font-display leading-tight">
                  {activeArticle.content.headline}
                </h3>

                <div className="space-y-6 text-gray-600 leading-relaxed md:text-lg font-light">
                  <p>
                    {activeArticle.content.paragraph1}
                  </p>
                  <p className="hidden md:block">
                    {activeArticle.content.paragraph2}
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden relative">
                          <Image
                            src={`https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/fea97de9-5ced-4a93-bc36-1e44268f618e-22.jpg`}
                            alt="Reader"
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">+3.1k views</span>
                  </div>

                  <span className="text-sm font-semibold text-green-500 flex items-center gap-1 cursor-pointer hover:underline">
                    Continue Reading <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section - Desktop */}
        <div className="hidden lg:flex flex-col items-center justify-center mt-16 text-center">
          <p className="text-gray-500 text-lg mb-6">
            Explore our blog where every article is crafted with Ranklite:
          </p>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold text-base px-8 py-3.5 rounded-full transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Explore the Blog
            <ArrowRight size={18} />
          </Link>
        </div>

      </div>
    </section>
  );
}