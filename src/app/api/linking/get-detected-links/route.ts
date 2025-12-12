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

            return fetchDetectedLinks(supabase, site.id);
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

        return fetchDetectedLinks(supabase, siteId);
    } catch (error) {
        console.error('Error fetching detected links:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch detected links',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

async function fetchDetectedLinks(supabase: any, siteId: string) {
    const { data: links, error } = await supabase
        .from('detected_links')
        .select('id, url, title, detected_at')
        .eq('site_id', siteId)
        .order('detected_at', { ascending: false });

    if (error) {
        throw new Error(`Failed to fetch links: ${error.message}`);
    }

    return NextResponse.json({
        links: links || [],
        total: links?.length || 0,
    });
}
