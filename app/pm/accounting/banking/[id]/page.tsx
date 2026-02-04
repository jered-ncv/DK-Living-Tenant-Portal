import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function BankAccountDetailsPage() {
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
          <button className="pb-3 border-b-2 border-blue-500 text-blue-600 font-medium">
            Transactions
          </button>
          <button className="pb-3 text-gray-600 hover:text-gray-900">
            Balance breakdown
          </button>
          <button className="pb-3 text-gray-600 hover:text-gray-900">
            Payment settings
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white border-b px-8 py-3">
        <div className="flex gap-4">
          <button className="pb-2 border-b-2 border-green-500 text-green-600 font-medium">
            All transactions
          </button>
          <button className="pb-2 text-gray-600 hover:text-gray-900">
            Check search
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Record check
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Record deposit
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Record other transaction
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Print checks
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
            Reconcile account
          </button>
        </div>
      </div>

      {/* Zero State */}
      <div className="p-8 text-center">
        <p className="text-gray-500 italic">We didn't find any transactions. Maybe you don't have any or maybe you need to clear your filters.</p>
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
