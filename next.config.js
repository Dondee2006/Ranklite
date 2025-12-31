/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  outputFileTracingRoot: __dirname,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      {
        source: "/blog",
        destination: "https://ranklitesite.feather.blog",
      },
      {
        source: "/blog/:slug*",
        destination: "https://ranklitesite.feather.blog/:slug*",
      },
      {
        source: "/_feather/:path*",
        destination: "https://ranklitesite.feather.blog/_feather/:path*",
      },
      {
        source: "/:slug((?!dashboard|api|_next|static|favicon.ico).*)",
        destination: "https://ranklitesite.feather.blog/:slug",
      },
    ];
  },
};

module.exports = nextConfig;
