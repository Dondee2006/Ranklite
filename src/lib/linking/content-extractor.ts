/**
 * Content Extractor Utility
 * Handles fetching and extracting content from web pages
 */

import crypto from 'crypto';

export interface PageContent {
    url: string;
    title: string;
    textContent: string;
    htmlContent: string;
    contentHash: string;
}

/**
 * Fetch page content from a URL
 */
export async function fetchPageContent(url: string): Promise<PageContent> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'OutrankBot/1.0',
            },
            signal: AbortSignal.timeout(10000), // 10 second timeout
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
        }

        const htmlContent = await response.text();
        const title = extractTitle(htmlContent);
        const textContent = extractTextContent(htmlContent);
        const contentHash = generateContentHash(textContent);

        return {
            url,
            title,
            textContent,
            htmlContent,
            contentHash,
        };
    } catch (error) {
        throw new Error(`Error fetching page ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract title from HTML
 * Falls back to first h1 if title tag is missing
 */
export function extractTitle(html: string): string {
    // Try to extract <title> tag
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch && titleMatch[1]) {
        return decodeHtmlEntities(titleMatch[1].trim());
    }

    // Fallback to first <h1> tag
    const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
    if (h1Match && h1Match[1]) {
        return decodeHtmlEntities(stripHtmlTags(h1Match[1]).trim());
    }

    return 'Untitled Page';
}

/**
 * Extract main text content from HTML
 * Removes scripts, styles, and HTML tags
 */
export function extractTextContent(html: string): string {
    // Remove script and style tags with their content
    let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove HTML comments
    text = text.replace(/<!--[\s\S]*?-->/g, '');

    // Remove all HTML tags
    text = stripHtmlTags(text);

    // Decode HTML entities
    text = decodeHtmlEntities(text);

    // Clean up whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
}

/**
 * Strip HTML tags from text
 */
export function stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, '');
}

/**
 * Decode common HTML entities
 */
export function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
        '&nbsp;': ' ',
        '&mdash;': '—',
        '&ndash;': '–',
        '&hellip;': '…',
    };

    let decoded = text;
    for (const [entity, char] of Object.entries(entities)) {
        decoded = decoded.replace(new RegExp(entity, 'g'), char);
    }

    // Decode numeric entities
    decoded = decoded.replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)));
    decoded = decoded.replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

    return decoded;
}

/**
 * Generate a hash of the content for change detection
 */
export function generateContentHash(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Extract meta description from HTML
 */
export function extractMetaDescription(html: string): string | null {
    const metaMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
    if (metaMatch && metaMatch[1]) {
        return decodeHtmlEntities(metaMatch[1].trim());
    }
    return null;
}

/**
 * Truncate text to a maximum length
 */
export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
        return text;
    }
    return text.substring(0, maxLength - 3) + '...';
}

/**
 * Extract excerpt from text content
 */
export function extractExcerpt(text: string, maxLength = 500): string {
    const cleaned = text.replace(/\s+/g, ' ').trim();
    return truncateText(cleaned, maxLength);
}
