import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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
  const { data: property, error: propertyError } = await supabase
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

  // Debug: show error if property not found
  if (!property || propertyError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify({ 
            propertyId: params.id,
            property,
            error: propertyError 
          }, null, 2)}
        </pre>
        <Link href="/pm/rentals/properties" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to Properties
        </Link>
      </div>
    )
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
