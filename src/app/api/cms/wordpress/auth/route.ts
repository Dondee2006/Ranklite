import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { site_url, access_token, site_id } = await request.json();

    if (!site_url || !access_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const testUrl = `${site_url}/wp-json/wp/v2/posts?per_page=1`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
      },
    });

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to validate WordPress connection',
        details: await testResponse.text()
      }, { status: 400 });
    }

    const { data: existingIntegration } = await supabase
      .from('cms_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'wordpress')
      .eq('site_url', site_url)
      .single();

    if (existingIntegration) {
      const { error: updateError } = await supabase
        .from('cms_integrations')
        .update({
          credentials: { access_token },
          status: 'connected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        integration_id: existingIntegration.id,
        message: 'WordPress connected successfully' 
      });
    }

    const { data: integration, error: insertError } = await supabase
      .from('cms_integrations')
      .insert({
        user_id: user.id,
        site_id: site_id || null,
        platform: 'wordpress',
        credentials: { access_token },
        site_url,
        status: 'connected',
        config: {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      integration_id: integration.id,
      message: 'WordPress connected successfully' 
    });

  } catch (error) {
    console.error('WordPress auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect WordPress',
      details: String(error)
    }, { status: 500 });
  }
}