import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

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
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Debug: Access Denied</h1>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
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
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-56 bg-slate-800 text-white flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-slate-800 font-bold text-sm">B</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Buildium</div>
              <div className="text-xs text-slate-400">PM Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <Link href="/pm/dashboard" className="flex items-center gap-3 px-4 py-2 bg-slate-700 text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-sm">Dashboard</span>
          </Link>

          <Link href="/pm/rentals/properties" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-sm">Rentals</span>
          </Link>

          <Link href="/pm/leasing/applicants" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm">Leasing</span>
          </Link>

          <Link href="/pm/accounting" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Accounting</span>
          </Link>

          <Link href="/pm/tasks" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span className="text-sm">Tasks</span>
          </Link>

          <Link href="/pm/communication" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Communication</span>
          </Link>

          <Link href="/pm/reports" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-700 text-slate-300 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm">Reports</span>
          </Link>
        </nav>

        {/* Back to Tenant Portal */}
        <div className="p-4 border-t border-slate-700">
          <Link href="/dashboard" className="text-xs text-slate-400 hover:text-white">
            ← Back to Tenant Portal
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b px-8 py-4">
          <h1 className="text-2xl text-gray-800">Good afternoon, {profile.full_name?.split(' ')[0]}!</h1>
          <button className="absolute top-4 right-8 text-sm text-gray-600 hover:text-gray-900">
            ⚙️ Customize dashboard
          </button>
        </header>

        {/* Dashboard Grid */}
        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Row 1 */}
          {/* Outstanding Balances - Rentals */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Outstanding Balances - Rentals</h2>
            <div className="mb-4">
              <div className="text-sm text-gray-600">Outstanding balances</div>
              <div className="text-3xl font-bold text-gray-900">${outstandingBalance.toFixed(2)}</div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <a href="#" className="text-blue-600 hover:underline">830 Lasalle Street - 838-2</a>
                <span className="text-gray-900">$6,627.50</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <a href="#" className="text-blue-600 hover:underline">2061 Forbes St - 1</a>
                <span className="text-gray-900">$2,401.50</span>
              </div>
            </div>
            <a href="/pm/rentals/outstanding-balances" className="text-sm text-blue-600 hover:underline mt-4 inline-block">View all →</a>
          </div>

          {/* Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tasks</h2>
              <button className="text-gray-400 hover:text-gray-600">⋯</button>
            </div>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">Incoming requests</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">Assigned to me</button>
            </div>
            {maintenanceRequests && maintenanceRequests.length > 0 ? (
              <div className="space-y-3">
                {maintenanceRequests.slice(0, 1).map((req) => (
                  <div key={req.id} className="border-b pb-2">
                    <a href="#" className="text-blue-600 hover:underline font-medium">{req.title}</a>
                    <div className="text-xs text-gray-500">3 days ago | Resident request | 2735 Riverside Avenue - 3</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No incoming requests</p>
            )}
            <a href="/pm/tasks" className="text-sm text-blue-600 hover:underline mt-4 inline-block">View all →</a>
          </div>

          {/* Rental Listings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Listings</h2>
            <div className="flex items-center justify-between">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#e5e7eb" strokeWidth="16"/>
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#ef4444" strokeWidth="16" 
                    strokeDasharray={`${(vacantUnits / totalUnits) * 352} 352`}/>
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#22c55e" strokeWidth="16" 
                    strokeDasharray={`${(occupiedUnits / totalUnits) * 352} 352`}
                    strokeDashoffset={`-${(vacantUnits / totalUnits) * 352}`}/>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold">{totalUnits}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
              <div className="space-y-2 text-sm">
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
            <a href="/pm/rentals/properties" className="text-sm text-blue-600 hover:underline mt-4 inline-block">View all →</a>
          </div>

          {/* Row 2 */}
          {/* Overdue Tasks */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overdue Tasks</h2>
            <div className="flex gap-2 mb-4">
              <button className="px-3 py-1 bg-green-500 text-white rounded-full text-sm">My overdue tasks</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">All overdue tasks</button>
            </div>
            <div className="text-center py-8">
              <p className="text-sm text-gray-500 italic">There are no overdue tasks assigned to you.</p>
            </div>
          </div>

          {/* Expiring Leases */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Expiring Leases</h2>
            <div className="flex gap-2 mb-4 text-xs flex-wrap">
              <button className="px-2 py-1 bg-green-500 text-white rounded">0 - 30 days</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">31 - 60 days</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">61 - 90 days</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">All</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Expiring Leases</button>
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
            <div className="text-center mt-4 text-sm font-semibold">2 leases</div>
            <a href="/pm/leasing/lease-management" className="text-sm text-blue-600 hover:underline mt-4 inline-block">View all →</a>
          </div>

          {/* Rental Applications */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Applications</h2>
            <div className="flex gap-2 mb-4 text-xs flex-wrap">
              <button className="px-2 py-1 bg-green-500 text-white rounded">Active applicants</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">New</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Undecided</button>
              <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded">Approved</button>
            </div>
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-1">Active applicants with updates (past 30 days)</div>
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
            <a href="/pm/leasing/applicants" className="text-sm text-blue-600 hover:underline mt-4 inline-block">View all →</a>
          </div>

          {/* Row 3 - Recent Activity (full width) */}
          <div className="col-span-3 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              <select className="text-sm border rounded px-2 py-1">
                <option>Last 7 days — 1/28 - 2/3</option>
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 border-b pb-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  E
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Email</div>
                  <div className="text-sm text-gray-600">Welcome to your new Resident Center with Nomad Hospitality LLC / DK Living Property Management LLC! sent to Jered DaCosta</div>
                  <div className="text-xs text-gray-500 mt-1">Completed by Jered DaCosta</div>
                </div>
                <div className="text-xs text-gray-500">Today — 2/3</div>
              </div>
            </div>
            <button className="mt-4 text-sm text-blue-600 hover:underline">+ Compose email</button>
          </div>
        </div>
      </main>
    </div>
  )
}
