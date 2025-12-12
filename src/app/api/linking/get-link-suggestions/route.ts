import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const siteId = searchParams.get('siteId');

        if (!siteId) {
            // If no siteId provided, get user's site
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

            return fetchLinkSuggestions(supabase, site.id);
        }

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

        return fetchLinkSuggestions(supabase, siteId);
    } catch (error) {
        console.error('Error fetching link suggestions:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch link suggestions',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

async function fetchLinkSuggestions(supabase: any, siteId: string) {
    const { data: suggestions, error } = await supabase
        .from('internal_link_suggestions')
        .select('*')
        .eq('site_id', siteId)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch suggestions: ${error.message}`);
    }

    return NextResponse.json({
        suggestions: suggestions || [],
        total: suggestions?.length || 0,
    });
}
