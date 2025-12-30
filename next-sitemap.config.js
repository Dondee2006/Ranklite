module.exports = {
  siteUrl: process.env.SITE_URL || 'https://yourdomain.com',
  generateRobotsTxt: false,
  exclude: ['/dashboard/*', '/api/*', '/checkout/*', '/login', '/signup', '/onboarding/*', '/blog*'],
  generateIndexSitemap: false,
};
