'use client'

/**
 * Admin Dashboard Home Page
 * 
 * Overview dashboard for ADMIN and COUNCIL roles.
 * Duties: staff management, personal timesheet create/submit,
 * travel-form create/submit, view staff & communications data.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { 
  usersApi, 
  timesheetsApi, 
  travelFormsApi, 
} from '../lib/api'
import { cn, getPayPeriodDates, formatDate } from '../lib/utils'

interface DashboardStats {
  totalStaff: number
  timesheetStatus: string | null
  draftTravelForms: number
}

export default function AdminDashboard() {
  const { user } = useStaffAuth()
  const hasBulletinDbManagerAccess = user?.role === 'ADMIN' && user?.department === 'BAND_OFFICE'
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    timesheetStatus: null,
    draftTravelForms: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch staff count
        const usersRes = await usersApi.getAll()
        if (usersRes.success && usersRes.data) {
          const data = usersRes.data as any
          const users = Array.isArray(data) ? data : data.users || []
          setStats(prev => ({ ...prev, totalStaff: users.length }))
        }

        // Fetch current user's timesheet status
        if (user) {
          const timesheetRes = await timesheetsApi.getByUser(user.id)
          if (timesheetRes.success && timesheetRes.data) {
            const tsData = timesheetRes.data as any
            const timesheets = Array.isArray(tsData) ? tsData : tsData.timesheets || []
            const { start } = getPayPeriodDates()
            const currentTimesheet = timesheets.find((ts: any) => {
              const tsStart = new Date(ts.payPeriodStart)
              return tsStart.toDateString() === start.toDateString()
            })
            setStats(prev => ({ ...prev, timesheetStatus: currentTimesheet?.status || null }))
          }

          // Fetch user's draft travel forms
          const travelRes = await travelFormsApi.getByUser(user.id)
          if (travelRes.success && travelRes.data) {
            const tfData = travelRes.data as any
            const forms = Array.isArray(tfData) ? tfData : tfData.forms || []
            const drafts = forms.filter((tf: any) => tf.status === 'DRAFT')
            setStats(prev => ({ ...prev, draftTravelForms: drafts.length }))
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user])

  const { start: periodStart, end: periodEnd } = getPayPeriodDates()

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
        <p>Manage staff and view communications data</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Link href="/Fq6pm72NjqUA/admin/staff" className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.totalStaff}</span>
            <span className="stat-label">Total Staff</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-value">{stats.timesheetStatus || 'Not started'}</span>
            <span className="stat-label">Current Timesheet</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/dashboard/travel" className={cn("stat-card", stats.draftTravelForms > 0 && "urgent")}>
          <div className="stat-icon">✈️</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.draftTravelForms}</span>
            <span className="stat-label">Draft Travel Forms</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h3>Quick Actions</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/admin/staff" className="dashboard-card">
            <div className="card-icon">👥</div>
            <h3>Staff Management</h3>
            <p>Manage staff accounts and roles</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="dashboard-card">
            <div className="card-icon">⏰</div>
            <h3>My Timesheet</h3>
            <p>Create and submit your personal timesheet</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/dashboard/travel" className="dashboard-card">
            <div className="card-icon">✈️</div>
            <h3>My Travel Forms</h3>
            <p>Create and submit travel authorization forms</p>
            {stats.draftTravelForms > 0 && (
              <span className="card-badge">{stats.draftTravelForms} drafts</span>
            )}
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/communications" className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Communications Data</h3>
            <p>View staff and communications activity data</p>
            <span className="card-button">Open</span>
          </Link>

          {hasBulletinDbManagerAccess && (
            <Link href="/Fq6pm72NjqUA/admin/bulletin-manager" className="dashboard-card">
              <div className="card-icon">🗄️</div>
              <h3>Bulletin DB Manager</h3>
              <p>Full CRUD tools for bulletin database records</p>
              <span className="card-button">Open</span>
            </Link>
          )}
        </div>
      </div>

      {/* Personal Info */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>📅 Current Pay Period</h3>
        </div>
        <div className="text-center py-6">
          <p className="text-white text-lg font-medium">
            {formatDate(periodStart)} — {formatDate(periodEnd)}
          </p>
          <p className="text-staff-secondary mt-2">
            Timesheet status: <span className={cn(
              "font-medium",
              stats.timesheetStatus === 'SUBMITTED' ? 'text-yellow-500' :
              stats.timesheetStatus === 'APPROVED' ? 'text-green-500' :
              'text-staff-muted'
            )}>{stats.timesheetStatus || 'Not started'}</span>
          </p>
          <Link
            href="/Fq6pm72NjqUA/dashboard/timesheets"
            className="btn-staff-primary mt-4 inline-flex px-4 py-2 rounded-lg text-sm"
          >
            {stats.timesheetStatus ? 'View Timesheet' : 'Start Timesheet'}
          </Link>
        </div>
      </div>
    </div>
  )
}
