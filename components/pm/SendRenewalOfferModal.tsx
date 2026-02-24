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

interface SendRenewalOfferModalProps {
  leaseId: string
  currentRent: number
  onSuccess?: () => void
}

export default function SendRenewalOfferModal({ leaseId, currentRent, onSuccess }: SendRenewalOfferModalProps) {
  const [newRent, setNewRent] = useState(currentRent.toString())
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
          action_type: 'renewal_offer_sent',
          new_rent: parseFloat(newRent),
          description: `Renewal offer sent at $${newRent}/mo`,
        }),
      })

      if (!response.ok) throw new Error('Failed to send renewal offer')

      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send offer')
    } finally {
      setLoading(false)
    }
  }

  const rentDiff = parseFloat(newRent) - currentRent
  const rentIncrease = rentDiff > 0
  const percentChange = ((rentDiff / currentRent) * 100).toFixed(1)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
          Send Renewal Offer
        </button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Send Renewal Offer</DialogTitle>
            <DialogDescription>
              Enter the proposed monthly rent for the renewal period.
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Rent
                </label>
                <div className="text-2xl font-bold text-gray-900">
                  ${currentRent.toLocaleString()}/mo
                </div>
              </div>

              <div>
                <label htmlFor="newRent" className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Offer Rent
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                  <input
                    type="number"
                    id="newRent"
                    value={newRent}
                    onChange={(e) => setNewRent(e.target.value)}
                    step="0.01"
                    min="0"
                    required
                    className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2.5 text-gray-500">/mo</span>
                </div>
              </div>

              {newRent && parseFloat(newRent) !== currentRent && (
                <div className={`p-3 rounded-lg border ${
                  rentIncrease 
                    ? 'bg-orange-50 border-orange-200' 
                    : 'bg-green-50 border-green-200'
                }`}>
                  <div className="flex items-center gap-2">
                    {rentIncrease ? (
                      <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                      </svg>
                    )}
                    <span className={`text-sm font-medium ${
                      rentIncrease ? 'text-orange-700' : 'text-green-700'
                    }`}>
                      {rentIncrease ? '+' : ''}{rentDiff > 0 ? '$' : '-$'}{Math.abs(rentDiff).toLocaleString()} 
                      ({rentIncrease ? '+' : ''}{percentChange}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogBody>

          <DialogFooter>
            <DialogClose>Cancel</DialogClose>
            <button
              type="submit"
              disabled={loading || !newRent}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
            >
              {loading ? 'Sending...' : 'Send Offer'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
