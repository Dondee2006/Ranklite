import { NextResponse } from 'next/server';
import { fetchPageContent } from '@/lib/linking/content-extractor';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { url } = body;

        if (!url || typeof url !== 'string') {
            return NextResponse.json(
                { error: 'URL is required' },
                { status: 400 }
            );
        }

        const content = await fetchPageContent(url);

        return NextResponse.json({
            url: content.url,
            title: content.title,
            textContent: content.textContent,
            htmlContent: content.htmlContent,
            contentHash: content.contentHash,
        });
    } catch (error) {
        console.error('Error fetching page details:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch page details',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
