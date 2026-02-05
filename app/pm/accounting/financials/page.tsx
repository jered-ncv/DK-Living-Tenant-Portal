import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function FinancialsPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // MOCK DATA - REPLACE WITH QBO INTEGRATION
  const income = {
    convenienceFee: 177.30,
    parkingIncome: 150.00,
    petFee: 70.00,
    rentIncome: 16664.75,
    utilityIncome: 422.50,
  }

  const expenses = {
  }

  const totalIncomeDec = Object.values(income).reduce((a, b) => a + b, 0)
  const totalIncomeJan = totalIncomeDec // simplified for mock data
  const totalIncomeFeb = totalIncomeDec / 3 // simplified

  const netOperatingIncomeDec = totalIncomeDec
  const netOperatingIncomeJan = totalIncomeJan
  const netOperatingIncomeFeb = totalIncomeFeb
  const netOperatingIncomeTotal = netOperatingIncomeDec + netOperatingIncomeJan + netOperatingIncomeFeb

  const netIncomeDec = totalIncomeDec
  const netIncomeJan = totalIncomeJan
  const netIncomeFeb = totalIncomeFeb
  const netIncomeTotal = netIncomeDec + netIncomeJan + netIncomeFeb

  const totalIncomeDecStr = totalIncomeDec.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const totalIncomeJanStr = totalIncomeJan.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const totalIncomeFebStr = totalIncomeFeb.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
  const totalIncomeTotal = (totalIncomeDec + totalIncomeJan + totalIncomeFeb).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const getCurrencyString = (num: number) => num.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <h1 className="text-2xl font-semibold text-gray-900">Financials</h1>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex items-center gap-4">
          <select className="px-4 py-2 border rounded">
            <option>2061 Forbes St</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>All (13)</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>Three months to date</option>
          </select>
          <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Search
          </button>
        </div>
        <div className="mt-3 flex items-center">
          <input type="radio" id="cash" name="basis" value="cash" className="mr-2" defaultChecked />
          <label htmlFor="cash" className="mr-4">Cash basis</label>
          <input type="radio" id="accrual" name="basis" value="accrual" className="mr-2" />
          <label htmlFor="accrual">Accrual basis</label>
        </div>
      </div>

      {/* Table */}
      <div className="p-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property or Company Account (Cash Basis)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">December 2025</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">January 2026</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">February 1 to Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total as of 2/4/2026</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              <tr className="bg-gray-100">
                <td className="px-6 py-3 font-semibold flex items-center">
                  - 2061 Forbes St
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                    Expand all rows
                  </button>
                </td>
              </tr>
              
              {/* Income */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3"> Income </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg> Convenience Fee
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.convenienceFee)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.convenienceFee)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.convenienceFee / 3)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.convenienceFee * 2.333)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg> Parking Income
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.parkingIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.parkingIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.parkingIncome / 3)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.parkingIncome * 2.333)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg> Pet Fee
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.petFee)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.petFee)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.petFee / 3)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.petFee * 2.333)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg> Rent Income
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.rentIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.rentIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.rentIncome / 3)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.rentIncome * 2.333)}</td>
                <td></td>
              </tr>

              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg> Utility Income
                </td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.utilityIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.utilityIncome)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.utilityIncome / 3)}</td>
                <td className="px-6 py-3 text-right text-sm text-gray-900">{getCurrencyString(income.utilityIncome * 2.333)}</td>
                <td></td>
              </tr>

              {/* Totals */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">Total Income</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{totalIncomeDecStr}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{totalIncomeJanStr}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{totalIncomeFebStr}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{totalIncomeTotal}</td>
                <td></td>
              </tr>

              {/* Net Operating Income */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">Net Operating Income</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netOperatingIncomeDec)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netOperatingIncomeJan)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netOperatingIncomeFeb)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netOperatingIncomeTotal)}</td>
                <td></td>
              </tr>

              {/* Net Income */}
              <tr className="hover:bg-gray-50">
                <td className="px-6 py-3 font-semibold">Net Income</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netIncomeDec)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netIncomeJan)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netIncomeFeb)}</td>
                <td className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{getCurrencyString(netIncomeTotal)}</td>
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
