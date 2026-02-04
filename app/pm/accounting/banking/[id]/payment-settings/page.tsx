import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BankAccountPaymentSettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  const mockAccount = {
    id: '1',
    name: '2061 Forbes LLC',
    accountNumber: '****5166',
    accountType: 'Checking',
    merchantId: '294550',
  }

  const serviceFees = {
    incomingACH: 2.35,
    outgoingACH: 0.50,
    creditDebitCards: 2.99,
  }

  const paymentLimits = {
    perDeposit: 9000,
    perMonth: 50000,
    remainingThisMonth: 44512.50,
    perWithdrawal: 15000,
    monthWithdrawal: 20000,
  }

  const holdDays = {
    incomingPayments: 1,
    outgoingPayments: 1,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-blue-600">{mockAccount.name}</h1>
            <p className="text-sm text-gray-500">
              {mockAccount.accountNumber} {mockAccount.accountType}
              <Link href="#" className="ml-2 text-blue-600 hover:underline">Edit</Link>
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-red-400 text-red-600 rounded hover:bg-red-50">
              Inactivate account
            </button>
            <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">⟨</button>
            <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">☰</button>
            <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">⟩</button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b px-8">
        <div className="flex gap-6">
          <Link href={`/pm/accounting/banking/[id]`} className="pb-3  text-gray-600 hover:text-gray-900">
            Transactions
          </Link>
          <button className="pb-3 text-gray-600 hover:text-gray-900">
            Balance breakdown
          </button>
          <button className="pb-3 border-b-2 border-blue-500 text-blue-600 font-medium">
            Payment settings
          </button>
        </div>
      </div>

      {/* Payment settings content */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Payment Settings</h2>
            
            <div className="text-sm text-gray-600">Manage everything ePay — from hold days to fees. Make online payments work for your business.</div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L12 2.904l-7.732 14.096c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-yellow-800">
                  Action Required! Owners can't pay online until that functionality is enabled below via "Enable ePay".
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {/* Merchant ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Bank account</label>
                <p className="mt-1 text-sm text-gray-500">Merchant ID: {mockAccount.merchantId}</p>
              </div>

              {/* Resident Payments */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Resident payments</h3>
                  <button className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">ENABLED</button>
                </div>
                <p className="text-sm text-gray-500">Residents are able to pay online through the Resident Center. <Link href="#" className="text-blue-600 hover:underline">Learn more</Link></p>

                <div className="mt-2">
                  <table className="min-w-full">
                    <thead>
                      <tr>
                        <th className="text-left text-sm font-medium text-gray-500">Payment Method</th>
                        <th className="text-left text-sm font-medium text-gray-500">Properties Enabled</th>
                        <th className="text-left text-sm font-medium text-gray-500">Fee</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-2">EFT (ACH)</td>
                        <td className="py-2">1/1 properties enabled</td>
                        <td className="py-2">$2.50 per transaction</td>
                        <td>
                          <button className="text-blue-600 hover:underline">Edit</button>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2">Credit and debit cards</td>
                        <td className="py-2">1/1 properties enabled</td>
                        <td className="py-2">2.99% per transaction</td>
                        <td>
                          <button className="text-blue-600 hover:underline">Edit</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Service Fees */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Service fees <span className="text-gray-500">(what you pay us)</span></h3>
                <div className="space-y-1">
                  <p className="text-gray-700">Incoming ACH: ${serviceFees.incomingACH.toFixed(2)} per transaction</p>
                  <p className="text-gray-700">Outgoing ACH: ${serviceFees.outgoingACH.toFixed(2)} per transaction</p>
                  <p className="text-gray-700">Credit and debit cards: {serviceFees.creditDebitCards}% per transaction</p>
                </div>
              </div>

              {/* Owner Contributions */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Owner contributions</h3>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">OFF</button>
                </div>
                <p className="text-sm text-gray-500">Rental owners are able to send funds through the Owner Portal. <Link href="#" className="text-blue-600 hover:underline">Learn more</Link></p>
                <button className="px-4 py-2 border border-green-500 text-green-600 rounded hover:bg-green-50 mt-2">
                  Enable ePay
                </button>
              </div>

              {/* Payment Limits */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Incoming payment limits</h3>
                <div className="space-y-1">
                  <p className="text-gray-700">Per deposit: ${paymentLimits.perDeposit.toFixed(2)} <Link href="#" className="text-blue-600 hover:underline">Request change</Link></p>
                  <p className="text-gray-700">Per month: ${paymentLimits.perMonth.toFixed(2)}</p>
                  <p className="text-gray-700">Remaining for this month: ${paymentLimits.remainingThisMonth.toFixed(2)}</p>
                </div>
              </div>

              {/* Outgoing Payments */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Outgoing payments</h3>
                  <button className="px-2 py-1 bg-green-500 text-white rounded-full text-xs">ENABLED</button>
                </div>
                <p className="text-sm text-gray-500">Make outgoing payments to owners. <Link href="#" className="text-blue-600 hover:underline">Learn more</Link></p>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">Vendor payments</h3>
                  <button className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">OFF</button>
                </div>
                <p className="text-sm text-gray-500">Make outgoing payments to vendors. <Link href="#" className="text-blue-600 hover:underline">Learn more</Link></p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 mt-2">Apply</button>
              </div>

              {/* Outgoing Payment Limits */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Outgoing payment limits</h3>
                <div className="space-y-1">
                  <p className="text-gray-700">Per withdrawal: ${paymentLimits.perWithdrawal.toFixed(2)} <Link href="#" className="text-blue-600 hover:underline">Request change</Link></p>
                  <p className="text-gray-700">Per month: ${paymentLimits.monthWithdrawal.toFixed(2)}</p>
                  <p className="text-gray-700">Remaining for this month: ${paymentLimits.monthWithdrawal.toFixed(2)}</p>
                </div>
              </div>

              {/* Hold Days */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Hold days</h3>
                <div className="space-y-1">
                  <p className="text-gray-700">Incoming payments: {holdDays.incomingPayments} day hold <Link href="#" className="text-blue-600 hover:underline">Request change</Link></p>
                  <p className="text-gray-700">Outgoing payments: {holdDays.outgoingPayments} day hold</p>
                </div>
              </div>
            </div>
          </div>
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
