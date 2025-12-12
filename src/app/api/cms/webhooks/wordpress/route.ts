import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { post_id, post_title, post_status, site_url } = body;

    if (!post_id || !site_url) {
      return NextResponse.json({ error: 'Missing required webhook data' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: integration } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('cms_type', 'wordpress')
      .eq('site_url', site_url)
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

    console.log('WordPress webhook received:', {
      post_id,
      post_title,
      post_status,
      site_url,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('WordPress webhook error:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: String(error)
    }, { status: 500 });
  }
}
