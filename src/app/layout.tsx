import type { Metadata } from "next";
import "./globals.css";

import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Ranklite – Automated Organic Traffic Growth",
  description: "Scale your search engine presence with automated content, authority backlinks, and technical SEO tools. Ranklite simplifies organic growth for modern businesses.",
  keywords: ["SEO", "organic traffic", "content marketing", "backlinks", "automated SEO", "Google ranking", "traffic growth"],
  authors: [{ name: "Ranklite" }],
  metadataBase: new URL(process.env.SITE_URL || 'https://yourdomain.com'),
  openGraph: {
    title: "Ranklite – Automated Organic Traffic Growth",
    description: "Scale your search engine presence with automated content, authority backlinks, and technical SEO tools. Ranklite simplifies organic growth for modern businesses.",
    url: process.env.SITE_URL || 'https://yourdomain.com',
    siteName: "Ranklite",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ranklite – Automated Organic Traffic Growth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ranklite – Automated Organic Traffic Growth",
    description: "Scale your search engine presence with automated content, authority backlinks, and technical SEO tools. Ranklite simplifies organic growth for modern businesses.",
    images: ["/og-image.png"],
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