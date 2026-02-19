import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LeaseTimeline from '@/components/pm/LeaseTimeline'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Props {
  params: Promise<{
    id: string
  }>
}

export default async function LeaseDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has PM role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile || !['pm', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  // Fetch lease data
  const { data: lease, error } = await supabase
    .from('leases')
    .select(`
      *,
      unit:units(
        id,
        unit_number,
        bed_count,
        bath_count,
        property:properties(
          name,
          address
        )
      )
    `)
    .eq('id', id)
    .single()

  if (error || !lease) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Lease Not Found</h1>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-4">The lease you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link href="/pm/leasing/lease-management" className="text-blue-600 hover:underline">
              ← Back to Lease Management
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    renewed: 'bg-blue-100 text-blue-800',
    expired: 'bg-gray-100 text-gray-800',
    terminated: 'bg-red-100 text-red-800',
    transferred: 'bg-purple-100 text-purple-800',
  }

  const renewalStatusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    offer_sent: 'bg-blue-100 text-blue-800',
    accepted: 'bg-green-100 text-green-800',
    declined: 'bg-red-100 text-red-800',
    not_renewing: 'bg-red-100 text-red-800',
    transferred: 'bg-purple-100 text-purple-800',
  }

  const daysRemaining = Math.ceil((new Date(lease.lease_end).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/pm/leasing/lease-management" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
                ← Back to Lease Management
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">
                {lease.unit.property.name} - Unit {lease.unit.unit_number}
              </h1>
              <p className="text-sm text-gray-600">{lease.unit.property.address}</p>
            </div>
            <div className="text-right">
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${statusColors[lease.status] || 'bg-gray-100 text-gray-800'}`}>
                {lease.status.charAt(0).toUpperCase() + lease.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Lease Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tenant Info Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Tenant Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Name</label>
                  <p className="text-base text-gray-900">{lease.tenant_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-base text-gray-900">{lease.tenant_email || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-base text-gray-900">{lease.tenant_phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit Type</label>
                  <p className="text-base text-gray-900">
                    {lease.unit.bed_count || '?'} BD / {lease.unit.bath_count || '?'} BA
                  </p>
                </div>
              </div>
            </div>

            {/* Lease Terms Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Lease Terms</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Lease Start</label>
                  <p className="text-base text-gray-900">{new Date(lease.lease_start).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lease End</label>
                  <p className="text-base text-gray-900">{new Date(lease.lease_end).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Days Remaining</label>
                  <p className={`text-base font-semibold ${
                    daysRemaining < 30 ? 'text-red-600' :
                    daysRemaining < 60 ? 'text-orange-600' :
                    'text-gray-900'
                  }`}>
                    {daysRemaining} days
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Lease Term</label>
                  <p className="text-base text-gray-900 capitalize">{lease.lease_term.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Monthly Rent</label>
                  <p className="text-base font-semibold text-gray-900">${lease.monthly_rent.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Security Deposit</label>
                  <p className="text-base text-gray-900">${(lease.security_deposit || 0).toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Renewal Status Card */}
            {lease.status === 'active' && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Renewal Status</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <p>
                      <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                        renewalStatusColors[lease.renewal_status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {lease.renewal_status.replace(/_/g, ' ').charAt(0).toUpperCase() + lease.renewal_status.replace(/_/g, ' ').slice(1)}
                      </span>
                    </p>
                  </div>
                  {lease.renewal_offer_rent && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Renewal Offer Rent</label>
                      <p className="text-base text-gray-900">${lease.renewal_offer_rent.toLocaleString()}</p>
                    </div>
                  )}
                  {lease.renewal_offer_sent_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Offer Sent</label>
                      <p className="text-base text-gray-900">{new Date(lease.renewal_offer_sent_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {lease.renewal_response_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Response Date</label>
                      <p className="text-base text-gray-900">{new Date(lease.renewal_response_at).toLocaleDateString()}</p>
                    </div>
                  )}
                  {lease.notice_given_at && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Notice Given</label>
                      <p className="text-base text-gray-900">
                        {new Date(lease.notice_given_at).toLocaleDateString()}
                        {lease.notice_type && ` (${lease.notice_type.replace(/_/g, ' ')})`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lease Timeline */}
            <LeaseTimeline leaseId={lease.id} />
          </div>

          {/* Right Column - Quick Stats & Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Lease Duration</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {Math.ceil((new Date(lease.lease_end).getTime() - new Date(lease.lease_start).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Annual Rent</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ${(lease.monthly_rent * 12).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-semibold text-gray-900 capitalize">{lease.status}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
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
                {lease.status === 'active' && (
                  <>
                    <button className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                      Send Renewal Offer
                    </button>
                    <button className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                      Log Notice
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Move-In/Out Dates */}
            {(lease.move_in_date || lease.move_out_date) && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Move Dates</h3>
                <div className="space-y-2">
                  {lease.move_in_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Move-In</label>
                      <p className="text-base text-gray-900">{new Date(lease.move_in_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {lease.move_out_date && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Move-Out</label>
                      <p className="text-base text-gray-900">{new Date(lease.move_out_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
