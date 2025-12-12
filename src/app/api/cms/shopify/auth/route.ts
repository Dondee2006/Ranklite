import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { shop, access_token, site_id } = await request.json();

    if (!shop || !access_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const testUrl = `https://${shop}/admin/api/2025-10/blogs.json`;
    const testResponse = await fetch(testUrl, {
      headers: {
        'X-Shopify-Access-Token': access_token,
      },
    });

    if (!testResponse.ok) {
      return NextResponse.json({ 
        error: 'Failed to validate Shopify connection',
        details: await testResponse.text()
      }, { status: 400 });
    }

    const { data: existingIntegration } = await supabase
      .from('cms_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('cms_type', 'shopify')
      .eq('site_url', shop)
      .single();

    if (existingIntegration) {
      const { error: updateError } = await supabase
        .from('cms_integrations')
        .update({
          access_token,
          status: 'connected',
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingIntegration.id);

      if (updateError) throw updateError;

      return NextResponse.json({ 
        success: true, 
        integration_id: existingIntegration.id,
        message: 'Shopify connection updated successfully' 
      });
    }

    const { data: integration, error: insertError } = await supabase
      .from('cms_integrations')
      .insert({
        user_id: user.id,
        site_id: site_id || null,
        cms_type: 'shopify',
        access_token,
        site_url: shop,
        status: 'connected',
        settings: {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({ 
      success: true, 
      integration_id: integration.id,
      message: 'Shopify connected successfully' 
    });

  } catch (error) {
    console.error('Shopify auth error:', error);
    return NextResponse.json({ 
      error: 'Failed to connect Shopify',
      details: String(error)
    }, { status: 500 });
  }
}
