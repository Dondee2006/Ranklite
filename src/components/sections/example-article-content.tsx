import Image from "next/image";
import { FileText, Flame, Play } from "lucide-react";

export default function ExampleArticleContent() {
  const articles = [
    {
      title: "10 Document Management Best Practices to Improve Your Work",
      company: "Documind",
      type: "Listicle",
      typeColor: "text-blue-600 bg-blue-50",
      icon: <div className="w-5 h-5 bg-blue-600 rounded-sm" />, 
      isActive: true,
    },
    {
      title: "How to Monetize Twitter: Proven Strategies for Content Creators",
      company: "SuperX",
      type: "Guide",
      typeColor: "text-orange-600 bg-orange-50",
      icon: <div className="w-5 h-5 bg-orange-500 rounded-full" />,
      isActive: false,
    },
    {
      title: "Top 9 AI Video Generators: Transform Your Vision into Reality",
      company: "revid.ai",
      type: "Tools Listicle",
      typeColor: "text-emerald-600 bg-emerald-50",
      icon: <div className="w-5 h-5 bg-emerald-500 rounded-lg" />,
      isActive: false,
    },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background overflow-hidden" id="examples">
      <div className="container mx-auto px-4 md:px-6 max-w-[1376px]">
        {/* Section Header */}
        <div className="relative mx-auto max-w-4xl text-center mb-16 md:mb-20">
          {/* Decorative Arrow */}
          <div className="hidden md:block absolute -top-12 right-[10%] lg:right-[15%] xl:right-[10%] rotate-6 pointer-events-none select-none">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/svgs/examples-vector_880b2716-12.svg"
              alt="Check examples"
              width={160}
              height={80}
              className="w-32 md:w-40"
            />
          </div>

          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-[1.44px] text-primary">
            Writing Examples
          </p>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground tracking-tight leading-[1.1]">
            AI-generated content <br className="hidden md:block" />
            that <span className="text-primary">humans love to read.</span>
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Article Selectors */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            {articles.map((article, index) => (
              <button
                key={index}
                className={`group text-left w-full p-5 md:p-6 rounded-2xl border transition-all duration-300 ease-in-out cursor-pointer ${
                  article.isActive
                    ? "bg-white border-primary/20 shadow-[0_4px_24px_rgba(0,0,0,0.06)] scale-[1.02]"
                    : "bg-transparent border-transparent hover:bg-white hover:border-border hover:shadow-sm opacity-60 hover:opacity-100"
                }`}
                type="button"
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5">
                      {/* Logo Placeholder */}
                      <div className="shrink-0 flex items-center justify-center">
                        {index === 0 && (
                          <div className="size-6 flex items-center justify-center bg-blue-600 text-white rounded-md">
                            <span className="font-bold text-[10px] leading-none">D</span>
                          </div>
                        )}
                        {index === 1 && (
                          <div className="size-6 flex items-center justify-center bg-orange-500 text-white rounded-full">
                            <Flame size={14} fill="currentColor" />
                          </div>
                        )}
                        {index === 2 && (
                           <div className="size-6 flex items-center justify-center bg-gray-900 text-white rounded-sm">
                            <div className="size-3 bg-[#00FF94] rounded-full" />
                          </div>
                        )}
                      </div>
                      <span className="font-semibold text-sm text-foreground">
                        {article.company}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        article.typeColor || "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {article.type}
                    </span>
                  </div>
                  <h3 className={`font-display font-bold text-lg md:text-[20px] leading-snug ${article.isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"}`}>
                    {article.title}
                  </h3>
                </div>
              </button>
            ))}
          </div>

          {/* Right Column: Article Preview Card */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl border border-border shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-6 md:p-8 lg:p-10 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
              {/* Featured Image */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-8 bg-neutral-100 border border-neutral-100">
                <Image
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/9eed21d9-d082-4990-b523-66b6177f2045-25.jpg"
                  alt="Document Mastery Guide - Featured Image"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                  priority
                />
              </div>

              {/* Article Content */}
              <div className="space-y-6">
                <h2 className="font-display text-3xl md:text-4xl lg:text-[40px] font-bold text-foreground tracking-tight leading-[1.2]">
                  Taming the Document Deluge
                </h2>

                <div className="space-y-6 text-muted-foreground text-base md:text-lg leading-relaxed font-body">
                  <p>
                    Documents drive most modern work. From academic papers and legal
                    documents to patient files and marketing materials, the
                    effective handling of information is critical for success. But
                    managing an ever-growing pile of digital files remains a
                    stubborn challenge for many professionals. The switch from
                    paper to digital storage has shifted the problem rather than
                    solved it - trading overstuffed filing cabinets for chaotic
                    digital folders.
                  </p>
                  <p>
                    Modern document management combines time-tested principles with
                    new digital capabilities. The core goals remain constant:
                    making files easy to find, access, protect, and use
                    efficiently. The key is creating a system that fits your
                    specific workflow and technical comfort level. Good document
                    management does more than prevent lost files - it transforms
                    information from a source of stress into a valuable resource
                    that helps you work better.
                  </p>
                  <p>
                    This guide will walk through 10 proven document management
                    practices that work across different roles and industries.
                    You&apos;ll learn practical ways to:
                  </p>
                  <p>
                    Whether you&apos;re dealing with dozens or thousands of files,
                    these strategies will help you take control of your documents
                    and work more effectively. Let&apos;s get started.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}