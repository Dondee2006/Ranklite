import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";
import JsonLd from "@/components/seo/json-ld";

export const metadata: Metadata = {
  title: {
    default: "Ranklite - Build Organic Traffic on Autopilot",
    template: "%s | Ranklite"
  },
  description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
  keywords: ["SEO", "organic traffic", "content marketing", "backlinks", "ChatGPT", "Google ranking", "autopilot SEO"],
  authors: [{ name: "Ranklite" }],
  metadataBase: new URL('https://ranklite.site'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Ranklite - Build Organic Traffic on Autopilot",
    description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
    url: 'https://ranklite.site',
    siteName: "Ranklite",
    type: "website",
    locale: 'en_US',
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ranklite - Organic Traffic Growth Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranklite - Build Organic Traffic on Autopilot",
    description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
    images: ["/og-image.png"],
    creator: "@ranklite",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <JsonLd />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}