import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's unit
  const { data: unit } = await supabase
    .from('units')
    .select(`
      *,
      properties (
        name,
        address
      )
    `)
    .eq('tenant_id', user.id)
    .single()

  // Fetch open maintenance requests
  const { data: openRequests } = await supabase
    .from('maintenance_requests')
    .select('*')
    .eq('tenant_id', user.id)
    .in('status', ['submitted', 'assigned', 'in_progress'])
    .order('created_at', { ascending: false })

  // Fetch recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .or(`property_id.eq.${unit?.property_id},property_id.is.null`)
    .order('created_at', { ascending: false })
    .limit(3)

  // Calculate balance (placeholder - will integrate with QBO)
  const currentBalance = 0.00

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-900 mb-1">dk</div>
            <div className="text-xs font-semibold text-gray-700">DK LIVING</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </Link>

          <Link href="/payments" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-medium">Payments</span>
          </Link>

          <Link href="/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">Requests</span>
          </Link>

          <Link href="/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="font-medium">Announcements</span>
          </Link>

          <Link href="/documents" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Documents</span>
          </Link>

          <Link href="/contacts" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">Contacts</span>
          </Link>

          {profile?.role && ['pm', 'admin'].includes(profile.role) && (
            <div className="pt-4 mt-4 border-t">
              <Link href="/pm/dashboard" className="flex items-center gap-3 px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">PM Portal</span>
              </Link>
            </div>
          )}
        </nav>

        {/* Sign Out */}
        <div className="p-4 border-t">
          <form action={handleSignOut}>
            <button type="submit" className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl text-gray-800">Hello, {firstName}!</h1>
          <div className="flex items-center gap-3">
            {unit && (
              <div className="text-right text-sm">
                <div className="font-medium text-gray-900">{unit.properties?.name} - {unit.unit_number}</div>
                <div className="text-gray-500">{unit.properties?.address}</div>
              </div>
            )}
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold">
              {firstName[0]}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Balance Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-600 mb-1">Your current balance is</p>
                <p className="text-4xl font-bold text-gray-900">${currentBalance.toFixed(2)}</p>
              </div>
              <div className="space-x-3">
                <Link href="/payments" className="inline-block px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                  Make payment
                </Link>
                <button className="px-6 py-2 text-gray-600 hover:text-gray-900">
                  Set up autopay
                </button>
              </div>
            </div>
          </div>

          {/* Rent Reporting Banner */}
          <div className="bg-gray-800 rounded-lg p-4 flex justify-between items-center">
            <div>
              <p className="text-white font-medium">Rent Reporting</p>
              <p className="text-gray-300 text-sm">Build better credit by having monthly rent payments automatically reported to the credit bureaus.</p>
            </div>
            <button className="px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100">
              Get started
            </button>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Open Requests */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Open requests</h2>
              
              {openRequests && openRequests.length > 0 ? (
                <div className="space-y-3">
                  {openRequests.map((request) => (
                    <div key={request.id} className="border-b pb-3">
                      <p className="font-medium text-gray-900">{request.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Status: {request.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">How can we help you?</p>
                  <p className="text-gray-500 text-sm mb-4">Your open requests will display here.</p>
                  <Link href="/maintenance/new" className="inline-block px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                    Create request
                  </Link>
                </div>
              )}
            </div>

            {/* Installments Ad (Placeholder) */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-6 text-white">
              <div className="text-sm font-medium mb-2">tillable</div>
              <h3 className="text-2xl font-bold mb-2">Pay rent in <span className="italic">installments</span></h3>
              <p className="text-green-100 text-sm mb-4">Your landlord gets paid in full</p>
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30">2</button>
                <button className="px-4 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30">3</button>
                <button className="px-4 py-2 bg-white rounded-lg text-green-600 font-semibold">4</button>
              </div>
              <button className="px-6 py-2 bg-white text-green-600 rounded-full font-medium hover:bg-green-50 flex items-center gap-2">
                View options →
              </button>
            </div>

            {/* New Announcements */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">New announcements</h2>
              
              {announcements && announcements.length > 0 ? (
                <div className="space-y-3">
                  {announcements.map((announcement) => (
                    <div key={announcement.id} className="border-b pb-3">
                      <p className="font-medium text-gray-900">{announcement.title}</p>
                      <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <p className="text-gray-900 font-medium mb-1">You're all caught up!</p>
                  <p className="text-gray-500 text-sm">New announcements will display here.</p>
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming events</h2>
              
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1">No upcoming events</p>
                <p className="text-gray-500 text-sm mb-4">Your community events will display here.</p>
                <button className="px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors">
                  Go to community calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
