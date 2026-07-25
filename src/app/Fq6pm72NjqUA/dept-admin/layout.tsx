'use client'

/**
 * Department Admin Dashboard Layout
 * 
 * Layout wrapper for DEPARTMENT_ADMIN role dashboard pages.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { TopHeader, MobileTopNav } from '../components/TopHeader'

export default function DeptAdminLayout({
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
      } else if (user?.role !== 'DEPARTMENT_ADMIN') {
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

  if (!isAuthenticated || user?.role !== 'DEPARTMENT_ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-staff-dark flex flex-col">
      <div className="hidden md:block">
        <TopHeader variant="dept-admin" />
      </div>
      <MobileTopNav variant="dept-admin" />
      <main className="flex-1 overflow-auto staff-scrollbar md:pt-0 pt-14 pb-20 md:pb-0">
        <div className="dashboard-main p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
