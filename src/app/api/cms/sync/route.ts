import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCMSClient, WordPressClient, ShopifyClient, NotionClient } from '@/lib/cms';
import { WixService } from '@/lib/cms/wix';
import { WebflowService } from '@/lib/cms/webflow';

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
    let syncedContent: unknown[] = [];

    if (integration.cms_type === 'wordpress') {
      const [posts, pages] = await Promise.all([
        (client as WordPressClient).getPosts({ per_page: 100 }),
        (client as WordPressClient).getPages({ per_page: 100 }),
      ]);
      syncedContent = [...posts, ...pages];
      syncedItems = syncedContent.length;
    } else if (integration.cms_type === 'shopify') {
      const blogs = await (client as ShopifyClient).getBlogs();
      for (const blog of blogs) {
        const articles = await (client as ShopifyClient).getArticles(blog.id);
        syncedContent.push(...articles);
      }
      syncedItems = syncedContent.length;
    } else if (integration.cms_type === 'notion') {
      const databases = await (client as NotionClient).searchDatabases();
      syncedItems = databases.length;
      syncedContent = databases;
    } else if (integration.cms_type === 'wix') {
      const wixService = new WixService({
        appId: integration.settings?.app_id,
        appSecret: '',
        instanceId: integration.settings?.instance_id,
      });
      const [pages, posts] = await Promise.all([
        wixService.fetchPages(integration.access_token),
        wixService.fetchBlogPosts(integration.access_token),
      ]);
      syncedContent = [...pages, ...posts];
      syncedItems = syncedContent.length;
    } else if (integration.cms_type === 'webflow') {
      const webflowService = new WebflowService({ accessToken: integration.access_token });
      const siteId = integration.settings?.site_id;
      if (siteId) {
        const collections = await webflowService.getCollections(siteId);
        for (const collection of collections) {
          const items = await webflowService.getCollectionItems(collection.id);
          syncedContent.push(...items);
        }
        syncedItems = syncedContent.length;
      }
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