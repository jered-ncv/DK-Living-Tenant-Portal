import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ApplicantsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Mock applicant data (will be replaced with real data from application system)
  const mockApplicants = [
    {
      id: '1',
      firstName: 'Erica',
      lastName: 'Arnold',
      unit: '2061 Forbes St - 3',
      status: 'Undecided',
      stage: 'Application',
      stageProgress: 100,
      reportsReady: false,
      lastUpdated: '1/22/2026',
      applicationReceived: '1/22/2026 3:07 PM',
    },
    {
      id: '2',
      firstName: 'Nick',
      lastName: 'Dilts',
      unit: '2061 Forbes St - 2',
      status: 'Approved',
      stage: 'Screening',
      stageProgress: 100,
      reportsReady: true,
      lastUpdated: '2/27/2025',
      applicationReceived: '2/12/2025 7:36 PM',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Applicants</h1>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Create applicant
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Run tenant screening
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Print rental application
            </button>
            <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              ⋯
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-8 py-4">
        <div className="flex gap-4">
          <select className="px-4 py-2 border rounded">
            <option>2061 Forbes St</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>(3) New, Undecided, Approved</option>
          </select>
          <select className="px-4 py-2 border rounded">
            <option>Select a stage...</option>
          </select>
          <button className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50">
            Add filter option ▼
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-sm text-gray-600">{mockApplicants.length} matches</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">First Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Name ▲</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stages in Progress</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application Received</th>
                <th className="px-4 py-3"></th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {mockApplicants.map((applicant) => (
                <tr key={applicant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <input type="checkbox" className="rounded" />
                  </td>
                  <td className="px-6 py-4">
                    <Link href={`/pm/leasing/applicants/${applicant.id}`} className="text-blue-600 hover:underline">
                      {applicant.firstName}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{applicant.lastName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{applicant.unit}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      applicant.status === 'Approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {applicant.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {applicant.stage && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                            <div 
                              className="bg-green-500 h-2 rounded-full" 
                              style={{ width: `${applicant.stageProgress}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-700">{applicant.stage}</span>
                        </div>
                        {applicant.reportsReady && (
                          <Link href="#" className="text-xs text-blue-600 hover:underline">
                            Reports ready
                          </Link>
                        )}
                      </div>
                    )}
                    {!applicant.stage && <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{applicant.lastUpdated}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {applicant.applicationReceived || '—'}
                  </td>
                  <td className="px-4 py-4">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
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
    </div>
  )
}
