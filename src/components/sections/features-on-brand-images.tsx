export default function FeaturesOnBrandImages() {
  return (
    <div className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-between w-full">
      {/* Left: Image Section */}
      <div className="order-2 w-full sm:order-1 xl:max-w-[598px]">
        <img
          alt="feature image"
          width="800"
          height="600"
          className="h-auto w-full max-w-full rounded-xl"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/images/images_14.png"
        />
      </div>

      {/* Right: Text Content Card */}
      <div className="order-1 flex flex-col justify-center space-y-4 rounded-[40px] bg-[linear-gradient(135deg,#86EFAC_0%,#4ADE80_100%)] px-5 py-6 shadow-card sm:order-2 md:max-w-[451px] lg:max-w-[531px] lg:space-y-8 lg:px-10 lg:py-11">
        <div className="space-y-4">
          <h4 className="font-display text-2xl font-bold leading-[1.3] text-white tracking-[-1.2px] lg:text-[40px]">
            Generate on-brand images
          </h4>
          <p className="font-body text-white/90 lg:text-lg leading-relaxed tracking-[-0.09px]">
            Enrich articles with unique visuals. Choose styles and add brand colors. We auto-insert them into content & as featured images.
          </p>
        </div>
        
        <a
          className="group inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-2.5 text-xs font-semibold text-[#4ADE80] transition-colors hover:bg-neutral-100 sm:px-4 sm:text-sm"
          href="/signin"
        >
          <span>Start for Free</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="size-[14px] sm:size-5 text-[#4ADE80]"
          >
            <path
              d="M4.16669 10H15.8334"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 4.16669L15.8333 10L10 15.8334"
              stroke="currentColor"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}