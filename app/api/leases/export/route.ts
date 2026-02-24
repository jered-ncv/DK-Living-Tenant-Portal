import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
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

  // Get query params for filtering
  const { searchParams } = new URL(request.url);
  const propertyId = searchParams.get('property_id');
  const status = searchParams.get('status');

  // Fetch rent roll data
  let query = supabase
    .from('rent_roll_view')
    .select('*')
    .order('property_address', { ascending: true });

  const { data: rentRoll, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!rentRoll || rentRoll.length === 0) {
    return NextResponse.json({ error: 'No data to export' }, { status: 404 });
  }

  // Generate CSV
  const headers = [
    'Property',
    'Unit',
    'Tenant Name',
    'Tenant Email',
    'Tenant Phone',
    'Lease Start',
    'Lease End',
    'Days Remaining',
    'Monthly Rent',
    'Security Deposit',
    'Balance Due',
    'Prepayments'
  ];

  const csvRows = [
    headers.join(','),
    ...rentRoll.map(row => [
      `"${row.property_name}"`,
      `"${row.unit_number}"`,
      `"${row.tenant_name}"`,
      `"${row.tenant_email || ''}"`,
      `"${row.tenant_phone || ''}"`,
      row.lease_start,
      row.lease_end,
      row.days_remaining,
      row.monthly_rent,
      row.security_deposit || 0,
      row.balance_due,
      row.prepayments
    ].join(','))
  ];

  const csv = csvRows.join('\n');

  // Return as downloadable CSV file
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="rent-roll-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}
