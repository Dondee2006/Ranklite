
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    return NextResponse.json({
        debug_timestamp: new Date().toISOString(),
        environment_check: {
            items_in_process_env: Object.keys(process.env).length,
            NODE_ENV: process.env.NODE_ENV,
            VERCEL_ENV: process.env.VERCEL_ENV || 'unknown'
        },
        notion_token: {
            exists: !!token,
            length: token?.length || 0,
            prefix: token ? token.substring(0, 5) + '...' : 'N/A',
            is_secret_format: token?.startsWith('secret_') || false
        },
        notion_db: {
            exists: !!dbId,
            length: dbId?.length || 0,
        }
    });
}
