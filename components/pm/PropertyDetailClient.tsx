'use client'

import { useState } from 'react'
import Link from 'next/link'
import AddUnitModal from './AddUnitModal'

interface Unit {
  id: string
  unit_number: string
  monthly_rent: number | null
  lease_start_date: string | null
  lease_end_date: string | null
  tenant_id: string | null
  profiles?: {
    id: string
    email: string
    full_name: string | null
    phone: string | null
  }
}

interface Property {
  id: string
  name: string
  address: string
  created_at: string
  updated_at: string
}

interface MaintenanceRequest {
  id: string
  title: string
  status: string
  urgency: string
  created_at: string
}

interface PropertyDetailClientProps {
  property: Property
  units: Unit[]
  maintenanceRequests: MaintenanceRequest[]
  profileName: string
}

export default function PropertyDetailClient({ 
  property, 
  units, 
  maintenanceRequests,
  profileName 
}: PropertyDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'units' | 'tasks'>('summary')
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [showInactivateModal, setShowInactivateModal] = useState(false)
  const [isInactivating, setIsInactivating] = useState(false)

  const occupiedUnits = units.filter(u => u.tenant_id).length
  const vacantUnits = units.length - occupiedUnits
  const totalMonthlyRent = units.reduce((sum, u) => sum + (u.monthly_rent || 0), 0)

  const handleInactivateProperty = async () => {
    setIsInactivating(true)
    try {
      // TODO: Implement actual API call to inactivate property
      const response = await fetch(`/api/pm/properties/${property.id}/inactivate`, {
        method: 'POST',
      })
      
      if (response.ok) {
        // Success - reload or redirect
        window.location.reload()
      } else {
        alert('Failed to inactivate property')
      }
    } catch (error) {
      console.error('Error inactivating property:', error)
      alert('An error occurred while inactivating the property')
    } finally {
      setIsInactivating(false)
      setShowInactivateModal(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="px-8 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">{property.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Residential | Multi-Family
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowInactivateModal(true)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  Inactivate property
                </button>
                <button
                  onClick={() => setShowAddUnitModal(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Add Unit
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  Edit
                </button>
                <button className="px-2 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50">
                  ⋯
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 mt-6 border-b">
              <button
                onClick={() => setActiveTab('summary')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'summary'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('units')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'units'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Units ({units.length})
              </button>
              <button
                onClick={() => setActiveTab('tasks')}
                className={`pb-3 px-1 border-b-2 transition-colors ${
                  activeTab === 'tasks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Tasks
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="grid grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="col-span-2 space-y-6">
              {activeTab === 'summary' && (
                <>
                  {/* Property Details */}
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-lg font-semibold text-gray-900">Property Details</h2>
                      <button className="text-sm text-blue-600 hover:underline">Edit</button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">ADDRESS</span>
                        <p className="text-gray-900 mt-1">{property.address}</p>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium text-gray-700">PROPERTY MANAGER</span>
                        <p className="text-gray-900 mt-1">{profileName}</p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="text-sm text-gray-600">Total Units</div>
                      <div className="text-2xl font-semibold text-gray-900 mt-1">{units.length}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="text-sm text-gray-600">Occupied</div>
                      <div className="text-2xl font-semibold text-green-600 mt-1">{occupiedUnits}</div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                      <div className="text-sm text-gray-600">Vacant</div>
                      <div className="text-2xl font-semibold text-orange-600 mt-1">{vacantUnits}</div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'units' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Units</h2>
                    <button
                      onClick={() => setShowAddUnitModal(true)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      + Add Unit
                    </button>
                  </div>
                  
                  {units.length > 0 ? (
                    <table className="min-w-full">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {units.map((unit) => (
                          <tr key={unit.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {unit.unit_number}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {unit.profiles?.full_name || unit.profiles?.email || '—'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {unit.monthly_rent ? `$${unit.monthly_rent.toFixed(2)}` : '—'}
                            </td>
                            <td className="px-6 py-4 text-sm">
                              {unit.tenant_id ? (
                                <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                  Occupied
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                                  Vacant
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No units yet. Click "Add Unit" to get started.
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-900">Maintenance Requests</h2>
                  </div>
                  
                  {maintenanceRequests.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                      {maintenanceRequests.map((request) => (
                        <div key={request.id} className="px-6 py-4 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium text-gray-900">{request.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(request.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <span className={`px-2 py-1 rounded text-xs ${
                                request.urgency === 'emergency' ? 'bg-red-100 text-red-800' :
                                request.urgency === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.urgency}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs ${
                                request.status === 'completed' ? 'bg-green-100 text-green-800' :
                                request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-12 text-center text-gray-500">
                      No maintenance requests for this property.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Financial Summary</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-600">Monthly Rent Potential</div>
                    <div className="text-xl font-semibold text-gray-900">
                      ${totalMonthlyRent.toFixed(2)}
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <div className="text-sm text-gray-600">Occupancy Rate</div>
                    <div className="text-xl font-semibold text-gray-900">
                      {units.length > 0 ? Math.round((occupiedUnits / units.length) * 100) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-8">
            <Link href="/pm/rentals/properties" className="text-sm text-blue-600 hover:underline">
              ← Back to Properties
            </Link>
          </div>
        </div>
      </div>

      {/* Add Unit Modal */}
      <AddUnitModal
        isOpen={showAddUnitModal}
        onClose={() => setShowAddUnitModal(false)}
        properties={[{ id: property.id, name: property.name }]}
        propertyId={property.id}
      />

      {/* Inactivate Property Modal */}
      {showInactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Inactivate Property
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to inactivate <strong>{property.name}</strong>? 
                This property will no longer appear in active property lists, but you can reactivate it at any time.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowInactivateModal(false)}
                  disabled={isInactivating}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInactivateProperty}
                  disabled={isInactivating}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {isInactivating ? 'Inactivating...' : 'Inactivate Property'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
