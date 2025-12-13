import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { fetchAllUrls, deduplicateUrls } from '@/lib/linking/sitemap-parser';
import { fetchPageContent } from '@/lib/linking/content-extractor';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { sitemapUrl } = body;

        if (!sitemapUrl || typeof sitemapUrl !== 'string') {
            return NextResponse.json(
                { error: 'Sitemap URL is required' },
                { status: 400 }
            );
        }

        // Get user's site
        const { data: site, error: siteError } = await supabase
            .from('sites')
            .select('id, url')
            .eq('user_id', user.id)
            .single();

        if (siteError || !site) {
            return NextResponse.json(
                { error: 'Site not found' },
                { status: 404 }
            );
        }

        // Extract domain from user's site URL
        const userDomain = new URL(site.url).hostname.replace(/^www\./, '');

        // Fetch all URLs from sitemap (including nested sitemaps)
        const sitemapUrls = await fetchAllUrls(sitemapUrl);
        const uniqueUrls = deduplicateUrls(sitemapUrls);

        // Filter to only include URLs from the user's domain
        const filteredUrls = uniqueUrls.filter(urlObj => {
            try {
                const urlDomain = new URL(urlObj.loc).hostname.replace(/^www\./, '');
                return urlDomain === userDomain;
            } catch {
                return false;
            }
        });

        // Limit to first 100 URLs to avoid overwhelming the system
        const urlsToProcess = filteredUrls.slice(0, 100);

        // Fetch page details for each URL (with concurrency limit)
        const detectedLinks = await fetchPageDetailsInBatches(urlsToProcess.map(u => u.loc), 5);

        // Save detected links to database
        const linksToSave = detectedLinks
            .filter(link => link !== null)
            .map(link => ({
                site_id: site.id,
                url: link!.url,
                title: link!.title,
                content_hash: link!.contentHash,
                detected_at: new Date().toISOString(),
            }));

        if (linksToSave.length > 0) {
            // Upsert links (update if exists, insert if new)
            const { error: insertError } = await supabase
                .from('detected_links')
                .upsert(linksToSave, {
                    onConflict: 'site_id,url',
                    ignoreDuplicates: false,
                });

            if (insertError) {
                console.error('Error saving detected links:', insertError);
            }
        }

        // Update linking configuration
        const { error: configError } = await supabase
            .from('linking_configurations')
            .upsert({
                site_id: site.id,
                user_id: user.id,
                link_source: 'sitemap',
                sitemap_url: sitemapUrl,
                last_scan_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            }, {
                onConflict: 'site_id',
            });

        if (configError) {
            console.error('Error updating linking configuration:', configError);
        }

        return NextResponse.json({
            success: true,
            detectedLinks: detectedLinks.filter(l => l !== null).map(l => ({
                url: l!.url,
                title: l!.title,
            })),
            totalFound: detectedLinks.filter(l => l !== null).length,
            totalInSitemap: filteredUrls.length,
            totalFiltered: uniqueUrls.length - filteredUrls.length,
        });
    } catch (error) {
        console.error('Error scanning sitemap:', error);
        return NextResponse.json(
            {
                error: 'Failed to scan sitemap',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

/**
 * Fetch page details in batches to avoid overwhelming the system
 */
async function fetchPageDetailsInBatches(
    urls: string[],
    concurrency: number
): Promise<Array<{ url: string; title: string; contentHash: string } | null>> {
    const results: Array<{ url: string; title: string; contentHash: string } | null> = [];

    for (let i = 0; i < urls.length; i += concurrency) {
        const batch = urls.slice(i, i + concurrency);
        const batchResults = await Promise.allSettled(
            batch.map(async (url) => {
                try {
                    const content = await fetchPageContent(url);
                    return {
                        url: content.url,
                        title: content.title,
                        contentHash: content.contentHash,
                    };
                } catch (error) {
                    console.error(`Failed to fetch ${url}:`, error);
                    return null;
                }
            })
        );

        results.push(
            ...batchResults.map(result =>
                result.status === 'fulfilled' ? result.value : null
            )
        );
    }

    return results;
}