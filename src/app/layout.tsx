import type { Metadata } from "next";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: "Ranklite - Grow Organic Traffic on Auto-Pilot",
  description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
  keywords: ["SEO", "organic traffic", "content marketing", "backlinks", "ChatGPT", "Google ranking", "autopilot SEO"],
  authors: [{ name: "Ranklite" }],
  metadataBase: new URL(process.env.SITE_URL || 'https://yourdomain.com'),
  openGraph: {
    title: "Ranklite - Grow Organic Traffic on Auto-Pilot",
    description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
    url: process.env.SITE_URL || 'https://yourdomain.com',
    siteName: "Ranklite",
    type: "website",
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
    title: "Ranklite - Grow Organic Traffic on Auto-Pilot",
    description: "Get recommended by ChatGPT & Rank on Google. Get done-for-you Blog Posts, Backlinks and Free Tools while you sleep.",
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