module.exports = {
  siteUrl: process.env.SITE_URL || 'https://www.ranklite.site',
  generateRobotsTxt: true,
  exclude: [
    '/dashboard/*',
    '/api/*',
    '/checkout/*',
    '/onboarding/*',
    '/debug-notion',
    '/env-test',
    '/notion-debug-full'
  ],
  generateIndexSitemap: false,
};
