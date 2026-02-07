import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PropertyDetailClient from '@/components/pm/PropertyDetailClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface PageProps {
  params: { id: string }
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check PM/admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile || !['pm', 'admin'].includes(profile.role || '')) {
    redirect('/dashboard')
  }

  // Fetch property with units
  const { data: property } = await supabase
    .from('properties')
    .select(`
      *,
      units (
        *,
        profiles!units_tenant_id_fkey (
          id,
          email,
          full_name,
          phone
        )
      )
    `)
    .eq('id', params.id)
    .single()

  if (!property) {
    redirect('/pm/rentals/properties')
  }

  // Fetch maintenance requests for this property
  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select(`
      *,
      units!inner (
        property_id
      )
    `)
    .eq('units.property_id', params.id)
    .order('created_at', { ascending: false })

  return (
    <PropertyDetailClient 
      property={property}
      units={property.units || []}
      maintenanceRequests={maintenanceRequests || []}
      profileName={profile.full_name || 'Manager'}
    />
  )
}
