import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function OutstandingBalancesPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Fetch units with outstanding balances
  // TODO: Integrate with QuickBooks for real balance data
  const mockBalances = [
    {
      id: '1',
      unit: '2061 Forbes St - 1',
      tenant: 'Christina Stuller',
      accountNumber: '00378356',
      pastDueEmail: 'Sent on 01/07/2026',
      balance_0_30: 1738.95,
      balance_31_60: 662.55,
      balance_61_90: 0,
      balance_90_plus: 0,
      total: 2401.50,
    },
    {
      id: '2',
      unit: '2061 Forbes St - 4',
      tenant: 'Alexandra Monique Yelvington',
      accountNumber: '00413078',
      pastDueEmail: 'Sent on 11/07/2025',
      balance_0_30: 1520.00,
      balance_31_60: 0,
      balance_61_90: 0,
      balance_90_plus: 0,
      total: 1520.00,
    },
  ]

  const totals = {
    balance_0_30: 3258.95,
    balance_31_60: 662.55,
    balance_61_90: 0,
    balance_90_plus: 0,
    total: 3921.50,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Outstanding lease balances</h1>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <select className="px-4 py-2 border rounded">
            <option>2061 Forbes St</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>(2) Future, Active</option>
          </select>
          <button className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50">
            Add filter option ▼
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-sm text-gray-600">{mockBalances.length} matches</div>
          <button className="text-sm text-blue-600 hover:underline">📤 Export</button>
        </div>
      </div>

      {/* Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-4 py-3"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lease ▲</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Past Due Email</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">0 - 30 Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">31 - 60 Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">61 - 90 Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">90+ Days</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockBalances.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">+</button>
                  </td>
                  <td className="px-6 py-4">
                    <Link href="#" className="text-blue-600 hover:underline">
                      {item.unit} | {item.tenant}
                    </Link>
                    <div className="text-xs text-gray-500">{item.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.pastDueEmail}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    ${item.balance_0_30.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.balance_31_60 > 0 ? `$${item.balance_31_60.toFixed(2)}` : '--'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.balance_61_90 > 0 ? `$${item.balance_61_90.toFixed(2)}` : '--'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 text-right">
                    {item.balance_90_plus > 0 ? `$${item.balance_90_plus.toFixed(2)}` : '--'}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    ${item.total.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">⋯</button>
                  </td>
                </tr>
              ))}

              {/* Totals Row */}
              <tr className="bg-gray-50 font-semibold">
                <td colSpan={4} className="px-6 py-4 text-sm text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${totals.balance_0_30.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${totals.balance_31_60.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${totals.balance_61_90.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${totals.balance_90_plus.toFixed(2)}</td>
                <td className="px-6 py-4 text-sm text-gray-900 text-right">${totals.total.toFixed(2)}</td>
                <td></td>
              </tr>
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
    </div>
  )
}
