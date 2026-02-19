'use client'

import Link from 'next/link'
import SendRenewalOfferModal from './SendRenewalOfferModal'
import LogNoticeModal from './LogNoticeModal'

interface LeaseQuickActionsProps {
  leaseId: string
  leaseStatus: string
  monthlyRent: number
  onActionComplete: () => void
}

export default function LeaseQuickActions({ leaseId, leaseStatus, monthlyRent, onActionComplete }: LeaseQuickActionsProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="space-y-2">
        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
          Edit Lease
        </button>
        <button className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm">
          View Unit Details
        </button>
        <Link 
          href={`/pm/rentals/rent-roll-v2`}
          className="block w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm text-center"
        >
          View Rent Roll
        </Link>
        {leaseStatus === 'active' && (
          <>
            <SendRenewalOfferModal
              leaseId={leaseId}
              currentRent={monthlyRent}
              onSuccess={onActionComplete}
            />
            <LogNoticeModal
              leaseId={leaseId}
              onSuccess={onActionComplete}
            />
          </>
        )}
      </div>
    </div>
  )
}
