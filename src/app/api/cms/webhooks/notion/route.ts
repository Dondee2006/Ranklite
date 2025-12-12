import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { page_id, database_id, action } = body;
    
    if (!page_id && !database_id) {
      return NextResponse.json({ error: 'Missing page or database ID' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data: integrations } = await supabase
      .from('cms_integrations')
      .select('*')
      .eq('cms_type', 'notion');

    if (!integrations || integrations.length === 0) {
      return NextResponse.json({ error: 'No Notion integrations found' }, { status: 404 });
    }

    for (const integration of integrations) {
      const integrationDbId = integration.settings?.database_id;
      if (integrationDbId === database_id) {
        await supabase
          .from('cms_integrations')
          .update({
            last_sync_at: new Date().toISOString(),
          })
          .eq('id', integration.id);
      }
    }

    console.log('Notion webhook received:', {
      page_id,
      database_id,
      action,
    });

    return NextResponse.json({ 
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('Notion webhook error:', error);
    return NextResponse.json({ 
      error: 'Failed to process webhook',
      details: String(error)
    }, { status: 500 });
  }
}
