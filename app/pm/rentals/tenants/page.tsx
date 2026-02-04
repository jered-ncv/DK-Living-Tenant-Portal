import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TenantsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Fetch all tenants with their units
  const { data: tenants } = await supabase
    .from('profiles')
    .select(`
      *,
      units (
        unit_number,
        properties (name)
      )
    `)
    .not('units', 'is', null)
    .order('full_name')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Tenants</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add lease
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Receive payment
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Compose email
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Resident Center users
            </button>
          </div>
        </div>
      </header>

      {/* Info Banner */}
      <div className="bg-blue-50 border-l-4 border-blue-400 px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-blue-800">
              Curious about Resident Center adoption? It looks like 98% of tenants have an active account.
            </p>
          </div>
          <Link href="#" className="text-sm text-blue-600 hover:underline font-medium">
            Manage users
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <select className="px-4 py-2 border rounded">
            <option>All properties</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>(2) Future, Active</option>
          </select>
          <button className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50">
            Add filter option ▼
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-sm text-gray-600">{tenants?.length || 0} matches</div>
          <button className="text-sm text-blue-600 hover:underline">📤 Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name ▲</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resident Center Status</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tenants?.map((tenant) => {
                const firstName = tenant.full_name?.split(' ')[0] || ''
                const lastName = tenant.full_name?.split(' ').slice(1).join(' ') || ''
                const unit = Array.isArray(tenant.units) ? tenant.units[0] : tenant.units
                
                return (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/pm/rentals/tenants/${tenant.id}`} className="text-blue-600 hover:underline">
                        {firstName}
                      </Link>
                      <div className="text-xs text-gray-500">TENANT</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{lastName}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {unit?.properties?.name} - {unit?.unit_number}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gray-400">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                          </svg>
                          <span>(555) 555-5555</span>
                        </div>
                        {tenant.email && (
                          <>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                              </svg>
                              <span className="text-blue-600">(555) 555-5555</span>
                            </div>
                            <Link href="#" className="text-xs text-blue-600 hover:underline">
                              Send opt-in text message
                            </Link>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`mailto:${tenant.email}`} className="text-sm text-blue-600 hover:underline">
                        {tenant.email}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">Activated</span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">⋯</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Back Link */}
      <div className="px-8 pb-8">
        <Link href="/pm/dashboard" className="text-sm text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
