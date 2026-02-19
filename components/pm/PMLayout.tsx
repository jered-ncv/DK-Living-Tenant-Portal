'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface PMLayoutProps {
  children: React.ReactNode
  profileName?: string
}

interface NavigationItem {
  name: string
  href: string
  icon: string
  subItems?: { name: string; href: string }[]
}

export default function PMLayout({ children, profileName }: PMLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', href: '/pm/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { 
      name: 'Rentals', 
      href: '/pm/rentals/properties', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
      subItems: [
        { name: 'Properties', href: '/pm/rentals/properties' },
        { name: 'Rent roll', href: '/pm/rentals/rent-roll-v2' },
        { name: 'Tenants', href: '/pm/rentals/tenants' },
      ]
    },
    { name: 'Leasing', href: '/pm/leasing/applicants', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Accounting', href: '/pm/accounting', icon: 'M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z' },
    { name: 'Tasks', href: '/pm/tasks', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'Communication', href: '/pm/communication', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { name: 'Reports', href: '/pm/reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  ]

  const isActive = (href: string) => pathname === href || pathname?.startsWith(href + '/')

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-slate-800 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
            <span className="text-slate-800 font-bold text-sm">B</span>
          </div>
          <div>
            <div className="text-sm font-semibold">Buildium</div>
            <div className="text-xs text-slate-400">PM Portal</div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded hover:bg-slate-700"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Sidebar - Desktop always visible, Mobile slide-in */}
      <aside 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
          fixed md:static inset-y-0 left-0 z-50
          w-64 md:w-56
          bg-slate-800 text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'mt-16 md:mt-0' : ''}
        `}
      >
        {/* Logo - Desktop only */}
        <div className="hidden md:block p-4 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
              <span className="text-slate-800 font-bold text-sm">B</span>
            </div>
            <div>
              <div className="text-sm font-semibold">Buildium</div>
              <div className="text-xs text-slate-400">PM Portal</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navigation.map((item) => (
            <div key={item.name} className="group relative">
              {/* Main nav item */}
              <Link
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 text-sm
                  ${isActive(item.href) 
                    ? 'bg-slate-700 text-white' 
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }
                `}
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span>{item.name}</span>
              </Link>
              
              {/* Hover dropdown submenu - CSS based */}
              {item.subItems && (
                <div className="hidden group-hover:block absolute left-full top-0 ml-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[100]">
                  {item.subItems.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        block px-4 py-2 text-sm
                        ${pathname === subItem.href
                          ? 'bg-gray-100 text-gray-900 font-medium' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }
                      `}
                    >
                      {subItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Back to Tenant Portal */}
        <div className="p-4 border-t border-slate-700">
          <Link 
            href="/dashboard" 
            onClick={() => setSidebarOpen(false)}
            className="text-xs text-slate-400 hover:text-white block"
          >
            ← Back to Tenant Portal
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40 mt-16"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
