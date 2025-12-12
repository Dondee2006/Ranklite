import { fetchAllUrls } from './src/lib/linking/sitemap-parser';

async function testSitemap() {
    console.log('Testing sitemap parser...');
    const url = 'https://vercel.com/sitemap.xml';
    try {
        console.log(`Fetching ${url}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            }
        });
        const text = await response.text();
        console.log('Response status:', response.status);
        console.log('Response start:', text.substring(0, 500));

        const urls = await fetchAllUrls(url); // This will still use the parser's internal UA, but let's check the direct fetch first.
        console.log(`Found ${urls.length} URLs:`);
        urls.forEach(u => console.log(`- ${u.loc}`));
    } catch (error) {
        console.error('Error:', error);
    }
}

testSitemap();
