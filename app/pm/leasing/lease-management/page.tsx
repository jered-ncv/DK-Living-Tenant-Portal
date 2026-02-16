import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function LeaseManagementPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Fetch units with lease data (active properties only)
  const { data: units } = await supabase
    .from('units')
    .select(`
      *,
      properties!inner (name, is_active),
      profiles (full_name)
    `)
    .eq('properties.is_active', true)
    .not('lease_end_date', 'is', null)
    .order('lease_end_date')

  // Calculate days left for each lease
  const leasesWithDays = units?.map(unit => {
    const daysLeft = unit.lease_end_date 
      ? Math.floor((new Date(unit.lease_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null
    return { ...unit, daysLeft }
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Lease management</h1>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-8">
        <div className="flex gap-6">
          <button className="pb-3 border-b-2 border-green-500 text-green-600 font-medium">
            Renewals
          </button>
          <button className="pb-3 text-gray-600 hover:text-gray-900">
            Leasing
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white border-b px-8 py-3">
        <div className="flex gap-4 text-sm">
          <button className="px-3 py-1 bg-green-500 text-white rounded-full">
            Not Started (24)
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
            Renewal offers (5)
          </button>
          <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200">
            Accepted offers (0)
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <select className="px-4 py-2 border rounded">
            <option>2061 Forbes St</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>(8) 241+ days, 181-240 days, 1...</option>
          </select>
        </div>
        <div className="mt-4 text-sm text-gray-600">{leasesWithDays.length} matches</div>
      </div>

      {/* Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left ▼</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lease</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Terms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rental Owners</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {leasesWithDays.map((unit) => {
                const daysLeft = unit.daysLeft || 0
                let badgeColor = 'bg-green-100 text-green-800'
                if (daysLeft < 100) badgeColor = 'bg-orange-100 text-orange-800'
                if (daysLeft < 60) badgeColor = 'bg-red-100 text-red-800'

                return (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      {daysLeft > 0 && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
                          {daysLeft} DAYS
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Link href="#" className="text-blue-600 hover:underline">
                        {unit.properties?.name} - {unit.unit_number} | {unit.profiles?.full_name || 'Vacant'}
                      </Link>
                      <div className="text-xs text-gray-500">{unit.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="text-gray-900">
                        Fixed | ${parseFloat(unit.monthly_rent?.toString() || '0').toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {unit.lease_start_date && unit.lease_end_date &&
                          `${new Date(unit.lease_start_date).toLocaleDateString()} - ${new Date(unit.lease_end_date).toLocaleDateString()}`
                        }
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">—</td>
                    <td className="px-6 py-4">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">
                        Generate offer
                      </button>
                    </td>
                    <td className="px-4 py-4">
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
