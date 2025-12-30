module.exports = {
  siteUrl: process.env.SITE_URL || 'https://ranklite.site',
  generateRobotsTxt: true,
  exclude: [
    '/api/*',
    '/debug-notion',
    '/env-test',
    '/notion-debug-full'
  ],
  generateIndexSitemap: false,
};
