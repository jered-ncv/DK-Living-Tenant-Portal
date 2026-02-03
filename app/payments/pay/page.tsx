'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function MakePaymentPage() {
  const router = useRouter()
  const [amount, setAmount] = useState<'balance' | 'other'>('balance')
  const [customAmount, setCustomAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('credit')
  const [saveCard, setSaveCard] = useState(true)
  
  const currentBalance = 0.00
  const today = new Date().toISOString().split('T')[0]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Payment processing will be handled by Stripe integration
    console.log('Processing payment...')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white shadow-sm flex flex-col">
        <div className="p-6 border-b">
          <Link href="/dashboard" className="block">
            <div className="text-center">
              <div className="text-xl font-bold text-purple-900 mb-1">dk</div>
              <div className="text-xs font-semibold text-gray-700">DK LIVING</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="font-medium">Home</span>
          </Link>

          <Link href="/payments" className="flex items-center gap-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="font-medium">Payments</span>
          </Link>

          <Link href="/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            </svg>
            <span className="font-medium">Requests</span>
          </Link>

          <Link href="/announcements" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
            <span className="font-medium">Announcements</span>
          </Link>

          <Link href="/documents" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="font-medium">Documents</span>
          </Link>

          <Link href="/contacts" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="font-medium">Contacts</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-white">
        <div className="max-w-3xl mx-auto p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Select Amount */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select an amount</h2>
              
              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="amount"
                      value="balance"
                      checked={amount === 'balance'}
                      onChange={(e) => setAmount(e.target.value as 'balance')}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Current balance (as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})</span>
                  </div>
                  <span className="text-gray-900 font-semibold">${currentBalance.toFixed(2)}</span>
                </label>

                <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="amount"
                      value="other"
                      checked={amount === 'other'}
                      onChange={(e) => setAmount(e.target.value as 'other')}
                      className="w-4 h-4 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">Other amount</span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setAmount('other')
                    }}
                    placeholder="$0.00"
                    className="w-32 text-right px-3 py-1 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </label>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a payment method</h2>
              
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 mb-2"
              >
                <option value="credit">Credit card</option>
                <option value="bank">Bank account</option>
              </select>
              
              <p className="text-sm text-gray-500 mb-6">(2.99% handling fee)</p>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name on card</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card number</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="•••• •••• •••• ••••"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-1 py-0.5 rounded">VISA</span>
                      <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-1 py-0.5 rounded">MC</span>
                      <span className="text-xs text-gray-400 font-semibold bg-gray-100 px-1 py-0.5 rounded">DISC</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiration date</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security code
                      <span className="ml-1 text-gray-400 cursor-help" title="3-4 digit code on back of card">?</span>
                    </label>
                    <input
                      type="text"
                      placeholder="CVV"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Address */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Billing address</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option>United States</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address line 1</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address line 2</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <select className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500" required>
                      <option value="">Select...</option>
                      <option value="FL">Florida</option>
                      <option value="GA">Georgia</option>
                      {/* Add more states as needed */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal code</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={saveCard}
                    onChange={(e) => setSaveCard(e.target.checked)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Save my credit card for next time</span>
                </label>
              </div>
            </div>

            {/* Payment Date */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Select a date</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment start date</label>
                <input
                  type="date"
                  defaultValue={today}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 px-6 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors font-medium"
              >
                Submit payment
              </button>
              <Link
                href="/payments"
                className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 transition-colors font-medium text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
