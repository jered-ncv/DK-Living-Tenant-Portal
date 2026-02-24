import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

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

  // Fetch units that don't have an active lease
  // First, get all unit IDs that have active leases
  const { data: activeLeases } = await supabase
    .from('leases')
    .select('unit_id')
    .eq('status', 'active');

  const occupiedUnitIds = activeLeases?.map(l => l.unit_id) || [];

  // Then get all units that are NOT in that list
  let query = supabase
    .from('units')
    .select(`
      id,
      unit_number,
      property_id,
      property:properties (
        name,
        address
      )
    `)
    .eq('properties.is_active', true)
    .order('property_id');

  if (occupiedUnitIds.length > 0) {
    query = query.not('id', 'in', `(${occupiedUnitIds.join(',')})`);
  }

  const { data: vacantUnits, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(vacantUnits || []);
}
