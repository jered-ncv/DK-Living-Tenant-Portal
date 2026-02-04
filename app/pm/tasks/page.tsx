import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function TasksPage() {
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (!profile || !['pm', 'admin'].includes(profile.role || '')) redirect('/dashboard')

  // Fetch maintenance requests (tasks)
  const { data: tasks } = await supabase
    .from('maintenance_requests')
    .select('*')
    .order('created_at', { ascending: false })

  // Calculate age for each task
  const tasksWithAge = tasks?.map(task => {
    const createdDate = new Date(task.created_at)
    const now = new Date()
    const diffMs = now.getTime() - createdDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    return { 
      ...task, 
      age: `${diffDays} days ${diffHours} hours`,
      ageSort: diffMs 
    }
  }) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-gray-900">Incoming requests</h1>
            <button className="text-blue-600 hover:underline text-sm">ⓘ Help</button>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
              Add task ▼
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Add recurring task ▼
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Manage categories
            </button>
            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
              Notification settings
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
          <button className="px-4 py-2 border text-gray-700 rounded hover:bg-gray-50">
            Add filter option ▼
          </button>
        </div>
        <div className="flex justify-between mt-4">
          <div className="text-sm text-gray-600">{tasksWithAge.length} matches</div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Updated ▼
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendors</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tasksWithAge.map((task) => {
                const statusColor = task.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                   task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                                   'bg-gray-100 text-gray-800'
                
                return (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                        {task.status === 'completed' ? 'Completed' : 
                         task.status === 'in_progress' ? 'In progress' : 
                         'Submitted'}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">--</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">--</td>
                    <td className="px-6 py-4">
                      <Link href={`/pm/tasks/${task.id}`} className="text-blue-600 hover:underline">
                        {task.title}
                      </Link>
                      <div className="text-xs text-gray-500">Resident request | {task.id.slice(0, 7)}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">--</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(task.created_at).toLocaleString('en-US', { 
                        month: 'numeric', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true 
                      })}
                      <div className="text-xs text-gray-500">{task.age}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{task.age}</td>
                    <td className="px-6 py-4">
                      <span className="text-orange-600">—</span>
                      <div className="text-xs text-gray-900">Normal</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">Maintenance Request</td>
                    <td className="px-6 py-4 text-sm text-gray-600">--</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/pm/tasks/${task.id}`} className="text-blue-600 hover:underline">
                          View
                        </Link>
                        <button className="text-gray-400 hover:text-gray-600">⋯</button>
                      </div>
                    </td>
                  </tr>
                )
              })}
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
