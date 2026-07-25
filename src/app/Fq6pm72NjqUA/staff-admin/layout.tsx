'use client'

/**
 * Staff Admin Dashboard Layout
 * 
 * Layout wrapper for STAFF_ADMIN role dashboard pages.
 * Uses top header navigation matching the admin layout style.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { TopHeader, MobileTopNav } from '../components/TopHeader'

export default function StaffAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading, user } = useStaffAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/Fq6pm72NjqUA/login')
      } else if (user?.role !== 'STAFF_ADMIN') {
        // Wrong role — send to their correct dashboard
        router.replace('/Fq6pm72NjqUA')
      }
    }
  }, [isLoading, isAuthenticated, user?.role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-staff-dark">
        <div className="staff-spinner w-10 h-10"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'STAFF_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-staff-dark flex flex-col">
      <div className="hidden md:block">
        <TopHeader variant="staff-admin" />
      </div>
      <MobileTopNav variant="staff-admin" />
      <main className="flex-1 overflow-auto staff-scrollbar md:pt-0 pt-14 pb-20 md:pb-0">
        <div className="dashboard-main p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
