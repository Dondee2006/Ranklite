import Image from "next/image";
import Link from "next/link";

export default function FeaturesArticleStyle() {
  return (
    <div className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-between">
      <div className="space-y-4 rounded-[40px] bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] px-5 py-6 md:max-w-[451px] lg:max-w-[531px] lg:space-y-8 lg:px-10 lg:py-11">
        <div className="space-y-4">
          <h4 className="font-display text-2xl font-semibold leading-[1.3] tracking-[-1.2px] text-foreground lg:text-[40px]">
            Write articles that sound like you
          </h4>
          <p className="font-body text-muted-foreground lg:text-lg">
            Create articles that follow your established content style. Share your published pieces and watch us match your unique voice.
          </p>
        </div>
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-[#4ADE80] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#22C55E] sm:px-4 sm:text-sm"
          href="/signin"
        >
          <span>Start for Free</span>
          <Image
            alt="btn arrow"
            width={20}
            height={20}
            className="size-[14px] sm:size-5"
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/07727327-e87f-431e-812f-96990e586515-outrank-so/assets/svgs/white-arrow_dd1ae13e-3.svg"
          />
        </Link>
      </div>

      <div className="w-full xl:max-w-[598px]">
        {/* Image removed - blank space */}
      </div>
    </div>
  );
}