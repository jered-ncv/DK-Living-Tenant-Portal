import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface RentRollRow {
  lease_id: string
  unit_id: string
  unit_number: string
  property_address: string
  property_name: string
  tenant_name: string
  tenant_email: string | null
  tenant_phone: string | null
  lease_start: string
  lease_end: string
  monthly_rent: number
  security_deposit: number | null
  days_remaining: number
  balance_due: number
  prepayments: number
}

export default async function RentRollV2Page() {
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
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['pm', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch rent roll data from the view
  const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/rent_roll_view?select=*&order=property_address.asc,unit_number.asc`, {
    headers: {
      'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
    }
  })

  const rentRollData: RentRollRow[] = response.ok ? await response.json() : []

  // Group by property
  const propertiesMap = new Map<string, RentRollRow[]>()
  rentRollData.forEach(row => {
    const propKey = row.property_address
    if (!propertiesMap.has(propKey)) {
      propertiesMap.set(propKey, [])
    }
    propertiesMap.get(propKey)!.push(row)
  })

  // Calculate totals
  const totalMonthlyRent = rentRollData.reduce((sum, row) => sum + row.monthly_rent, 0)
  const totalDeposits = rentRollData.reduce((sum, row) => sum + (row.security_deposit || 0), 0)
  const totalBalances = rentRollData.reduce((sum, row) => sum + row.balance_due, 0)
  const totalPrepayments = rentRollData.reduce((sum, row) => sum + row.prepayments, 0)
  const totalUnits = rentRollData.length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">Rent Roll (Live)</h1>
            <nav className="flex flex-wrap gap-4 text-sm">
              <Link href="/pm/dashboard" className="text-gray-600 hover:text-blue-600">Dashboard</Link>
              <Link href="/pm/rentals/rent-roll-v2" className="text-blue-600 font-semibold">Rent Roll v2</Link>
              <Link href="/pm/rent-roll" className="text-gray-600 hover:text-blue-600">Old Rent Roll</Link>
              <Link href="/pm/rentals/properties" className="text-gray-600 hover:text-blue-600">Properties</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Active Leases</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">{totalUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Monthly Rent</div>
            <div className="text-2xl md:text-3xl font-bold text-green-600">${totalMonthlyRent.toLocaleString()}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Total Deposits</div>
            <div className="text-2xl md:text-3xl font-bold text-blue-600">${totalDeposits.toLocaleString()}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Balance Due</div>
            <div className="text-2xl md:text-3xl font-bold text-red-600">${totalBalances.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Placeholder</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-xs font-medium text-gray-500 mb-1 uppercase">Prepayments</div>
            <div className="text-2xl md:text-3xl font-bold text-purple-600">${totalPrepayments.toLocaleString()}</div>
            <div className="text-xs text-gray-500 mt-1">Placeholder</div>
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
          {Array.from(propertiesMap.entries()).map(([propertyAddress, rows]) => {
            const propTotal = rows.reduce((sum, r) => sum + r.monthly_rent, 0)
            const propDeposits = rows.reduce((sum, r) => sum + (r.security_deposit || 0), 0)
            const propBalances = rows.reduce((sum, r) => sum + r.balance_due, 0)
            
            return (
              <div key={propertyAddress} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold text-gray-900">{rows[0].property_name}</h2>
                  <p className="text-sm text-gray-600">{propertyAddress}</p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tenant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lease Start
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Lease End
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Days Left
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rent
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Deposit
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {rows.map((row) => (
                        <tr key={row.lease_id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <Link 
                              href={`/pm/leasing/lease-management/${row.lease_id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {row.unit_number}
                            </Link>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {row.tenant_name}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {row.tenant_email && (
                              <div>
                                <div className="text-xs">{row.tenant_email}</div>
                                {row.tenant_phone && <div className="text-xs">{row.tenant_phone}</div>}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(row.lease_start).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(row.lease_end).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              row.days_remaining < 30 ? 'text-red-600' :
                              row.days_remaining < 60 ? 'text-orange-600' :
                              'text-gray-600'
                            }`}>
                              {row.days_remaining}
                            </span>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 text-right">
                            ${row.monthly_rent.toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                            ${(row.security_deposit || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                            <span className={row.balance_due > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
                              ${row.balance_due.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Property Summary */}
                <div className="bg-gray-50 px-6 py-3 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Units: </span>
                    <span className="font-semibold text-gray-900">{rows.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rent: </span>
                    <span className="font-semibold text-gray-900">${propTotal.toLocaleString()}/mo</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Deposits: </span>
                    <span className="font-semibold text-gray-900">${propDeposits.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Balances: </span>
                    <span className={`font-semibold ${propBalances > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                      ${propBalances.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Grand Total */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio Totals</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Active Leases</div>
              <div className="text-xl font-bold text-gray-900">{totalUnits}</div>
            </div>
            <div>
              <div className="text-gray-600">Monthly Rent</div>
              <div className="text-xl font-bold text-green-600">${totalMonthlyRent.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Total Deposits</div>
              <div className="text-xl font-bold text-blue-600">${totalDeposits.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Balance Due</div>
              <div className="text-xl font-bold text-red-600">${totalBalances.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-gray-600">Prepayments</div>
              <div className="text-xl font-bold text-purple-600">${totalPrepayments.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
