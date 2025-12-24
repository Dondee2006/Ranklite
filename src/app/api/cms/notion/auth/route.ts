import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

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
      const errorText = await testResponse.text();
      console.error('Notion API validation failed:', {
        status: testResponse.status,
        statusText: testResponse.statusText,
        error: errorText
      });

      let errorMessage = 'Failed to validate Notion connection';
      if (testResponse.status === 401) {
        errorMessage = 'Invalid Notion integration token. Please check your token and try again.';
      } else if (testResponse.status === 403) {
        errorMessage = 'Access denied. Make sure your integration has the required permissions.';
      }

      return NextResponse.json({
        error: errorMessage,
        details: errorText
      }, { status: 400 });
    }

    const { data: existingIntegration } = await supabaseAdmin
      .from('cms_integrations')
      .select('id')
      .eq('user_id', user.id)
      .eq('platform', 'notion')
      .single();

    const settingsObj = database_id ? { database_id } : {};

    if (existingIntegration) {
      const { error: updateError } = await supabaseAdmin
        .from('cms_integrations')
        .update({
          credentials: { access_token },
          status: 'active',
          config: settingsObj,
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

    const { data: integration, error: insertError } = await supabaseAdmin
      .from('cms_integrations')
      .insert({
        user_id: user.id,
        platform: 'notion',
        credentials: { access_token },
        status: 'active',
        config: settingsObj
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error details:', insertError);
      throw insertError;
    }

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