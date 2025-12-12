import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCMSClient } from '@/lib/cms';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { integration_id } = await request.json();

    if (!integration_id) {
      return NextResponse.json({ error: 'Missing integration_id' }, { status: 400 });
    }

    const { data: integration, error: fetchError } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('id', integration_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    const client = createCMSClient(integration);
    let syncedItems = 0;
    let syncedContent: any[] = [];

    if (integration.cms_type === 'wordpress') {
      const [posts, pages] = await Promise.all([
        client.getPosts({ per_page: 100 }),
        client.getPages({ per_page: 100 }),
      ]);
      syncedContent = [...posts, ...pages];
      syncedItems = syncedContent.length;
    } else if (integration.cms_type === 'shopify') {
      const blogs = await client.getBlogs();
      for (const blog of blogs) {
        const articles = await client.getArticles(blog.id);
        syncedContent.push(...articles);
      }
      syncedItems = syncedContent.length;
    } else if (integration.cms_type === 'notion') {
      const databases = await client.searchDatabases();
      syncedItems = databases.length;
      syncedContent = databases;
    }

    await supabase
      .from('cms_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
        status: 'connected',
      })
      .eq('id', integration_id);

    return NextResponse.json({ 
      success: true,
      synced_items: syncedItems,
      message: `Successfully synced ${syncedItems} items from ${integration.cms_type}`,
      content: syncedContent.slice(0, 10),
    });

  } catch (error) {
    console.error('CMS sync error:', error);
    return NextResponse.json({ 
      error: 'Failed to sync CMS content',
      details: String(error)
    }, { status: 500 });
  }
}
