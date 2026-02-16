'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MobileDashboardProps {
  firstName: string
  unit: any
  currentBalance: number
  openRequests: any[]
  announcements: any[]
  profileRole: string | null
  handleSignOut: () => Promise<void>
}

export default function MobileDashboard({
  firstName,
  unit,
  currentBalance,
  openRequests,
  announcements,
  profileRole,
  handleSignOut
}: MobileDashboardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <header className="bg-white border-b px-4 py-3 flex justify-between items-center lg:hidden sticky top-0 z-40">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-900">dk</div>
          <div className="text-xs font-semibold text-gray-700">DK LIVING</div>
        </div>

        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
          {firstName[0]}
        </div>
      </header>

      {/* Mobile Navigation Overlay */}
      {showMenu && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setShowMenu(false)}
          />
          <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 lg:hidden">
            <div className="p-6 border-b flex justify-between items-center">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-900 mb-1">dk</div>
                <div className="text-xs font-semibold text-gray-700">DK LIVING</div>
              </div>
              <button
                onClick={() => setShowMenu(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1 overflow-auto">
              <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-green-600 bg-green-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="font-medium">Home</span>
              </Link>

              <Link href="/payments" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="font-medium">Payments</span>
              </Link>

              <Link href="/maintenance" className="flex items-center gap-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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

              {profileRole && ['pm', 'admin'].includes(profileRole) && (
                <div className="pt-4 mt-4 border-t">
                  <Link href="/pm/dashboard" className="flex items-center gap-3 px-3 py-2 text-purple-700 hover:bg-purple-50 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span className="font-medium">PM Portal</span>
                  </Link>
                </div>
              )}
            </nav>

            <div className="p-4 border-t">
              <form action={handleSignOut}>
                <button type="submit" className="w-full text-left px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm">
                  Sign out
                </button>
              </form>
            </div>
          </aside>
        </>
      )}

      {/* Main Content */}
      <main className="pb-6">
        {/* Greeting - Mobile Optimized */}
        <div className="bg-white border-b px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Hello, {firstName}!</h1>
          {unit && (
            <div className="text-sm mt-1">
              <div className="font-medium text-gray-900">{unit.properties?.name} - {unit.unit_number}</div>
              <div className="text-gray-500 text-xs">{unit.properties?.address}</div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Balance Card - Mobile Optimized */}
          <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm mb-1">Your current balance is</p>
            <p className="text-3xl font-bold text-gray-900 mb-4">${currentBalance.toFixed(2)}</p>
            <div className="space-y-2">
              <Link
                href="/payments"
                className="block text-center px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
              >
                Make payment
              </Link>
              <button className="block w-full px-4 py-2 text-gray-600 hover:text-gray-900 text-sm">
                Set up autopay
              </button>
            </div>
          </div>

          {/* Rent Reporting Banner - Mobile Optimized */}
          <div className="bg-gray-800 rounded-lg p-4">
            <p className="text-white font-medium mb-2">Rent Reporting</p>
            <p className="text-gray-300 text-sm mb-3">Build better credit by having monthly rent payments automatically reported to the credit bureaus.</p>
            <button className="w-full px-4 py-2 bg-white text-gray-800 rounded-full text-sm font-medium hover:bg-gray-100">
              Get started
            </button>
          </div>

          {/* Open Requests */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Open requests</h2>
            
            {openRequests && openRequests.length > 0 ? (
              <div className="space-y-3">
                {openRequests.map((request) => (
                  <div key={request.id} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium text-gray-900">{request.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{request.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Status: {request.status}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1 text-sm">How can we help you?</p>
                <p className="text-gray-500 text-xs mb-3">Your open requests will display here.</p>
                <Link href="/maintenance/new" className="inline-block px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm">
                  Create request
                </Link>
              </div>
            )}
          </div>

          {/* Tillable Ad - Mobile Optimized */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-sm p-4 text-white">
            <div className="text-xs font-medium mb-2">tillable</div>
            <h3 className="text-xl font-bold mb-2">Pay rent in <span className="italic">installments</span></h3>
            <p className="text-green-100 text-sm mb-3">Your landlord gets paid in full</p>
            <div className="flex gap-2 mb-3">
              <button className="px-3 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 text-sm">2</button>
              <button className="px-3 py-2 bg-white/20 rounded-lg text-white hover:bg-white/30 text-sm">3</button>
              <button className="px-3 py-2 bg-white rounded-lg text-green-600 font-semibold text-sm">4</button>
            </div>
            <button className="w-full px-4 py-2 bg-white text-green-600 rounded-full font-medium hover:bg-green-50 flex items-center justify-center gap-2 text-sm">
              View options →
            </button>
          </div>

          {/* New Announcements */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New announcements</h2>
            
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border-b pb-3 last:border-b-0">
                    <p className="font-medium text-gray-900 text-sm">{announcement.title}</p>
                    <p className="text-sm text-gray-600 mt-1">{announcement.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <p className="text-gray-900 font-medium mb-1 text-sm">You're all caught up!</p>
                <p className="text-gray-500 text-xs">New announcements will display here.</p>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Upcoming events</h2>
            
            <div className="text-center py-6">
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-gray-900 font-medium mb-1 text-sm">No upcoming events</p>
              <p className="text-gray-500 text-xs mb-3">Your community events will display here.</p>
              <button className="px-4 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors text-sm">
                Go to community calendar
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
