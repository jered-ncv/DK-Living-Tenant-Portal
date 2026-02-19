'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'

interface Lease {
  id: string
  tenant_name: string
  tenant_email: string | null
  unit: {
    unit_number: string
    property: {
      name: string
      address: string
    }
  }
  lease_start: string
  lease_end: string
  monthly_rent: number
  status: string
  renewal_status: string
  days_remaining: number
}

export default function LeaseManagementPage() {
  const [leases, setLeases] = useState<Lease[]>([])
  const [filteredLeases, setFilteredLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [propertyFilter, setPropertyFilter] = useState('all')
  const [sortBy, setSortBy] = useState<'lease_end' | 'tenant_name' | 'monthly_rent'>('lease_end')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    fetchLeases()
  }, [])

  useEffect(() => {
    filterAndSortLeases()
  }, [leases, searchTerm, statusFilter, propertyFilter, sortBy, sortDirection])

  const fetchLeases = async () => {
    try {
      const response = await fetch('/api/leases')
      if (response.ok) {
        const data = await response.json()
        setLeases(data)
      }
    } catch (error) {
      console.error('Failed to fetch leases:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortLeases = () => {
    let filtered = [...leases]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(lease =>
        lease.tenant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.unit_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lease.unit.property.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lease => lease.status === statusFilter)
    }

    // Property filter
    if (propertyFilter !== 'all') {
      filtered = filtered.filter(lease => lease.unit.property.address === propertyFilter)
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal, bVal

      switch (sortBy) {
        case 'tenant_name':
          aVal = a.tenant_name
          bVal = b.tenant_name
          break
        case 'monthly_rent':
          aVal = a.monthly_rent
          bVal = b.monthly_rent
          break
        case 'lease_end':
        default:
          aVal = new Date(a.lease_end).getTime()
          bVal = new Date(b.lease_end).getTime()
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    setFilteredLeases(filtered)
  }

  const handleSort = (column: 'lease_end' | 'tenant_name' | 'monthly_rent') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  const properties = Array.from(new Set(leases.map(l => l.unit.property.address)))

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-gray-100 text-gray-800',
      terminated: 'bg-red-100 text-red-800',
      renewed: 'bg-blue-100 text-blue-800',
      transferred: 'bg-purple-100 text-purple-800',
    }
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Lease Management</h1>
          <Link
            href="/pm/leasing/lease-management/new"
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700"
          >
            + Add Lease
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Search by tenant, unit, or property..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
              <option value="renewed">Renewed</option>
            </select>

            {/* Property Filter */}
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Properties</option>
              {properties.map(prop => (
                <option key={prop} value={prop}>{prop}</option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredLeases.length} of {leases.length} leases
          </div>
        </div>

        {/* Leases Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  onClick={() => handleSort('tenant_name')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Tenant
                    {sortBy === 'tenant_name' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property & Unit
                </th>
                <th 
                  onClick={() => handleSort('lease_end')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2">
                    Lease Period
                    {sortBy === 'lease_end' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('monthly_rent')}
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  <div className="flex items-center justify-end gap-2">
                    Rent
                    {sortBy === 'monthly_rent' && (
                      <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Left
                </th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLeases.map((lease) => (
                <tr key={lease.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{lease.tenant_name}</div>
                    {lease.tenant_email && (
                      <div className="text-xs text-gray-500">{lease.tenant_email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{lease.unit.property.name}</div>
                    <div className="text-xs text-gray-500">Unit {lease.unit.unit_number}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div>{new Date(lease.lease_start).toLocaleDateString()} -</div>
                    <div>{new Date(lease.lease_end).toLocaleDateString()}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                    ${lease.monthly_rent.toLocaleString()}/mo
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(lease.status)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {lease.days_remaining > 0 ? (
                      <span className={`font-semibold ${
                        lease.days_remaining < 30 ? 'text-red-600' :
                        lease.days_remaining < 60 ? 'text-orange-600' :
                        'text-gray-600'
                      }`}>
                        {lease.days_remaining} days
                      </span>
                    ) : (
                      <span className="text-gray-400">Expired</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/pm/leasing/lease-management/${lease.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLeases.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg font-medium mb-2">No leases found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
