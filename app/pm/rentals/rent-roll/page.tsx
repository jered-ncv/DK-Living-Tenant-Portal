import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PMLayout from '@/components/pm/PMLayout'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function RentRollPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Fetch units with tenant info (active properties only for PM dashboard)
  const { data: units } = await supabase
    .from('units')
    .select(`
      *,
      properties!inner (name, address, is_active),
      profiles (full_name, email)
    `)
    .eq('properties.is_active', true)
    .order('unit_number')

  return (
    <PMLayout profileName={profile.full_name || 'Manager'}>
      <header className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Rent roll</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">Add lease</button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">Renew lease</button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">Receive payment</button>
            <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 text-sm">⋯</button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b px-4 md:px-8 py-3">
        <div className="flex gap-4 overflow-x-auto">
          <button className="pb-2 border-b-2 border-green-500 text-green-600 font-medium text-sm whitespace-nowrap">Rent roll</button>
          <button className="pb-2 text-gray-600 hover:text-gray-900 text-sm whitespace-nowrap">Liability management</button>
        </div>
      </div>

      <div className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <select className="px-4 py-2 border rounded text-sm">
            <option>All properties</option>
          </select>
          <select className="px-4 py-2 border rounded text-sm">
            <option>(2) Active, Future</option>
          </select>
          <button className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50 text-sm">Add filter option ▼</button>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-xs md:text-sm text-gray-600">{units?.length || 0} matches</div>
          <button className="text-xs md:text-sm text-blue-600 hover:underline">📤 Export</button>
        </div>
      </div>

      <div className="p-4 md:p-8">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lease ▲</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days Left</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {units?.map((unit) => {
                const isActive = unit.tenant_id !== null
                const daysLeft = unit.lease_end_date 
                  ? Math.floor((new Date(unit.lease_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null
                
                return (
                  <tr key={unit.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href="#" className="text-blue-600 hover:underline">
                        {unit.properties?.name} - {unit.unit_number} | {unit.profiles?.full_name || 'Vacant'}
                      </Link>
                      <div className="text-xs text-gray-500">{unit.id.slice(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {isActive ? 'Active' : 'Future'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      Fixed
                      <div className="text-xs text-gray-500">
                        {unit.lease_start_date && unit.lease_end_date
                          ? `${new Date(unit.lease_start_date).toLocaleDateString()} - ${new Date(unit.lease_end_date).toLocaleDateString()}`
                          : '—'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {daysLeft !== null && daysLeft > 0 && (
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          daysLeft < 90 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {daysLeft} DAYS
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">
                      ${parseFloat(unit.monthly_rent?.toString() || '0').toFixed(2)}
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

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {units?.map((unit) => {
            const isActive = unit.tenant_id !== null
            const daysLeft = unit.lease_end_date 
              ? Math.floor((new Date(unit.lease_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null
            
            return (
              <div key={unit.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <Link href="#" className="text-blue-600 hover:underline font-medium flex-1">
                    {unit.properties?.name} - {unit.unit_number}
                  </Link>
                  <button className="text-gray-400 hover:text-gray-600 ml-2">⋯</button>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Tenant: </span>
                    <span className="text-gray-900">{unit.profiles?.full_name || 'Vacant'}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Status: </span>
                    <span className={`px-2 py-1 rounded text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {isActive ? 'Active' : 'Future'}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-gray-900">Fixed</span>
                  </div>
                  
                  {unit.lease_start_date && unit.lease_end_date && (
                    <div>
                      <span className="text-gray-500">Dates: </span>
                      <span className="text-gray-900 text-xs">
                        {new Date(unit.lease_start_date).toLocaleDateString()} - {new Date(unit.lease_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  {daysLeft !== null && daysLeft > 0 && (
                    <div>
                      <span className="text-gray-500">Days left: </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        daysLeft < 90 ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {daysLeft} DAYS
                      </span>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-gray-500">Rent: </span>
                    <span className="text-gray-900 font-medium">
                      ${parseFloat(unit.monthly_rent?.toString() || '0').toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <Link href="/pm/dashboard" className="text-xs md:text-sm text-blue-600 hover:underline">← Back to Dashboard</Link>
        </div>
      </div>
    </PMLayout>
  )
}
