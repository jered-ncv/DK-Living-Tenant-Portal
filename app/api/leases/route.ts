import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const view = searchParams.get('view') || 'all';
  const propertyId = searchParams.get('property_id');
  const status = searchParams.get('status');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['pm', 'admin'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let data, error;

  switch (view) {
    case 'renewal_alerts':
      ({ data, error } = await supabase
        .from('renewal_alerts')
        .select('*')
        .order('sort_priority', { ascending: true }));
      break;

    case 'rent_roll':
      ({ data, error } = await supabase
        .from('rent_roll_view')
        .select('*')
        .order('property_address', { ascending: true }));
      break;

    default: {
      let query = supabase
        .from('leases')
        .select(`
          *,
          unit:units(unit_number, bed_count, bath_count, property:properties(address))
        `)
        .order('lease_end', { ascending: true });

      if (propertyId) query = query.eq('unit.property_id', propertyId);
      if (status) query = query.eq('status', status);

      ({ data, error } = await query);
      break;
    }
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const body = await request.json();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: lease, error } = await supabase
    .from('leases')
    .insert({
      ...body,
      created_by: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await supabase.rpc('log_lease_action', {
    p_lease_id: lease.id,
    p_action_type: 'lease_created',
    p_description: `Lease created: ${body.tenant_name} at $${body.monthly_rent}/mo`,
    p_performed_by: user.id,
  });

  return NextResponse.json(lease, { status: 201 });
}
