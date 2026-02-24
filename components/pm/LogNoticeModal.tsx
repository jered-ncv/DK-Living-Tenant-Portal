'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'

interface LogNoticeModalProps {
  leaseId: string
  onSuccess?: () => void
}

export default function LogNoticeModal({ leaseId, onSuccess }: LogNoticeModalProps) {
  const [noticeType, setNoticeType] = useState<'tenant_notice' | 'non_renewal'>('tenant_notice')
  const [moveOutDate, setMoveOutDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/leases/${leaseId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action_type: 'notice_received',
          notice_type: noticeType,
          move_out_date: moveOutDate || undefined,
          description: notes || `${noticeType === 'tenant_notice' ? 'Tenant' : 'Non-renewal'} notice logged`,
        }),
      })

      if (!response.ok) throw new Error('Failed to log notice')

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log notice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
          Log Notice
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Log Notice</DialogTitle>
            <DialogDescription>
              Record a move-out notice or non-renewal notice for this lease.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Notice Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="tenant_notice"
                      checked={noticeType === 'tenant_notice'}
                      onChange={(e) => setNoticeType(e.target.value as any)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Tenant Notice</div>
                      <div className="text-xs text-gray-500">Tenant has given notice to vacate</div>
                    </div>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-50">
                    <input
                      type="radio"
                      value="non_renewal"
                      checked={noticeType === 'non_renewal'}
                      onChange={(e) => setNoticeType(e.target.value as any)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">Non-Renewal Notice</div>
                      <div className="text-xs text-gray-500">PM/Owner not renewing the lease</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Move-Out Date */}
              <div>
                <label htmlFor="moveOutDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Move-Out Date
                </label>
                <input
                  type="date"
                  id="moveOutDate"
                  value={moveOutDate}
                  onChange={(e) => setMoveOutDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Optional: Set if known</p>
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Additional details about the notice..."
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Logging...' : 'Log Notice'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
