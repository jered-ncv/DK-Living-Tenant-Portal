import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface UnitCreateBody {
  propertyId: string
  unitNumber: string
  tenantEmail?: string
  monthlyRent?: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as UnitCreateBody
    const { propertyId, unitNumber, tenantEmail, monthlyRent } = body

    if (!propertyId || !unitNumber) {
      return NextResponse.json(
        { error: 'Property ID and unit number are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verify user is admin/pm
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'pm'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Look up tenant by email if provided
    let tenantId = null
    if (tenantEmail) {
      const { data: tenant } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', tenantEmail)
        .single()
      
      tenantId = tenant?.id
    }

    // Create unit
    const { data: unit, error } = await supabase
      .from('units')
      .insert({
        property_id: propertyId,
        unit_number: unitNumber,
        tenant_id: tenantId,
        monthly_rent: monthlyRent,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating unit:', error)
      return NextResponse.json(
        { error: 'Failed to create unit' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, unit })
  } catch (error) {
    console.error('Error in unit creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
