import Image from "next/image";

export default function FeaturesSeoAnalysis() {
  return (
    <section className="container mx-auto max-w-[1376px] px-4 py-8 md:py-12 lg:py-20">
      <div className="flex flex-col gap-3 py-8 md:flex-row md:items-center md:justify-center w-full">
        <div className="flex-shrink-0">
          <Image
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/Untitled-design-5-1765651480850.png?width=8000&height=8000&resize=contain"
            alt="CMS platforms"
            width={531}
            height={400}
            className="w-full md:max-w-[451px] lg:max-w-[531px]"
          />
        </div>
      </div>
    </section>
  );
}