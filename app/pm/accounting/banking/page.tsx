import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BankingPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Mock bank account data
  const accounts = [
    { id: '1', name: '126 10th Ave N LLC - NOT', accountNumber: '****2317', epayEnabled: true, balance: 0.00 },
    { id: '2', name: '130 10th Ave N LLC', note: 'TOTS on QBO', accountNumber: '****1173', epayEnabled: true, balance: 95668.16 },
    { id: '3', name: '1301 2nd St N LCC (Correct) - NOT', note: 'TOTS on QBO', accountNumber: '****5981', epayEnabled: true, balance: 5760.00 },
    { id: '4', name: '1301 2nd St N LCC - NOT', accountNumber: '****7075', epayEnabled: true, balance: 4788.11 },
    { id: '5', name: '136 7th Ave S', note: 'WFFF on QBO', accountNumber: '****2108', epayEnabled: true, balance: 19000.00 },
    { id: '6', name: '150 13th Ave N', note: 'WFFF on QBO', accountNumber: '****1012', epayEnabled: true, balance: 74253.94 },
    { id: '7', name: '150 13th Ave N - New', accountNumber: '****2358', epayEnabled: true, balance: 3707.64 },
    { id: '8', name: '1676 Westwind Dr - NOT', note: 'USAA Checking - Zuzich', accountNumber: '****8495', epayEnabled: false, balance: 0.00 },
    { id: '9', name: '1700 Main - NOT', accountNumber: '****2029', epayEnabled: true, balance: 18550.00 },
    { id: '10', name: '200 Cherry St', accountNumber: '****9687', epayEnabled: false, balance: 0.00 },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Accounting Menu */}
      <aside className="w-64 bg-white shadow-sm border-r">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Accounting</h2>
          <nav className="space-y-1">
            <Link href="/pm/accounting/financials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Financials
            </Link>
            <Link href="/pm/accounting/general-ledger" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              General ledger
            </Link>
            <Link href="/pm/accounting/banking" className="block px-3 py-2 text-gray-700 bg-blue-50 border-l-4 border-blue-500 rounded">
              Banking
            </Link>
            <Link href="/pm/accounting/bills" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Bills
            </Link>
            <Link href="/pm/accounting/recurring-transactions" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Recurring transactions
            </Link>
            <Link href="/pm/accounting/eft-approvals" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              EFT approvals
            </Link>
            <Link href="/pm/accounting/budgets" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Budgets
            </Link>
            <Link href="/pm/accounting/chart-of-accounts" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Chart of accounts
            </Link>
            <Link href="/pm/accounting/company-financials" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              Company financials
            </Link>
            <Link href="/pm/accounting/1099-tax-filings" className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded">
              1099 tax filings
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4">
          <h1 className="text-2xl font-semibold text-blue-600">Banking</h1>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b px-8">
          <div className="flex gap-6">
            <button className="pb-3 border-b-2 border-blue-500 text-blue-600 font-medium">
              Bank accounts
            </button>
            <button className="pb-3 text-gray-600 hover:text-gray-900">
              Credit cards
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white border-b px-8 py-4 flex justify-between items-center">
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add bank account
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Print checks
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Manage fees
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white border-b px-8 py-4">
          <div className="flex gap-3">
            <select className="px-4 py-2 border rounded">
              <option>All accounts</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Apply filter
            </button>
            <button className="ml-auto text-sm text-blue-600 hover:underline">
              📤 Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="p-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    <button className="flex items-center gap-1 hover:text-gray-700">
                      Account Number
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    EPay Enabled
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/pm/accounting/banking/${account.id}`} className="text-blue-600 hover:underline">
                        {account.name}
                      </Link>
                      {account.note && (
                        <div className="text-xs text-gray-500 italic">{account.note}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">{account.accountNumber}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {account.epayEnabled && (
                        <svg className="w-5 h-5 text-green-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                      ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4">
                      <button className="text-gray-400 hover:text-gray-600">⋯</button>
                    </td>
                  </tr>
                ))}
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
      </main>
    </div>
  )
}
