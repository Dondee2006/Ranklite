import Link from "next/link";
import { Search, Calendar, Rocket, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Deep analysis of your niche",
    description: "We explore your market, competitors, and target audience to discover high-potential keywords with low competition.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/how-1_89ea1f80-8.webp",
    gradient: "from-[#22C55E] to-[#16A34A]",
  },
  {
    icon: Calendar,
    number: "02",
    title: "Strategic 30-day content plan",
    description: "Get a data-driven content calendar where each day targets a key phrase with maximum ranking potential.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/how-2_755a4920-9.webp",
    gradient: "from-[#10B981] to-[#059669]",
  },
  {
    icon: Rocket,
    number: "03",
    title: "Autopilot content generation",
    description: "We create and publish SEO-optimized articles daily. Your blog grows automatically while you focus on business.",
    image: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/how-3_f897c9e1-10.webp",
    gradient: "from-[#22C55E] to-[#10B981]",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white to-[#FAFFFE] py-16 lg:py-28" id="howitworks">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-[400px] w-[400px] rounded-full bg-[#DCFCE7]/30 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-[300px] w-[300px] rounded-full bg-[#D1FAE5]/30 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-[1320px] px-5 md:px-8">
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div className="max-w-[600px]">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F0FDF4] px-4 py-1.5 text-[13px] font-semibold uppercase tracking-wide text-[#16A34A]">
              How it works
            </span>
            <h2 className="font-display text-[32px] font-bold leading-[1.1] tracking-tight text-foreground sm:text-[40px] lg:text-[52px]">
              Here&apos;s where the{" "}
              <span className="bg-gradient-to-r from-[#22C55E] to-[#10B981] bg-clip-text text-transparent">
                magic
              </span>{" "}
              happens
            </h2>
          </div>

          <div className="flex max-w-[380px] flex-col items-start gap-5 lg:items-end lg:text-right">
            <p className="text-[16px] leading-relaxed text-muted-foreground">
              Leave SEO to us — we generate high-performing content daily to help you outrank competitors effortlessly.
            </p>
            <Link
              href="/signup"
              className="group hidden items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20 transition-all hover:shadow-xl hover:shadow-green-500/30 lg:flex"
            >
              Start Growing Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl border border-border bg-white p-6 shadow-lg shadow-black/[0.03] transition-all hover:border-[#22C55E]/20 hover:shadow-xl lg:rounded-3xl"
            >
              <div className="absolute right-4 top-4 text-[48px] font-bold leading-none text-[#F0FDF4] transition-colors group-hover:text-[#DCFCE7]" style={{ fontFamily: "var(--font-display)" }}>
                {step.number}
              </div>

              <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                <step.icon className="h-5 w-5 text-white" />
              </div>

              <div className="relative mb-5 overflow-hidden rounded-xl">
                <img
                  src={step.image}
                  alt={step.title}
                  className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h4 className="mb-2 font-display text-[20px] font-bold tracking-tight text-foreground lg:text-[22px]">
                {step.title}
              </h4>
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 flex justify-center lg:hidden">
          <Link
            href="/signup"
            className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#22C55E] to-[#16A34A] px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-green-500/20"
          >
            Start Growing Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}