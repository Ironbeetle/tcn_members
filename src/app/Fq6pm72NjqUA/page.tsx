'use client'

/**
 * TCN Staff App - Root Page
 * 
 * Redirects to login or dashboard based on auth state
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from './contexts/StaffAuthContext'

export default function StaffAppRoot() {
  const router = useRouter()
  const { isAuthenticated, isLoading, dashboardPath } = useStaffAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/Fq6pm72NjqUA/login')
      } else {
        router.replace(dashboardPath)
      }
    }
  }, [isAuthenticated, isLoading, dashboardPath, router])

  // Show loading spinner while checking auth
  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-dark">
      <div className="text-center">
        <div className="staff-spinner w-12 h-12 mx-auto mb-4"></div>
        <p className="text-staff-secondary">Loading TCN Communications...</p>
      </div>
    </div>
  )
}
