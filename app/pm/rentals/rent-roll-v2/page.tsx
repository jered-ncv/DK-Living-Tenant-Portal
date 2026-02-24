'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface RentRollRow {
  lease_id: string
  unit_id: string
  unit_number: string
  property_address: string
  property_name: string
  tenant_name: string
  tenant_email: string | null
  tenant_phone: string | null
  lease_start: string
  lease_end: string
  monthly_rent: number
  security_deposit: number | null
  days_remaining: number
  balance_due: number
  prepayments: number
}

export default function RentRollV2Page() {
  const [rentRollData, setRentRollData] = useState<RentRollRow[]>([])
  const [filteredData, setFilteredData] = useState<RentRollRow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<string>('active')

  useEffect(() => {
    fetchRentRoll()
  }, [])

  useEffect(() => {
    filterData()
  }, [rentRollData, selectedProperty, selectedStatus])

  const fetchRentRoll = async () => {
    try {
      const response = await fetch('/api/leases?view=rent_roll')
      if (response.ok) {
        const data = await response.json()
        setRentRollData(data)
      }
    } catch (error) {
      console.error('Failed to fetch rent roll:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterData = () => {
    let filtered = [...rentRollData]

    // Property filter
    if (selectedProperty !== 'all') {
      filtered = filtered.filter(row => row.property_address === selectedProperty)
    }

    // Status filter
    if (selectedStatus === 'active') {
      filtered = filtered.filter(row => row.days_remaining > 0)
    } else if (selectedStatus === 'future') {
      filtered = filtered.filter(row => new Date(row.lease_start) > new Date())
    }

    setFilteredData(filtered)
  }

  const properties = Array.from(new Set(rentRollData.map(row => row.property_address)))
  const totalRent = filteredData.reduce((sum, row) => sum + row.monthly_rent, 0)

  const getDaysLeftBadge = (days: number) => {
    if (days <= 0) return null
    if (days <= 20) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">{days} DAYS</span>
    if (days <= 60) return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">{days} DAYS</span>
    return null
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/leases/export')
      if (!response.ok) throw new Error('Export failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `rent-roll-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
      alert('Failed to export rent roll')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-36" />
            </div>
          </div>
          <div className="flex gap-6 border-b border-gray-200">
            <Skeleton className="h-6 w-20 mb-3" />
            <Skeleton className="h-6 w-32 mb-3" />
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex gap-3 mb-4">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-normal text-gray-900">Rent roll</h1>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700">
              Add lease
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
              Renew lease
            </button>
            <button className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
              Receive payment
            </button>
            <button className="px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded hover:bg-gray-200">
              •••
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-gray-200">
          <button className="pb-3 text-sm font-medium text-gray-900 border-b-2 border-green-600">
            Rent roll
          </button>
          <button className="pb-3 text-sm font-medium text-gray-500 hover:text-gray-700">
            Liability management
          </button>
        </div>
      </div>

      {/* Filters & Results */}
      <div className="px-6 py-4">
        {/* Filter Row */}
        <div className="flex gap-3 mb-4">
          {/* Property Filter */}
          <select
            value={selectedProperty}
            onChange={(e) => setSelectedProperty(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Properties</option>
            {properties.map(prop => (
              <option key={prop} value={prop}>{prop}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded text-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="active">Active</option>
            <option value="future">Future</option>
            <option value="all">All Statuses</option>
          </select>

          <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900">
            Add filter option
          </button>
        </div>

        {/* Match count and Export */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            {filteredData.length} {filteredData.length === 1 ? 'match' : 'matches'}
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <button className="flex items-center gap-1 hover:text-gray-700">
                    LEASE
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  TYPE
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  DAYS LEFT
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  RENT
                </th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((row) => (
                <tr key={row.lease_id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <Link
                      href={`/pm/leasing/lease-management/${row.lease_id}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {row.property_name} - {row.unit_number} | {row.tenant_name}
                    </Link>
                    <div className="text-xs text-gray-500 mt-1">{row.lease_id.slice(0, 8)}</div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {row.days_remaining <= 30 && row.days_remaining > 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-green-100 text-green-700">
                        MOVING OUT
                      </span>
                    ) : (
                      'Active'
                    )}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    <div>Fixed</div>
                    <div className="text-xs text-gray-500">
                      {new Date(row.lease_start).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })} - {new Date(row.lease_end).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm">
                    {getDaysLeftBadge(row.days_remaining)}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-900 text-right">
                    ${row.monthly_rent.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {filteredData.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Monthly Rent ({filteredData.length} leases)</span>
              <span className="font-semibold text-gray-900">${totalRent.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
