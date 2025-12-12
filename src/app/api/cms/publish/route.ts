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

    const { integration_id, title, content, excerpt, status, blog_id } = await request.json();

    if (!integration_id || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
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
    let result: any;
    let publishedUrl = '';

    if (integration.cms_type === 'wordpress') {
      result = await client.createPost({
        title,
        content,
        excerpt,
        status: status || 'publish',
      });
      publishedUrl = result.link || `${integration.site_url}/?p=${result.id}`;
    } else if (integration.cms_type === 'shopify') {
      if (!blog_id) {
        const blogs = await client.getBlogs();
        if (blogs.length === 0) {
          return NextResponse.json({ error: 'No Shopify blogs found' }, { status: 400 });
        }
        result = await client.createArticle(blogs[0].id, {
          title,
          body_html: content,
          summary_html: excerpt,
          published: status === 'publish',
        });
      } else {
        result = await client.createArticle(blog_id, {
          title,
          body_html: content,
          summary_html: excerpt,
          published: status === 'publish',
        });
      }
      publishedUrl = `https://${integration.site_url}/blogs/${result.handle}`;
    } else if (integration.cms_type === 'notion') {
      const databaseId = integration.settings?.database_id;
      if (!databaseId) {
        return NextResponse.json({ 
          error: 'Notion database ID not configured',
          message: 'Please configure a database ID in integration settings'
        }, { status: 400 });
      }
      
      const blocks = client.textToBlocks(content);
      result = await client.createPage({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: title } }] },
        },
        children: blocks,
      });
      publishedUrl = result.url;
    }

    return NextResponse.json({ 
      success: true,
      published_id: result.id,
      published_url: publishedUrl,
      message: `Successfully published to ${integration.cms_type}`,
      result,
    });

  } catch (error) {
    console.error('CMS publish error:', error);
    return NextResponse.json({ 
      error: 'Failed to publish to CMS',
      details: String(error)
    }, { status: 500 });
  }
}
