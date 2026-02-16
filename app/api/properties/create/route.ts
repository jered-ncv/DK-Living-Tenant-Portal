import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface PropertyCreateBody {
  name: string
  address: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as PropertyCreateBody
    const { name, address } = body

    if (!name || !address) {
      return NextResponse.json(
        { error: 'Property name and address are required' },
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

    // Create property
    const { data: property, error } = await supabase
      .from('properties')
      .insert({ name, address })
      .select()
      .single()

    if (error) {
      console.error('Error creating property:', error)
      return NextResponse.json(
        { error: 'Failed to create property' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, property })
  } catch (error) {
    console.error('Error in property creation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
