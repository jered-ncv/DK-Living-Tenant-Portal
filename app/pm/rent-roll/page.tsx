import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RentRollPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has PM role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['pm', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch all units with tenant and property info
  const { data: units } = await supabase
    .from('units')
    .select(`
      *,
      properties (
        name,
        address
      ),
      tenant:profiles (
        full_name,
        email,
        phone
      )
    `)
    .order('properties(name)')

  // Group by property
  const propertiesMap = new Map()
  units?.forEach(unit => {
    const propName = unit.properties?.name || 'Unknown Property'
    if (!propertiesMap.has(propName)) {
      propertiesMap.set(propName, [])
    }
    propertiesMap.get(propName).push(unit)
  })

  const totalMonthlyRent = units?.reduce((sum, u) => sum + (parseFloat(u.monthly_rent?.toString() || '0')), 0) || 0
  const occupiedUnits = units?.filter(u => u.tenant_id)?.length || 0
  const totalUnits = units?.length || 0
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits * 100).toFixed(1) : '0'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Rent Roll</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/pm/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              <Link href="/pm/rent-roll" className="text-blue-600 font-semibold">Rent Roll</Link>
              <Link href="/pm/financials" className="text-gray-600 hover:text-blue-600">Financials</Link>
              <Link href="/pm/tenants" className="text-gray-600 hover:text-blue-600">Tenants</Link>
              <Link href="/pm/properties" className="text-gray-600 hover:text-blue-600">Properties</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Units</div>
            <div className="text-3xl font-bold text-gray-900">{totalUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Occupied</div>
            <div className="text-3xl font-bold text-green-600">{occupiedUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Occupancy Rate</div>
            <div className="text-3xl font-bold text-blue-600">{occupancyRate}%</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Monthly Rent Total</div>
            <div className="text-3xl font-bold text-gray-900">${totalMonthlyRent.toFixed(2)}</div>
          </div>
        </div>

        {/* Export Button */}
        <div className="mb-6 flex justify-end">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export to CSV
          </button>
        </div>

        {/* Rent Roll Table by Property */}
        <div className="space-y-8">
          {Array.from(propertiesMap.entries()).map(([propertyName, propertyUnits]) => (
            <div key={propertyName} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-100 px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">{propertyName}</h2>
                <p className="text-sm text-gray-600">{propertyUnits[0].properties?.address}</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tenant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lease Start
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lease End
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Monthly Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {propertyUnits.map((unit: any) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {unit.unit_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {unit.tenant?.full_name || <span className="text-gray-400 italic">Vacant</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {unit.tenant?.email && (
                            <div>
                              <div>{unit.tenant.email}</div>
                              {unit.tenant.phone && <div className="text-xs">{unit.tenant.phone}</div>}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {unit.lease_start_date ? new Date(unit.lease_start_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {unit.lease_end_date ? new Date(unit.lease_end_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                          ${parseFloat(unit.monthly_rent?.toString() || '0').toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {unit.tenant_id ? (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Occupied
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                              Vacant
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Property Summary */}
              <div className="bg-gray-50 px-6 py-3 border-t flex justify-between text-sm">
                <span className="font-medium text-gray-700">
                  {propertyUnits.filter((u: any) => u.tenant_id).length} / {propertyUnits.length} units occupied
                </span>
                <span className="font-semibold text-gray-900">
                  Total: ${propertyUnits.reduce((sum: number, u: any) => sum + parseFloat(u.monthly_rent?.toString() || '0'), 0).toFixed(2)}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
