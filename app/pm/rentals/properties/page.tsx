import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PropertiesPageClient from '@/components/pm/PropertiesPageClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PropertiesPage() {
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

  // Fetch properties
  const { data: properties } = await supabase
    .from('properties')
    .select('*')
    .order('name')

  return (
    <PropertiesPageClient 
      properties={properties || []} 
      profileName={profile.full_name || 'Manager'}
    />
  )
}
