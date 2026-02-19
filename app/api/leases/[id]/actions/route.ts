import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('lease_actions')
    .select('*')
    .eq('lease_id', params.id)
    .order('performed_at', { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single();

  const { data: action, error: actionError } = await supabase.rpc('log_lease_action', {
    p_lease_id: params.id,
    p_action_type: body.action_type,
    p_description: body.description || null,
    p_old_rent: body.old_rent || null,
    p_new_rent: body.new_rent || null,
    p_related_lease_id: body.related_lease_id || null,
    p_performed_by: user.id,
    p_performed_by_name: profile?.full_name || 'Unknown',
  });

  if (actionError) return NextResponse.json({ error: actionError.message }, { status: 500 });

  const statusUpdates: Record<string, object> = {
    renewal_offer_sent: {
      renewal_status: 'offer_sent',
      renewal_offer_rent: body.new_rent,
      renewal_offer_sent_at: new Date().toISOString(),
    },
    renewal_accepted: {
      renewal_status: 'accepted',
      renewal_response_at: new Date().toISOString(),
    },
    renewal_declined: {
      renewal_status: 'declined',
      renewal_response_at: new Date().toISOString(),
    },
    notice_received: {
      notice_given_at: new Date().toISOString(),
      notice_type: body.notice_type || 'tenant_notice',
      renewal_status: 'not_renewing',
    },
    non_renewal_sent: {
      notice_given_at: new Date().toISOString(),
      notice_type: 'non_renewal',
      renewal_status: 'not_renewing',
    },
    move_out: {
      status: 'expired',
      move_out_date: body.move_out_date || new Date().toISOString().split('T')[0],
    },
    lease_terminated: {
      status: 'terminated',
    },
  };

  if (statusUpdates[body.action_type]) {
    await supabase
      .from('leases')
      .update(statusUpdates[body.action_type])
      .eq('id', params.id);
  }

  return NextResponse.json({ action_id: action }, { status: 201 });
}
