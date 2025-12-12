/**
 * Sitemap Parser Utility
 * Handles parsing of XML sitemaps including nested sitemap indexes
 */

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: string;
    priority?: string;
}

export interface ParsedSitemap {
    urls: SitemapUrl[];
    isSitemapIndex: boolean;
    nestedSitemaps: string[];
}

/**
 * Normalize URL by replacing special characters
 */
export function normalizeUrl(url: string): string {
  // Replace non-breaking hyphen (U+2011) with regular hyphen
  // Replace various dash-like characters with regular hyphen
  return url
    .replace(/\u2011/g, '-')  // non-breaking hyphen
    .replace(/\u2013/g, '-')  // en dash
    .replace(/\u2014/g, '-')  // em dash
    .replace(/\u2212/g, '-')  // minus sign
    .trim();
}

/**
 * Fetch and parse a sitemap from a URL
 */
export async function parseSitemap(url: string): Promise<ParsedSitemap> {
    try {
        // Normalize URL to handle special characters
        const normalizedUrl = normalizeUrl(url);
        
        const response = await fetch(normalizedUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
                'Accept': 'application/xml, text/xml, */*; q=0.01',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch sitemap: ${response.status} ${response.statusText}`);
        }

        const xml = await response.text();

        // Basic check to see if we got HTML instead of XML
        if (xml.trim().toLowerCase().startsWith('<!doctype html') || xml.includes('<html')) {
            throw new Error('Retrieved content appears to be HTML, not a valid XML sitemap. Please check the URL.');
        }

        return extractUrlsFromXml(xml);
    } catch (error) {
        throw new Error(`Error parsing sitemap ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract URLs from sitemap XML
 */
export function extractUrlsFromXml(xml: string): ParsedSitemap {
    const urls: SitemapUrl[] = [];
    const nestedSitemaps: string[] = [];

    // Check if this is a sitemap index
    const isSitemapIndex = xml.includes('<sitemapindex') || xml.includes('</sitemapindex>');

    if (isSitemapIndex) {
        // Extract nested sitemap URLs
        const sitemapRegex = /<sitemap>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<\/sitemap>/g;
        let match;

        while ((match = sitemapRegex.exec(xml)) !== null) {
            const loc = match[1].trim();
            if (loc) {
                nestedSitemaps.push(loc);
            }
        }
    } else {
        // Extract regular URLs
        const urlRegex = /<url>[\s\S]*?<loc>(.*?)<\/loc>([\s\S]*?)<\/url>/g;
        let match;

        while ((match = urlRegex.exec(xml)) !== null) {
            const loc = match[1].trim();
            const urlContent = match[2];

            // Extract optional fields
            const lastmodMatch = urlContent.match(/<lastmod>(.*?)<\/lastmod>/);
            const changefreqMatch = urlContent.match(/<changefreq>(.*?)<\/changefreq>/);
            const priorityMatch = urlContent.match(/<priority>(.*?)<\/priority>/);

            urls.push({
                loc,
                lastmod: lastmodMatch?.[1],
                changefreq: changefreqMatch?.[1],
                priority: priorityMatch?.[1],
            });
        }
    }

    return {
        urls,
        isSitemapIndex,
        nestedSitemaps,
    };
}

/**
 * Recursively fetch all URLs from a sitemap, including nested sitemaps
 */
export async function fetchAllUrls(sitemapUrl: string, maxDepth = 5, currentDepth = 0): Promise<SitemapUrl[]> {
    if (currentDepth >= maxDepth) {
        console.warn(`Max depth ${maxDepth} reached for sitemap recursion`);
        return [];
    }

    const parsed = await parseSitemap(sitemapUrl);

    if (parsed.isSitemapIndex && parsed.nestedSitemaps.length > 0) {
        // Recursively fetch nested sitemaps
        const nestedResults = await Promise.allSettled(
            parsed.nestedSitemaps.map(nestedUrl =>
                fetchAllUrls(nestedUrl, maxDepth, currentDepth + 1)
            )
        );

        // Combine all successful results
        const allUrls: SitemapUrl[] = [];
        for (const result of nestedResults) {
            if (result.status === 'fulfilled') {
                allUrls.push(...result.value);
            } else {
                console.error('Failed to fetch nested sitemap:', result.reason);
            }
        }

        return allUrls;
    }

    return parsed.urls;
}

/**
 * Validate a URL
 */
export function isValidUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

/**
 * Filter and deduplicate URLs
 */
export function deduplicateUrls(urls: SitemapUrl[]): SitemapUrl[] {
    const seen = new Set<string>();
    const deduplicated: SitemapUrl[] = [];

    for (const url of urls) {
        if (!seen.has(url.loc) && isValidUrl(url.loc)) {
            seen.add(url.loc);
            deduplicated.push(url);
        }
    }

    return deduplicated;
}