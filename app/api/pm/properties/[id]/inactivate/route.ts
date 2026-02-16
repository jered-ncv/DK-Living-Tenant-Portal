import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check PM/admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['pm', 'admin'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Forbidden - PM or Admin role required' },
        { status: 403 }
      )
    }

    // Update property to inactive status
    // Note: You'll need to add an 'is_active' or 'status' column to the properties table
    const { data, error } = await supabase
      .from('properties')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error inactivating property:', error)
      return NextResponse.json(
        { error: 'Failed to inactivate property', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      property: data 
    })
  } catch (error) {
    console.error('Error in inactivate route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
