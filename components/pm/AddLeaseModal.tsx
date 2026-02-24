'use client'

import { useState, useEffect } from 'react'
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

interface Unit {
  id: string
  unit_number: string
  property_id: string
  property: {
    name: string
    address: string
  }
}

interface AddLeaseModalProps {
  trigger?: React.ReactNode
  onSuccess?: () => void
}

export default function AddLeaseModal({ trigger, onSuccess }: AddLeaseModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [vacantUnits, setVacantUnits] = useState<Unit[]>([])
  
  // Form data
  const [unitId, setUnitId] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantEmail, setTenantEmail] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [leaseStart, setLeaseStart] = useState('')
  const [leaseEnd, setLeaseEnd] = useState('')
  const [leaseTerm, setLeaseTerm] = useState<'fixed' | 'month_to_month'>('fixed')
  const [monthlyRent, setMonthlyRent] = useState('')
  const [securityDeposit, setSecurityDeposit] = useState('')

  useEffect(() => {
    fetchVacantUnits()
  }, [])

  const fetchVacantUnits = async () => {
    try {
      const response = await fetch('/api/units/vacant')
      if (response.ok) {
        const data = await response.json()
        setVacantUnits(data)
      }
    } catch (error) {
      console.error('Failed to fetch vacant units:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/leases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unit_id: unitId,
          tenant_name: tenantName,
          tenant_email: tenantEmail || null,
          tenant_phone: tenantPhone || null,
          lease_start: leaseStart,
          lease_end: leaseEnd,
          lease_term: leaseTerm,
          monthly_rent: parseFloat(monthlyRent),
          security_deposit: securityDeposit ? parseFloat(securityDeposit) : null,
          status: 'active',
          renewal_status: 'pending',
        }),
      })

      if (!response.ok) throw new Error('Failed to create lease')

      // Reset form
      setStep(1)
      setUnitId('')
      setTenantName('')
      setTenantEmail('')
      setTenantPhone('')
      setLeaseStart('')
      setLeaseEnd('')
      setMonthlyRent('')
      setSecurityDeposit('')
      
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create lease')
    } finally {
      setLoading(false)
    }
  }

  const selectedUnit = vacantUnits.find(u => u.id === unitId)

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            + Add Lease
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lease</DialogTitle>
            <DialogDescription>
              Step {step} of 3: {step === 1 ? 'Select Unit' : step === 2 ? 'Tenant Information' : 'Lease Terms'}
            </DialogDescription>
          </DialogHeader>

          <DialogBody>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Step 1: Select Unit */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Vacant Unit *
                  </label>
                  <select
                    id="unit"
                    value={unitId}
                    onChange={(e) => setUnitId(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Choose a unit...</option>
                    {vacantUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.property.name} - Unit {unit.unit_number}
                      </option>
                    ))}
                  </select>
                  {vacantUnits.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No vacant units available</p>
                  )}
                </div>

                {selectedUnit && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                    <div className="text-sm font-medium text-blue-900">Selected Unit:</div>
                    <div className="text-sm text-blue-700 mt-1">{selectedUnit.property.name}</div>
                    <div className="text-xs text-blue-600">{selectedUnit.property.address}</div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Tenant Information */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="tenantName" className="block text-sm font-medium text-gray-700 mb-1">
                    Tenant Name *
                  </label>
                  <input
                    type="text"
                    id="tenantName"
                    value={tenantName}
                    onChange={(e) => setTenantName(e.target.value)}
                    required
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="tenantEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="tenantEmail"
                    value={tenantEmail}
                    onChange={(e) => setTenantEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="tenantPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="tenantPhone"
                    value={tenantPhone}
                    onChange={(e) => setTenantPhone(e.target.value)}
                    placeholder="(904) 555-1234"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Lease Terms */}
            {step === 3 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="leaseStart" className="block text-sm font-medium text-gray-700 mb-1">
                      Lease Start Date *
                    </label>
                    <input
                      type="date"
                      id="leaseStart"
                      value={leaseStart}
                      onChange={(e) => setLeaseStart(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label htmlFor="leaseEnd" className="block text-sm font-medium text-gray-700 mb-1">
                      Lease End Date *
                    </label>
                    <input
                      type="date"
                      id="leaseEnd"
                      value={leaseEnd}
                      onChange={(e) => setLeaseEnd(e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lease Term *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="fixed"
                        checked={leaseTerm === 'fixed'}
                        onChange={(e) => setLeaseTerm(e.target.value as any)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Fixed Term</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="radio"
                        value="month_to_month"
                        checked={leaseTerm === 'month_to_month'}
                        onChange={(e) => setLeaseTerm(e.target.value as any)}
                        className="text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Month-to-Month</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                      Monthly Rent *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        id="monthlyRent"
                        value={monthlyRent}
                        onChange={(e) => setMonthlyRent(e.target.value)}
                        step="0.01"
                        min="0"
                        required
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="securityDeposit" className="block text-sm font-medium text-gray-700 mb-1">
                      Security Deposit
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="number"
                        id="securityDeposit"
                        value={securityDeposit}
                        onChange={(e) => setSecurityDeposit(e.target.value)}
                        step="0.01"
                        min="0"
                        className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                Back
              </button>
            )}
            <DialogClose>Cancel</DialogClose>
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && !unitId}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
              >
                {loading ? 'Creating...' : 'Create Lease'}
              </button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
