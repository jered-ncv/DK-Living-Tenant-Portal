import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PMLayout from '@/components/pm/PMLayout'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PMDashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has PM/admin role
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // TEMPORARY DEBUG: Comment out redirect to see what's happening
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) {
    return (
      <div className="p-4 md:p-8">
        <h1 className="text-xl md:text-2xl font-bold mb-4">Debug: Access Denied</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs md:text-sm">
          {JSON.stringify({ 
            userId: user.id, 
            profile, 
            profileError,
            hasRole: profile?.role,
            isAdmin: profile?.role === 'admin',
            isPM: profile?.role === 'pm'
          }, null, 2)}
        </pre>
      </div>
    )
  }

  // Fetch dashboard data (active properties only)
  const { data: properties } = await supabase
    .from('properties')
    .select('*, units(*)')
    .eq('is_active', true)

  const { data: units } = await supabase
    .from('units')
    .select('*, properties!inner(is_active)')
    .eq('properties.is_active', true)

  const { data: maintenanceRequests } = await supabase
    .from('maintenance_requests')
    .select('*')
    .in('status', ['submitted', 'assigned', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Calculate stats
  const totalUnits = units?.length || 0
  const occupiedUnits = units?.filter(u => u.tenant_id).length || 0
  const vacantUnits = totalUnits - occupiedUnits
  const outstandingBalance = 15954.00 // Placeholder - will integrate with QBO

  return (
    <PMLayout profileName={profile.full_name || 'Manager'}>
      {/* Top Bar */}
      <header className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <h1 className="text-xl md:text-2xl text-gray-800">
            Good afternoon, {profile.full_name?.split(' ')[0]}!
          </h1>
          <button className="text-xs md:text-sm text-gray-600 hover:text-gray-900 text-left md:text-right">
            ⚙️ Customize dashboard
          </button>
        </div>
      </header>

      {/* Dashboard Grid - Responsive: 1 col on mobile, 2 on tablet, 3 on desktop */}
      <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Outstanding Balances - Rentals */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Outstanding Balances - Rentals</h2>
          <div className="mb-4">
            <div className="text-xs md:text-sm text-gray-600">Outstanding balances</div>
            <div className="text-2xl md:text-3xl font-bold text-gray-900">${outstandingBalance.toFixed(2)}</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs md:text-sm">
              <a href="#" className="text-blue-600 hover:underline truncate mr-2">830 Lasalle Street - 838-2</a>
              <span className="text-gray-900 whitespace-nowrap">$6,627.50</span>
            </div>
            <div className="flex justify-between items-center text-xs md:text-sm">
              <a href="#" className="text-blue-600 hover:underline truncate mr-2">2061 Forbes St - 1</a>
              <span className="text-gray-900 whitespace-nowrap">$2,401.50</span>
            </div>
          </div>
          <Link href="/pm/rentals/outstanding-balances" className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Tasks</h2>
            <button className="text-gray-400 hover:text-gray-600">⋯</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-1 bg-green-500 text-white rounded-full text-xs md:text-sm whitespace-nowrap">
              Incoming requests
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm whitespace-nowrap">
              Assigned to me
            </button>
          </div>
          {maintenanceRequests && maintenanceRequests.length > 0 ? (
            <div className="space-y-3">
              {maintenanceRequests.slice(0, 1).map((req) => (
                <div key={req.id} className="border-b pb-2">
                  <a href="#" className="text-sm md:text-base text-blue-600 hover:underline font-medium">{req.title}</a>
                  <div className="text-xs text-gray-500 mt-1">3 days ago | Resident request | 2735 Riverside Avenue - 3</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs md:text-sm text-gray-500">No incoming requests</p>
          )}
          <Link href="/pm/tasks" className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Rental Listings */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Rental Listings</h2>
          <div className="flex items-center justify-between">
            <div className="relative w-24 h-24 md:w-32 md:h-32">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#e5e7eb" strokeWidth="12" className="md:hidden"/>
                <circle cx="48" cy="48" r="40" fill="none" stroke="#ef4444" strokeWidth="12" 
                  strokeDasharray={`${(vacantUnits / totalUnits) * 251} 251`} className="md:hidden"/>
                <circle cx="48" cy="48" r="40" fill="none" stroke="#22c55e" strokeWidth="12" 
                  strokeDasharray={`${(occupiedUnits / totalUnits) * 251} 251`}
                  strokeDashoffset={`-${(vacantUnits / totalUnits) * 251}`} className="md:hidden"/>
                
                <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="16" className="hidden md:block"/>
                <circle cx="64" cy="64" r="56" fill="none" stroke="#ef4444" strokeWidth="16" 
                  strokeDasharray={`${(vacantUnits / totalUnits) * 352} 352`} className="hidden md:block"/>
                <circle cx="64" cy="64" r="56" fill="none" stroke="#22c55e" strokeWidth="16" 
                  strokeDasharray={`${(occupiedUnits / totalUnits) * 352} 352`}
                  strokeDashoffset={`-${(vacantUnits / totalUnits) * 352}`} className="hidden md:block"/>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl md:text-2xl font-bold">{totalUnits}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
            </div>
            <div className="space-y-2 text-xs md:text-sm">
              <div>
                <div className="font-semibold">Vacant Units</div>
                <div className="text-gray-600">{vacantUnits} unlisted</div>
              </div>
              <div>
                <div className="font-semibold">Occupied Units</div>
                <div className="text-gray-600">{occupiedUnits} unlisted</div>
              </div>
            </div>
          </div>
          <Link href="/pm/rentals/properties" className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Overdue Tasks */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Overdue Tasks</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            <button className="px-3 py-1 bg-green-500 text-white rounded-full text-xs md:text-sm whitespace-nowrap">
              My overdue tasks
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs md:text-sm whitespace-nowrap">
              All overdue tasks
            </button>
          </div>
          <div className="text-center py-8">
            <p className="text-xs md:text-sm text-gray-500 italic">There are no overdue tasks assigned to you.</p>
          </div>
        </div>

        {/* Expiring Leases */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Expiring Leases</h2>
          <div className="flex gap-2 mb-4 text-xs flex-wrap">
            <button className="px-2 py-1 bg-green-500 text-white rounded whitespace-nowrap">0 - 30 days</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">31 - 60 days</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">61 - 90 days</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">All</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">Not started</span>
              <div className="flex-1 h-4 bg-gray-200 rounded"></div>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">Others</span>
              <div className="flex-1 h-4 bg-purple-400 rounded"></div>
              <span className="text-sm font-semibold">1</span>
            </div>
          </div>
          <div className="text-center mt-4 text-xs md:text-sm font-semibold">2 leases</div>
          <Link href="/pm/leasing/lease-management" className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Rental Applications */}
        <div className="bg-white rounded-lg shadow p-4 md:p-6">
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Rental Applications</h2>
          <div className="flex gap-2 mb-4 text-xs flex-wrap">
            <button className="px-2 py-1 bg-green-500 text-white rounded whitespace-nowrap">Active applicants</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">New</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">Undecided</button>
            <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded whitespace-nowrap">Approved</button>
          </div>
          <div className="mb-4">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active applicants with updates (past 30 days)</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">New applicants</span>
              <span className="text-sm font-semibold">0</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-blue-600">Application stage</span>
              <div className="flex-1 h-4 bg-green-400 rounded"></div>
              <span className="text-sm font-semibold">8</span>
            </div>
          </div>
          <Link href="/pm/leasing/applicants" className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block">
            View all →
          </Link>
        </div>

        {/* Recent Activity (full width on all screens) */}
        <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 mb-4">
            <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Activity</h2>
            <select className="text-xs md:text-sm border rounded px-2 py-1">
              <option>Last 7 days — 1/28 - 2/3</option>
            </select>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3 border-b pb-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                E
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm md:text-base">Email</div>
                <div className="text-xs md:text-sm text-gray-600">
                  Welcome to your new Resident Center with Nomad Hospitality LLC / DK Living Property Management LLC! sent to Jered DaCosta
                </div>
                <div className="text-xs text-gray-500 mt-1">Completed by Jered DaCosta</div>
              </div>
              <div className="text-xs text-gray-500 whitespace-nowrap">Today — 2/3</div>
            </div>
          </div>
          <button className="mt-4 text-xs md:text-sm text-blue-600 hover:underline">+ Compose email</button>
        </div>
      </div>
    </PMLayout>
  )
}
