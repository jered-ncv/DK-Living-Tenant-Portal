'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

type RenewalStage = 'critical' | 'offer_due' | 'review_due' | 'no_action'

interface RenewalAlert {
  lease_id: string
  unit_number: string
  property_address: string
  tenant_name: string
  lease_end: string
  days_remaining: number
  monthly_rent: number
  renewal_status: string
  renewal_stage: RenewalStage
  notice_given_at: string | null
  sort_priority: number
}

export default function RenewalAlertsWidget() {
  const [alerts, setAlerts] = useState<RenewalAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actioningLeaseId, setActioningLeaseId] = useState<string | null>(null)

  const supabase = createClientComponentClient()

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/leases?view=renewal_alerts')
      if (!response.ok) throw new Error('Failed to fetch renewal alerts')
      const data = await response.json()
      setAlerts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlerts()
  }, [])

  const handleAction = async (leaseId: string, actionType: string) => {
    setActioningLeaseId(leaseId)
    try {
      const payload: any = {
        action_type: actionType,
      }

      // Add specific fields based on action type
      if (actionType === 'renewal_offer_sent') {
        const lease = alerts.find(a => a.lease_id === leaseId)
        payload.new_rent = lease?.monthly_rent
        payload.description = `Renewal offer sent at current rent: $${lease?.monthly_rent}`
      } else if (actionType === 'non_renewal_sent') {
        payload.description = 'Non-renewal notice sent to tenant'
      }

      const response = await fetch(`/api/leases/${leaseId}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error('Failed to log action')

      // Refresh alerts
      await fetchAlerts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to perform action')
    } finally {
      setActioningLeaseId(null)
    }
  }

  const getStageColor = (stage: RenewalStage) => {
    switch (stage) {
      case 'critical':
        return 'bg-red-100 border-red-300 text-red-900'
      case 'offer_due':
        return 'bg-orange-100 border-orange-300 text-orange-900'
      case 'review_due':
        return 'bg-yellow-100 border-yellow-300 text-yellow-900'
      default:
        return 'bg-green-100 border-green-300 text-green-900'
    }
  }

  const getStageBadgeColor = (stage: RenewalStage) => {
    switch (stage) {
      case 'critical':
        return 'bg-red-500 text-white'
      case 'offer_due':
        return 'bg-orange-500 text-white'
      case 'review_due':
        return 'bg-yellow-500 text-white'
      default:
        return 'bg-green-500 text-white'
    }
  }

  const getActionButtons = (alert: RenewalAlert) => {
    const isActioning = actioningLeaseId === alert.lease_id

    // If tenant has given notice or renewal is declined, no actions needed
    if (alert.notice_given_at || alert.renewal_status === 'declined') {
      return (
        <span className="text-xs text-gray-500 italic">
          {alert.renewal_status === 'declined' ? 'Renewal declined' : 'Notice given'}
        </span>
      )
    }

    // If renewal already accepted
    if (alert.renewal_status === 'accepted') {
      return (
        <span className="text-xs text-green-600 font-medium">
          ✓ Renewal accepted
        </span>
      )
    }

    // If offer already sent, show "Log Notice" only
    if (alert.renewal_status === 'offer_sent') {
      return (
        <button
          onClick={() => handleAction(alert.lease_id, 'notice_received')}
          disabled={isActioning}
          className="text-xs px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {isActioning ? 'Processing...' : 'Log Notice'}
        </button>
      )
    }

    // Default: show both Send Offer and Mark Not Renewing
    return (
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => handleAction(alert.lease_id, 'renewal_offer_sent')}
          disabled={isActioning}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isActioning ? 'Sending...' : 'Send Offer'}
        </button>
        <button
          onClick={() => handleAction(alert.lease_id, 'non_renewal_sent')}
          disabled={isActioning}
          className="text-xs px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
        >
          {isActioning ? 'Processing...' : 'Not Renewing'}
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Renewal Alerts</h2>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">Renewal Alerts</h2>
        <div className="text-sm text-red-600">Error: {error}</div>
      </div>
    )
  }

  const criticalAlerts = alerts.filter(a => a.renewal_stage === 'critical')
  const actionNeeded = alerts.filter(a => 
    a.renewal_stage === 'offer_due' || a.renewal_stage === 'review_due'
  )

  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">Renewal Alerts</h2>
        <button
          onClick={fetchAlerts}
          className="text-xs text-gray-600 hover:text-blue-600"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Summary Stats */}
      <div className="flex gap-4 mb-4 text-sm">
        <div>
          <span className="font-semibold text-red-600">{criticalAlerts.length}</span>
          <span className="text-gray-600"> Critical</span>
        </div>
        <div>
          <span className="font-semibold text-orange-600">{actionNeeded.length}</span>
          <span className="text-gray-600"> Action Needed</span>
        </div>
        <div>
          <span className="font-semibold text-gray-600">{alerts.length}</span>
          <span className="text-gray-600"> Total</span>
        </div>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500 italic">
          No renewal alerts at this time
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {alerts.map((alert) => (
            <div
              key={alert.lease_id}
              className={`border rounded-lg p-3 ${getStageColor(alert.renewal_stage)}`}
            >
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">
                    {alert.property_address} - Unit {alert.unit_number}
                  </div>
                  <div className="text-xs text-gray-700">{alert.tenant_name}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStageBadgeColor(alert.renewal_stage)}`}>
                  {alert.days_remaining} days
                </span>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-700 mb-2">
                <span>Lease ends: {new Date(alert.lease_end).toLocaleDateString()}</span>
                <span className="font-semibold">${alert.monthly_rent}/mo</span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-xs capitalize">
                  Status: {alert.renewal_status.replace(/_/g, ' ')}
                </span>
                {getActionButtons(alert)}
              </div>
            </div>
          ))}
        </div>
      )}

      <Link 
        href="/pm/leasing/lease-management" 
        className="text-xs md:text-sm text-blue-600 hover:underline mt-4 inline-block"
      >
        View all leases →
      </Link>
    </div>
  )
}
