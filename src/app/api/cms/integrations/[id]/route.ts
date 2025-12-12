import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('cms_integrations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Failed to delete CMS integration:', error);
    return NextResponse.json({ 
      error: 'Failed to delete integration',
      details: String(error)
    }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) updates.status = body.status;
    if (body.auto_publish_enabled !== undefined) updates.auto_publish_enabled = body.auto_publish_enabled;
    if (body.settings !== undefined) updates.settings = body.settings;
    if (body.last_sync_at !== undefined) updates.last_sync_at = body.last_sync_at;

    const { data: integration, error } = await supabase
      .from('cms_integrations')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ 
      success: true,
      integration: {
        ...integration,
        access_token: undefined,
        refresh_token: undefined,
      }
    });

  } catch (error) {
    console.error('Failed to update CMS integration:', error);
    return NextResponse.json({ 
      error: 'Failed to update integration',
      details: String(error)
    }, { status: 500 });
  }
}
