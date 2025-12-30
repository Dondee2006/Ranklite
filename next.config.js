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
  async redirects() {
    return [
      {
        source: '/blog',
        destination: 'https://ranklitesite.feather.blog/',
        permanent: true,
      },
      {
        source: '/blog/:slug',
        destination: 'https://ranklitesite.feather.blog/',
        permanent: true,
      },
    ]
  },
};

module.exports = nextConfig;
