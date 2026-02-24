'use client'

import { useRouter } from 'next/navigation'
import LeaseQuickActions from './LeaseQuickActions'

interface LeaseQuickActionsClientProps {
  leaseId: string
  leaseStatus: string
  monthlyRent: number
}

export default function LeaseQuickActionsClient({ leaseId, leaseStatus, monthlyRent }: LeaseQuickActionsClientProps) {
  const router = useRouter()

  const handleActionComplete = () => {
    // Refresh the page to show updated timeline
    router.refresh()
  }

  return (
    <LeaseQuickActions
      leaseId={leaseId}
      leaseStatus={leaseStatus}
      monthlyRent={monthlyRent}
      onActionComplete={handleActionComplete}
    />
  )
}
