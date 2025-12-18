import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { createCMSClient } from '@/lib/cms';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET || 'development';
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseClient(supabaseUrl, supabaseServiceKey);

    const { data: integrations, error } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('status', 'connected')
      .eq('auto_publish_enabled', true);

    if (error) throw error;

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ 
        message: 'No integrations configured for auto-sync',
        synced: 0 
      });
    }

    const results = [];

    for (const integration of integrations) {
      try {
        const client = createCMSClient(integration);
        let syncedItems = 0;

        if (integration.cms_type === 'wordpress') {
          const [posts, pages] = await Promise.all([
            client.getPosts({ per_page: 100 }),
            client.getPages({ per_page: 100 }),
          ]);
          syncedItems = posts.length + pages.length;
        } else if (integration.cms_type === 'shopify') {
          const blogs = await client.getBlogs();
          for (const blog of blogs) {
            const articles = await client.getArticles(blog.id);
            syncedItems += articles.length;
          }
        } else if (integration.cms_type === 'notion') {
          const databases = await client.searchDatabases();
          syncedItems = databases.length;
        }

        await supabase
          .from('cms_integrations')
          .update({
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', integration.id);

        results.push({
          integration_id: integration.id,
          cms_type: integration.cms_type,
          synced_items: syncedItems,
          success: true,
        });

      } catch (syncError) {
        console.error(`Sync error for ${integration.cms_type}:`, syncError);
        results.push({
          integration_id: integration.id,
          cms_type: integration.cms_type,
          success: false,
          error: String(syncError),
        });
      }
    }

    return NextResponse.json({ 
      message: 'Daily sync completed',
      total_integrations: integrations.length,
      results,
    });

  } catch (error) {
    console.error('Daily sync cron error:', error);
    return NextResponse.json({ 
      error: 'Failed to run daily sync',
      details: String(error)
    }, { status: 500 });
  }
}
