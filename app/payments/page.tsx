import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PaymentsPage() {
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

  // Fetch payment history
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', user.id)
    .order('payment_date', { ascending: false })

  const currentBalance = 0.00 // Placeholder - will integrate with QBO

  const firstName = profile?.full_name?.split(' ')[0] || 'Tenant'

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation - Same as Dashboard */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <div className="text-center">
            <div className="text-xl font-bold text-purple-900 mb-1">dk</div>
            <div className="text-xs font-semibold text-gray-700">DK LIVING</div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </Link>

          <Link href="/payments" className="flex items-center gap-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-medium">Payments</span>
          </Link>

          <Link href="/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
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
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-white border-b px-8 py-4">
          <h1 className="text-2xl text-gray-800">Payments</h1>
        </header>

        {/* Content */}
        <div className="p-8 flex gap-6">
          {/* Left: Payment History */}
          <div className="flex-1 bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">History</h2>
              <button className="text-sm text-green-600 hover:text-green-700">Email statement</button>
            </div>

            {payments && payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Memo</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment, index) => (
                      <tr key={payment.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(payment.payment_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">{payment.notes || 'Rent payment'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          ${parseFloat(payment.amount.toString()).toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900 text-right">
                          $0.00
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1">No payments</p>
                <p className="text-gray-500 text-sm">A history of all transactions on your account will display here.</p>
              </div>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="w-96 space-y-6">
            {/* Current Balance */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Current balance</h3>
              <p className="text-4xl font-bold text-gray-900 mb-4">${currentBalance.toFixed(2)}</p>
              <Link href="/payments/pay" className="block w-full text-center py-3 px-4 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors mb-2">
                Make payment
              </Link>
              <button className="w-full text-center py-2 text-gray-600 hover:text-gray-900 text-sm">
                Set up autopay
              </button>
            </div>

            {/* Tillable Ad */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="text-sm font-medium mb-2">tillable</div>
              <h3 className="text-xl font-bold mb-2">Pay rent in <span className="italic">installments</span></h3>
              <p className="text-green-100 text-sm mb-4">Your landlord gets paid in full</p>
              <div className="flex gap-2 mb-4">
                <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">2</button>
                <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">3</button>
                <button className="px-4 py-2 bg-white rounded-lg text-green-600 font-semibold">4</button>
              </div>
              <button className="px-6 py-2 bg-white text-green-600 rounded-full font-medium hover:bg-green-50 text-sm">
                View options →
              </button>
              <p className="text-xs text-green-100 mt-4 underline cursor-pointer">Learn more</p>
            </div>

            {/* Lease Information */}
            {unit && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease information</h3>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500">Account number</p>
                    <p className="text-gray-900 font-medium">{unit.id.slice(0, 8)}</p>
                  </div>

                  <div>
                    <p className="text-gray-500">Address</p>
                    <p className="text-gray-900">{unit.properties?.name} - {unit.unit_number}</p>
                    <p className="text-gray-600 text-xs">{unit.properties?.address}</p>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Start date</p>
                      <p className="text-gray-900">{unit.lease_start_date ? new Date(unit.lease_start_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">End date</p>
                      <p className="text-gray-900">{unit.lease_end_date ? new Date(unit.lease_end_date).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-gray-500">Rent</p>
                      <p className="text-gray-900">${parseFloat(unit.monthly_rent?.toString() || '0').toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Prepayments</p>
                      <p className="text-gray-900">$0.00</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-500">Deposits</p>
                    <p className="text-gray-900">$0.00</p>
                  </div>
                </div>
              </div>
            )}

            {/* Late Fee Policy */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Late fee policy</h3>
              <p className="text-sm text-gray-600">
                Payment is due on the 1st of the month. If payment isn't received, a one-time fee of $25.00 will be charged on the 7th of each month.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
