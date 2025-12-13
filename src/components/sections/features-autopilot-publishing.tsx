import Image from "next/image";
import Link from "next/link";

export default function FeaturesAutopilotPublishing() {
  return (
    <div className="flex flex-col gap-3 py-8 sm:grid sm:grid-cols-2 md:flex md:flex-row md:items-center md:justify-between w-full">
      <div className="w-full xl:max-w-[598px]">
        <Image
          alt="feature image"
          width={1000}
          height={750}
          className="h-auto w-full max-w-full rounded-2xl"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Untitled-design-4-1765619038962.png?width=8000&height=8000&resize=contain"
        />
      </div>

      <div className="space-y-4 rounded-[40px] bg-gradient-to-br from-[#F0FDF4] to-[#DCFCE7] px-5 py-6 md:max-w-[451px] lg:max-w-[531px] lg:space-y-8 lg:px-10 lg:py-11">
        <div className="space-y-4">
          <h4 className="font-display text-2xl font-semibold leading-[1.3] tracking-[-1.2px] text-zinc-900 lg:text-[40px]">
            Publish content on <br />
            auto-pilot
          </h4>
          <p className="text-zinc-500 lg:text-lg">
            Set up once and forget about manual work. Integrates with{" "}
            <span className="font-semibold text-zinc-900">
              WordPress, Webflow, Shopify, Notion, Wix, Framer
            </span>{" "}
            and many{" "}
            <Link
              className="text-[#4ADE80] underline hover:text-[#22C55E] transition-colors"
              href="/integrations"
            >
              other platforms
            </Link>
            . Your content goes live automatically.
          </p>
        </div>
        <Link
          className="group inline-flex items-center gap-2 rounded-full bg-[#4ADE80] px-3 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#22C55E] sm:px-4 sm:text-sm"
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
    </div>
  );
}