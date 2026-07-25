'use client'

/**
 * Admin Dashboard Layout
 * 
 * Layout wrapper for all admin dashboard pages (STAFF_ADMIN, ADMIN, COUNCIL roles).
 * Uses top header navigation to match the desktop app design.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { TopHeader, MobileTopNav } from '../components/TopHeader'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, isStaffAdmin } = useStaffAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/Fq6pm72NjqUA/login')
      } else if (!isStaffAdmin) {
        // Regular staff shouldn't access admin panel
        router.replace('/Fq6pm72NjqUA/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, isStaffAdmin, router])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-staff-dark">
        <div className="staff-spinner w-10 h-10"></div>
      </div>
    )
  }

  // Don't render if not authenticated or not admin
  if (!isAuthenticated || !isStaffAdmin) {
    return null
  }

  return (
    <div className="min-h-screen bg-staff-dark flex flex-col">
      {/* Desktop header */}
      <div className="hidden md:block">
        <TopHeader variant="admin" />
      </div>

      {/* Mobile nav */}
      <MobileTopNav variant="admin" />

      {/* Main content */}
      <main className="flex-1 overflow-auto staff-scrollbar md:pt-0 pt-14 pb-20 md:pb-0">
        <div className="dashboard-main p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
