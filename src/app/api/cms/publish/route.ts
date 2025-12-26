import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createCMSClient, WordPressClient, ShopifyClient, NotionClient } from '@/lib/cms';
import { WixService } from '@/lib/cms/wix';
import { WebflowService } from '@/lib/cms/webflow';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const authHeader = request.headers.get("authorization");
    let user;

    if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
      const articleId = body.articleId;
      if (articleId) {
        const { data: art } = await supabase.from("articles").select("user_id").eq("id", articleId).single();
        if (art) user = { id: art.user_id };
      }
    }

    if (!user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      user = authUser;
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let { integration_id, title, content, excerpt, status, blog_id, seo_title, seo_description, cover_image, collection_id, articleId, platform, integrationId } = body;

    // Support cron job payload
    if (articleId) {
      const { data: article } = await supabase.from("articles").select("*").eq("id", articleId).single();
      if (article) {
        title = article.title;
        content = article.html_content || article.content;
        excerpt = article.excerpt || article.meta_description;
        seo_title = article.title;
        seo_description = article.meta_description;
        integration_id = integrationId;
      }
    }

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
    let result: unknown;
    let publishedUrl = '';

    if (integration.cms_type === 'wordpress') {
      result = await (client as WordPressClient).createPost({
        title,
        content,
        excerpt,
        status: status || 'publish',
      });
      const wpResult = result as { link?: string; id: number };
      publishedUrl = wpResult.link || `${integration.site_url}/?p=${wpResult.id}`;
    } else if (integration.cms_type === 'shopify') {
      if (!blog_id) {
        const blogs = await (client as ShopifyClient).getBlogs();
        if (blogs.length === 0) {
          return NextResponse.json({ error: 'No Shopify blogs found' }, { status: 400 });
        }
        result = await (client as ShopifyClient).createArticle(blogs[0].id, {
          title,
          body_html: content,
          summary_html: excerpt,
          published: status === 'publish',
        });
      } else {
        result = await (client as ShopifyClient).createArticle(blog_id, {
          title,
          body_html: content,
          summary_html: excerpt,
          published: status === 'publish',
        });
      }
      publishedUrl = `https://${integration.site_url}/blogs/${(result as { handle: string }).handle}`;
    } else if (integration.cms_type === 'notion') {
      const databaseId = integration.settings?.database_id;
      if (!databaseId) {
        return NextResponse.json({
          error: 'Notion database ID not configured',
          message: 'Please configure a database ID in integration settings'
        }, { status: 400 });
      }

      const blocks = (client as NotionClient).textToBlocks(content);
      result = await (client as NotionClient).createPage({
        parent: { database_id: databaseId },
        properties: {
          Name: { title: [{ text: { content: title } }] },
        },
        children: blocks,
      });
      publishedUrl = (result as { url: string }).url;
    } else if (integration.cms_type === 'wix') {
      const wixService = new WixService({
        appId: integration.settings?.app_id,
        appSecret: '',
        instanceId: integration.settings?.instance_id,
      });
      result = await wixService.createBlogPost(integration.access_token, {
        title,
        content,
        excerpt,
        coverImage: cover_image,
        seoTitle: seo_title,
        seoDescription: seo_description,
        publish: status === 'publish',
      });
      const wixResult = result as { url?: string; slug: string };
      publishedUrl = wixResult.url || `${integration.site_url}/post/${wixResult.slug}`;
    } else if (integration.cms_type === 'webflow') {
      const webflowService = new WebflowService({ accessToken: integration.access_token });
      const siteId = integration.settings?.site_id;

      if (!collection_id) {
        return NextResponse.json({
          error: 'Webflow collection ID required',
          message: 'Please provide collection_id for publishing'
        }, { status: 400 });
      }

      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      result = await webflowService.createCollectionItem(collection_id, {
        name: title,
        slug,
        'post-body': content,
        'post-summary': excerpt,
        'meta-title': seo_title || title,
        'meta-description': seo_description || excerpt,
      }, status !== 'publish');

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      if (status === 'publish' && !(result as any).isDraft) {
        /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
        await webflowService.publishCollectionItem(collection_id, (result as any).id);
      }

      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      publishedUrl = (result as { url?: string }).url || `${integration.site_url}/${slug}`;
    }

    return NextResponse.json({
      success: true,
      published_id: (result as { id: string | number }).id,
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