import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FAFAFA] to-[#F3F4F6] px-4">
      <div className="text-center">
        <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#FEE2E2]">
          <FileQuestion className="h-12 w-12 text-[#DC2626]" />
        </div>

        <h1 className="mb-4 text-6xl font-bold text-[#1A1A1A]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-[#374151]">Page Not Found</h2>
        <p className="mb-8 text-[#6B7280] max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-white bg-[#2563EB] rounded-md hover:bg-[#1E40AF] transition-colors"
          >
            Go Home
          </Link>
          <Link
            href="/dashboard/overview"
            className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium text-[#2563EB] bg-white border border-[#E5E5E5] rounded-md hover:bg-[#F9FAFB] transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
