import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkIntegrationLimit } from '@/lib/usage-limits';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: integrations, error } = await supabaseAdmin
      .from('cms_integrations')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`[VERIFY] User ID: ${user.id}`);
    console.log(`[VERIFY] Integrations Count: ${integrations?.length || 0}`);

    try {
      const fs = require('fs');
      fs.writeFileSync('integrations-debug.json', JSON.stringify({
        timestamp: new Date().toISOString(),
        userId: user.id,
        count: integrations?.length || 0,
        integrations: integrations
      }, null, 2));
    } catch (e) { }

    if (integrations && integrations.length > 0) {
      console.log(`[VERIFY] First Integration Platform: ${integrations[0].platform}, Status: ${integrations[0].status}`);
    }

    const sanitizedIntegrations = integrations?.map(integration => ({
      ...integration,
      credentials: undefined,
    }));

    return NextResponse.json({ integrations: sanitizedIntegrations });

  } catch (error) {
    console.error('Failed to fetch CMS integrations:', error);
    return NextResponse.json({
      error: 'Failed to fetch integrations',
      details: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limitCheck = await checkIntegrationLimit(user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: limitCheck.message,
          current: limitCheck.current,
          limit: limitCheck.limit
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { platform, access_token, site_url, config, site_id } = body;

    if (!platform || !access_token) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: integration, error: insertError } = await supabase
      .from('cms_integrations')
      .insert({
        user_id: user.id,
        site_id: site_id || null,
        platform,
        credentials: { access_token },
        site_url: site_url || 'unknown',
        status: 'active',
        config: config || {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      integration: {
        ...integration,
        credentials: undefined,
      }
    });

  } catch (error) {
    console.error('Failed to create CMS integration:', error);
    return NextResponse.json({
      error: 'Failed to create integration',
      details: String(error)
    }, { status: 500 });
  }
}