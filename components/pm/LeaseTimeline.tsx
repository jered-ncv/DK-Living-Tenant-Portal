'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LeaseAction {
  id: string
  lease_id: string
  action_type: string
  description: string | null
  old_rent: number | null
  new_rent: number | null
  related_lease_id: string | null
  performed_at: string
  performed_by: string
  performed_by_name: string | null
}

interface LeaseTimelineProps {
  leaseId: string
}

const actionIcons: Record<string, string> = {
  lease_created: '📝',
  renewal_review: '🔍',
  renewal_offer_sent: '📨',
  renewal_accepted: '✅',
  renewal_declined: '❌',
  rent_increase: '📈',
  notice_received: '📢',
  non_renewal_sent: '🚫',
  transfer_out: '📤',
  transfer_in: '📥',
  lease_signed: '✍️',
  move_in: '🏠',
  move_out: '👋',
  lease_terminated: '🛑',
  note: '💬',
}

const actionColors: Record<string, string> = {
  lease_created: 'bg-blue-100 text-blue-800 border-blue-300',
  renewal_review: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  renewal_offer_sent: 'bg-purple-100 text-purple-800 border-purple-300',
  renewal_accepted: 'bg-green-100 text-green-800 border-green-300',
  renewal_declined: 'bg-red-100 text-red-800 border-red-300',
  rent_increase: 'bg-orange-100 text-orange-800 border-orange-300',
  notice_received: 'bg-red-100 text-red-800 border-red-300',
  non_renewal_sent: 'bg-red-100 text-red-800 border-red-300',
  transfer_out: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  transfer_in: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  lease_signed: 'bg-green-100 text-green-800 border-green-300',
  move_in: 'bg-green-100 text-green-800 border-green-300',
  move_out: 'bg-gray-100 text-gray-800 border-gray-300',
  lease_terminated: 'bg-red-100 text-red-800 border-red-300',
  note: 'bg-gray-100 text-gray-800 border-gray-300',
}

export default function LeaseTimeline({ leaseId }: LeaseTimelineProps) {
  const [actions, setActions] = useState<LeaseAction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  const fetchActions = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/leases/${leaseId}/actions`)
      if (!response.ok) throw new Error('Failed to fetch lease actions')
      const data = await response.json()
      setActions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [leaseId])

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!noteText.trim()) return

    setSaving(true)
    try {
      const response = await fetch(`/api/leases/${leaseId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'note',
          description: noteText.trim(),
        }),
      })

      if (!response.ok) throw new Error('Failed to add note')

      setNoteText('')
      setShowNoteForm(false)
      await fetchActions()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add note')
    } finally {
      setSaving(false)
    }
  }

  const formatActionType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Timeline</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Timeline</h3>
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lease Timeline</h3>
        <button
          onClick={() => setShowNoteForm(!showNoteForm)}
          className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          {showNoteForm ? 'Cancel' : '+ Add Note'}
        </button>
      </div>

      {/* Add Note Form */}
      {showNoteForm && (
        <form onSubmit={handleAddNote} className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add a note about this lease..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            required
          />
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => {
                setShowNoteForm(false)
                setNoteText('')
              }}
              className="text-sm px-3 py-1 text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !noteText.trim()}
              className="text-sm px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {actions.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 italic">
          No actions recorded yet
        </div>
      ) : (
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300"></div>

          {/* Timeline Items */}
          <div className="space-y-4">
            {actions.map((action, index) => (
              <div key={action.id} className="relative pl-10">
                {/* Icon */}
                <div className={`absolute left-0 w-8 h-8 rounded-full flex items-center justify-center text-lg border-2 ${
                  actionColors[action.action_type] || 'bg-gray-100 text-gray-800 border-gray-300'
                }`}>
                  {actionIcons[action.action_type] || '📌'}
                </div>

                {/* Content Card */}
                <div className={`border rounded-lg p-3 ${
                  index === 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                }`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm text-gray-900">
                      {formatActionType(action.action_type)}
                    </h4>
                    <span className="text-xs text-gray-500">
                      {formatDate(action.performed_at)}
                    </span>
                  </div>

                  {action.description && (
                    <p className="text-sm text-gray-700 mb-2">{action.description}</p>
                  )}

                  {/* Rent Change Details */}
                  {(action.old_rent !== null || action.new_rent !== null) && (
                    <div className="text-xs text-gray-600 mb-1">
                      {action.old_rent !== null && (
                        <span>Previous: ${action.old_rent.toLocaleString()} → </span>
                      )}
                      {action.new_rent !== null && (
                        <span className="font-semibold">New: ${action.new_rent.toLocaleString()}</span>
                      )}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    By: {action.performed_by_name || 'System'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
