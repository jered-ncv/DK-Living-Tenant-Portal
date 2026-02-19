import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

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

  if (!body.new_unit_id || !body.new_rent || !body.new_lease_start || !body.new_lease_end) {
    return NextResponse.json(
      { error: 'Missing required fields: new_unit_id, new_rent, new_lease_start, new_lease_end' },
      { status: 400 }
    );
  }

  const { data: newLeaseId, error } = await supabase.rpc('process_transfer', {
    p_old_lease_id: params.id,
    p_new_unit_id: body.new_unit_id,
    p_new_rent: body.new_rent,
    p_new_lease_start: body.new_lease_start,
    p_new_lease_end: body.new_lease_end,
    p_performed_by: user.id,
    p_performed_by_name: profile?.full_name || 'Unknown',
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: newLease } = await supabase
    .from('leases')
    .select('*')
    .eq('id', newLeaseId)
    .single();

  return NextResponse.json({
    message: 'Transfer completed',
    old_lease_id: params.id,
    new_lease: newLease,
  }, { status: 201 });
}
