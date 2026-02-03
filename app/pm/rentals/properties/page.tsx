import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Properties</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add property
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Management fees ▼
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Manage bank accounts
            </button>
            <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              ⋯
            </button>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" className="rounded" />
            <span>Show bank accounts</span>
          </label>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4 items-center">
          <select className="px-4 py-2 border border-gray-300 rounded">
            <option>All rentals</option>
          </select>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Add filter option ▼
          </button>
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">{properties?.length || 0} matches</div>
          <button className="text-sm text-blue-600 hover:underline">📤 Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rental Owners
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operating Account
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deposit Trust Account
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties && properties.length > 0 ? (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/pm/rentals/properties/${property.id}`} className="text-blue-600 hover:underline">
                        {property.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {property.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      —
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {profile.full_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      Residential, Multi-Family
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">🏦</span>
                        <Link href="#" className="text-blue-600 hover:underline text-xs">Setup</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">🏦</span>
                        <Link href="#" className="text-blue-600 hover:underline text-xs">Setup</Link>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">⋯</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    No properties found. Click "Add property" to get started.
                  </td>
                </tr>
              )}
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
