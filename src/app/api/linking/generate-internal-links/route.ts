import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateLinkSuggestions, batchPages } from '@/lib/linking/link-suggestion-engine';
import { fetchPageContent } from '@/lib/linking/content-extractor';

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        let { siteId } = body;

        // If no siteId provided, get user's site
        if (!siteId) {
            const { data: site, error: siteError } = await supabase
                .from('sites')
                .select('id')
                .eq('user_id', user.id)
                .single();

            if (siteError || !site) {
                return NextResponse.json(
                    { error: 'Site not found' },
                    { status: 404 }
                );
            }
            siteId = site.id;
        } else {
            // Verify user owns the site
            const { data: site, error: siteError } = await supabase
                .from('sites')
                .select('id')
                .eq('id', siteId)
                .eq('user_id', user.id)
                .single();

            if (siteError || !site) {
                return NextResponse.json(
                    { error: 'Site not found or unauthorized' },
                    { status: 404 }
                );
            }
        }

        // Fetch all detected links for this site
        const { data: detectedLinks, error: linksError } = await supabase
            .from('detected_links')
            .select('url, title')
            .eq('site_id', siteId)
            .limit(50); // Limit to 50 pages to avoid token limits

        if (linksError) {
            throw new Error(`Failed to fetch detected links: ${linksError.message}`);
        }

        if (!detectedLinks || detectedLinks.length < 2) {
            return NextResponse.json({
                success: true,
                suggestions: [],
                totalSuggestions: 0,
                message: 'Need at least 2 pages to generate link suggestions',
            });
        }

        // Fetch content for each page
        const pagesWithContent = await Promise.allSettled(
            detectedLinks.map(async (link) => {
                try {
                    // Use the utility function directly instead of making an internal API call
                    const content = await fetchPageContent(link.url);

                    return {
                        url: link.url,
                        title: link.title || content.title,
                        textContent: content.textContent,
                    };
                } catch (error) {
                    console.error(`Error fetching content for ${link.url}:`, error);
                    return null;
                }
            })
        );

        const validPages = pagesWithContent
            .filter(result => result.status === 'fulfilled' && result.value !== null)
            .map(result => (result as PromiseFulfilledResult<any>).value);

        if (validPages.length < 2) {
            return NextResponse.json({
                success: true,
                suggestions: [],
                totalSuggestions: 0,
                message: 'Not enough pages with valid content',
            });
        }

        // Generate link suggestions using AI
        const suggestions = await generateLinkSuggestions(validPages, 30);

        // Save suggestions to database
        if (suggestions.length > 0) {
            const suggestionsToSave = suggestions.map(suggestion => ({
                site_id: siteId,
                source_url: suggestion.sourceUrl,
                target_url: suggestion.targetUrl,
                anchor_text: suggestion.anchorText,
                relevance_score: suggestion.relevanceScore,
                reasoning: suggestion.reasoning,
                status: 'pending',
            }));

            const { error: insertError } = await supabase
                .from('internal_link_suggestions')
                .insert(suggestionsToSave);

            if (insertError) {
                console.error('Error saving link suggestions:', insertError);
            }
        }

        return NextResponse.json({
            success: true,
            suggestions,
            totalSuggestions: suggestions.length,
        });
    } catch (error) {
        console.error('Error generating internal links:', error);
        return NextResponse.json(
            {
                error: 'Failed to generate internal links',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
