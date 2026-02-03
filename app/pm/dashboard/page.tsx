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

  // Check if user has PM role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['pm', 'admin'].includes(profile.role)) {
    redirect('/dashboard') // Redirect to tenant dashboard if not PM
  }

  // Fetch portfolio statistics
  const { data: allUnits } = await supabase
    .from('units')
    .select('*, properties(name)')

  const totalUnits = allUnits?.length || 0
  const rentedUnits = allUnits?.filter(u => u.tenant_id)?.length || 0
  const vacantUnits = totalUnits - rentedUnits

  // Fetch outstanding balances
  const { data: outstandingPayments } = await supabase
    .from('payments')
    .select('amount, status, tenant_id, profiles(full_name)')
    .eq('status', 'pending')

  const totalOutstanding = outstandingPayments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0

  // Fetch open maintenance requests
  const { data: openRequests } = await supabase
    .from('maintenance_requests')
    .select('*, units(unit_number, properties(name)), profiles(full_name)')
    .in('status', ['submitted', 'assigned', 'in_progress'])
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch recent messages
  const { data: recentMessages } = await supabase
    .from('messages')
    .select('*, sender:profiles!messages_sender_id_fkey(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Property Manager Dashboard</h1>
            <nav className="flex gap-4 text-sm">
              <Link href="/pm/dashboard" className="text-blue-600 font-semibold">Dashboard</Link>
              <Link href="/pm/rent-roll" className="text-gray-600 hover:text-blue-600">Rent Roll</Link>
              <Link href="/pm/financials" className="text-gray-600 hover:text-blue-600">Financials</Link>
              <Link href="/pm/tenants" className="text-gray-600 hover:text-blue-600">Tenants</Link>
              <Link href="/pm/properties" className="text-gray-600 hover:text-blue-600">Properties</Link>
              <Link href="/dashboard" className="text-gray-600 hover:text-blue-600">Tenant View</Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Units</div>
            <div className="text-3xl font-bold text-gray-900">{totalUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Rented</div>
            <div className="text-3xl font-bold text-green-600">{rentedUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Vacant</div>
            <div className="text-3xl font-bold text-orange-600">{vacantUnits}</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500 mb-1">Outstanding Balance</div>
            <div className="text-3xl font-bold text-red-600">${totalOutstanding.toFixed(2)}</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Open Maintenance Requests */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Open Maintenance Requests</h2>
              <span className="text-sm text-gray-500">{openRequests?.length || 0} active</span>
            </div>
            
            {openRequests && openRequests.length > 0 ? (
              <div className="space-y-3">
                {openRequests.map((request) => (
                  <div key={request.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">{request.title}</p>
                        <p className="text-sm text-gray-600">
                          {request.units?.properties?.name} - Unit {request.units?.unit_number}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {request.profiles?.full_name} • {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                        request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {request.urgency}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No open requests</p>
            )}
          </div>

          {/* Outstanding Balances */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Outstanding Balances</h2>
              <span className="text-sm text-gray-500">{outstandingPayments?.length || 0} pending</span>
            </div>
            
            {outstandingPayments && outstandingPayments.length > 0 ? (
              <div className="space-y-3">
                {outstandingPayments.map((payment: any) => (
                  <div key={payment.tenant_id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-gray-900">{payment.profiles?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">Pending payment</p>
                    </div>
                    <span className="text-lg font-semibold text-red-600">
                      ${parseFloat(payment.amount.toString()).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">All payments current</p>
            )}
          </div>

          {/* Recent Messages */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Recent Messages</h2>
            </div>
            
            {recentMessages && recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((message: any) => (
                  <div key={message.id} className="py-2 border-b last:border-b-0">
                    <p className="text-sm font-medium text-gray-900">{message.subject || 'No subject'}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{message.body}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {message.sender?.full_name} • {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent messages</p>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link 
                href="/pm/rent-roll" 
                className="block w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-blue-900">Download Rent Roll</span>
                <p className="text-sm text-blue-700 mt-1">Export current rent roll to CSV</p>
              </Link>
              
              <Link 
                href="/pm/financials" 
                className="block w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-green-900">View P&L Reports</span>
                <p className="text-sm text-green-700 mt-1">Financial reports by property</p>
              </Link>
              
              <Link 
                href="/pm/tenants" 
                className="block w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
              >
                <span className="font-medium text-purple-900">Manage Tenants</span>
                <p className="text-sm text-purple-700 mt-1">View all tenant details</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
