import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const shopDomain = request.headers.get('x-shopify-shop-domain');
    const hmac = request.headers.get('x-shopify-hmac-sha256');
    
    if (!shopDomain) {
      return NextResponse.json({ error: 'Missing shop domain' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: integration } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('cms_type', 'shopify')
      .eq('site_url', shopDomain)
      .single();

    if (!integration) {
      return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
    }

    await supabase
      .from('cms_integrations')
      .update({
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', integration.id);

    console.log('Shopify webhook received:', {
      shop: shopDomain,
      topic: request.headers.get('x-shopify-topic'),
      data: body,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Shopify webhook error:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: String(error)
    }, { status: 500 });
  }
}
