import Image from "next/image";

export default function FeaturesNaturalRanking() {
  return (
    <section className="bg-white">
      <div className="container mx-auto max-w-[1376px] px-4 md:px-6">
        <div className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-between">
          {/* Image Column - Left on Desktop (Order 1), Bottom on Mobile (Order 2) */}
          <div className="order-2 w-full sm:order-1 xl:max-w-[598px]">
            <Image
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/images_12.png"
              alt="feature image"
              width={800}
              height={600}
              className="h-auto w-full max-w-full rounded-xl"
            />
          </div>

          {/* Content Card - Right on Desktop (Order 2), Top on Mobile (Order 1) */}
          <div className="order-1 space-y-4 rounded-[40px] bg-[linear-gradient(135deg,#86EFAC,#4ADE80)] px-5 py-6 sm:order-2 md:max-w-[451px] md:bg-[linear-gradient(135deg,#86EFAC,#4ADE80)] lg:max-w-[531px] lg:space-y-8 lg:px-10 lg:py-11">
            <div className="space-y-4">
              <h4 className="text-2xl font-semibold leading-[1.3] tracking-[-1.2px] text-white lg:text-[40px]">
                Write articles that rank — without sounding robotic
              </h4>
              <p className="text-white/90 lg:text-lg">
                Generate high-quality, human-style content backed by real keyword data. Your articles come optimized with relevant internal and external links already placed for ranking success.
              </p>
            </div>
            <div className="-mt-[5px] ml-[5px]">
              <a
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-[#D0D5DD] bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-100"
                href="#examples"
              >
                <div className="flex items-center gap-2">
                  <span>Read Examples</span>
                  <Image
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/svgs/doc_f4a3071c-10.svg"
                    alt="doc icon"
                    width={16}
                    height={16}
                    className="size-4"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}