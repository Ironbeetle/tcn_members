'use client'

/**
 * Staff Dashboard Layout
 * 
 * Layout wrapper for all staff dashboard pages (regular STAFF role).
 * Uses top header navigation to match the desktop app design.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { TopHeader, MobileTopNav } from '../components/TopHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useStaffAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/Fq6pm72NjqUA/login')
    }
  }, [isLoading, isAuthenticated, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-staff-dark">
        <div className="staff-spinner w-10 h-10"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-staff-dark flex flex-col">
      {/* Desktop header */}
      <div className="hidden md:block">
        <TopHeader variant="staff" />
      </div>

      {/* Mobile nav */}
      <MobileTopNav variant="staff" />

      {/* Main content */}
      <main className="flex-1 overflow-auto staff-scrollbar md:pt-0 pt-14 pb-20 md:pb-0">
        <div className="dashboard-main p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
