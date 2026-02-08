'use client'

import { useState } from 'react'
import Link from 'next/link'
import PMLayout from './PMLayout'
import AddPropertyModal from './AddPropertyModal'
import AddUnitModal from './AddUnitModal'

interface Property {
  id: string
  name: string
  address: string
  qbo_customer_id: string | null
  created_at: string
  updated_at: string
}

interface PropertiesPageClientProps {
  properties: Property[]
  profileName: string
}

export default function PropertiesPageClient({ properties, profileName }: PropertiesPageClientProps) {
  const [showPropertyModal, setShowPropertyModal] = useState(false)
  const [showUnitModal, setShowUnitModal] = useState(false)

  return (
    <PMLayout profileName={profileName}>
      {/* Header */}
      <header className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Properties</h1>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowPropertyModal(true)}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm md:text-base"
            >
              Add property
            </button>
            <button
              onClick={() => setShowUnitModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm md:text-base"
            >
              Add unit
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b px-4 md:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="text-xs md:text-sm text-gray-600">{properties?.length || 0} properties</div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-8">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Manager
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {properties && properties.length > 0 ? (
                properties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link href={`/pm/rentals/properties/${property.id}`} className="text-blue-600 hover:underline font-medium">
                        {property.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {property.address}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {profileName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      Residential
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-600">⋯</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No properties found. Click "Add property" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-4">
          {properties && properties.length > 0 ? (
            properties.map((property) => (
              <div key={property.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <Link 
                    href={`/pm/rentals/properties/${property.id}`} 
                    className="text-blue-600 hover:underline font-medium text-base flex-1"
                  >
                    {property.name}
                  </Link>
                  <button className="text-gray-400 hover:text-gray-600 ml-2">⋯</button>
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Location: </span>
                    <span className="text-gray-900">{property.address}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Manager: </span>
                    <span className="text-gray-900">{profileName}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Type: </span>
                    <span className="text-gray-500">Residential</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No properties found. Click "Add property" to get started.
            </div>
          )}
        </div>

        {/* Back Link */}
        <div className="mt-6">
          <Link href="/pm/dashboard" className="text-xs md:text-sm text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Modals */}
      <AddPropertyModal isOpen={showPropertyModal} onClose={() => setShowPropertyModal(false)} />
      <AddUnitModal
        isOpen={showUnitModal}
        onClose={() => setShowUnitModal(false)}
        properties={properties.map((p) => ({ id: p.id, name: p.name }))}
      />
    </PMLayout>
  )
}
