import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { access_token, database_id, site_id } = await request.json();

    if (!access_token) {
      return NextResponse.json({ error: 'Missing access token' }, { status: 400 });
    }

    const testUrl = 'https://api.notion.com/v1/search';
    const testResponse = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: { property: 'object', value: 'database' },
      }),
    });

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to validate Notion connection',
        details: await testResponse.text()
      }, { status: 400 });
    }

    const { data: existingIntegration } = await supabase
      .from('cms_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('cms_type', 'notion')
      .single();

    const settings = database_id ? { database_id } : {};

    if (existingIntegration) {
      const { error: updateError } = await supabase
        .from('cms_integrations')
        .update({
          access_token,
          status: 'connected',
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        integration_id: existingIntegration.id,
        message: 'Notion connection updated successfully' 
      });
    }

    const { data: integration, error: insertError } = await supabase
      .from('cms_integrations')
      .insert({
        user_id: user.id,
        site_id: site_id || null,
        cms_type: 'notion',
        access_token,
        site_url: 'notion.so',
        status: 'connected',
        settings,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      integration_id: integration.id,
      message: 'Notion connected successfully' 
    });

  } catch (error) {
    console.error('Notion auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect Notion',
      details: String(error)
    }, { status: 500 });
  }
}
