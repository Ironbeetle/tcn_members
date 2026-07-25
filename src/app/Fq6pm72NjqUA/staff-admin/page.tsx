'use client'

/**
 * Staff Admin Dashboard Home Page
 * 
 * Dashboard for STAFF_ADMIN role.
 * Duties: personal timesheet create/submit, travel-form create/submit,
 * staff management, view individual staff activity stats,
 * create/send/view memos all departments, view timesheet submissions from all departments.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { 
  usersApi,
  timesheetsApi, 
  travelFormsApi, 
  memosApi,
  Memo
} from '../lib/api'
import { getRelativeTime, cn, getDepartmentLabel, getPayPeriodDates, formatDate } from '../lib/utils'

interface DashboardStats {
  totalStaff: number
  allTimesheetSubmissions: number
  activeMemos: number
  timesheetStatus: string | null
  draftTravelForms: number
}

export default function StaffAdminDashboard() {
  const { user } = useStaffAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    allTimesheetSubmissions: 0,
    activeMemos: 0,
    timesheetStatus: null,
    draftTravelForms: 0,
  })
  const [recentMemos, setRecentMemos] = useState<Memo[]>([])
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

        // Fetch all submitted timesheets (view from all departments)
        const timesheetsRes = await timesheetsApi.getAll({ status: 'SUBMITTED' })
        if (timesheetsRes.success && timesheetsRes.data) {
          const tsData = timesheetsRes.data as any
          const timesheets = Array.isArray(tsData) ? tsData : tsData.timesheets || []
          setStats(prev => ({ ...prev, allTimesheetSubmissions: timesheets.length }))
        }

        // Fetch current user's timesheet status
        if (user) {
          const myTimesheetRes = await timesheetsApi.getByUser(user.id)
          if (myTimesheetRes.success && myTimesheetRes.data) {
            const tsData = myTimesheetRes.data as any
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

        // Fetch memos (all departments)
        const memosRes = await memosApi.getAll()
        if (memosRes.success && memosRes.data) {
          const memos = Array.isArray(memosRes.data) ? memosRes.data : []
          const published = memos.filter(m => m.isPublished)
          setStats(prev => ({ ...prev, activeMemos: published.length }))
          setRecentMemos(memos.slice(0, 3))
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
        <h2 className="text-2xl font-bold text-white">Staff Admin Dashboard</h2>
        <p>Manage staff, view timesheets, and handle memos across all departments</p>
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

        <Link href="/Fq6pm72NjqUA/admin/timesheets?status=SUBMITTED" className={cn("stat-card", stats.allTimesheetSubmissions > 0 && "urgent")}>
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.allTimesheetSubmissions}</span>
            <span className="stat-label">Submitted Timesheets</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/memos" className="stat-card">
          <div className="stat-icon">📬</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.activeMemos}</span>
            <span className="stat-label">Active Memos</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <span className="stat-value">{stats.timesheetStatus || 'Not started'}</span>
            <span className="stat-label">My Timesheet</span>
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

          <Link href="/Fq6pm72NjqUA/admin/timesheets" className="dashboard-card">
            <div className="card-icon">⏰</div>
            <h3>View Timesheets</h3>
            <p>View timesheet submissions from all departments</p>
            {stats.allTimesheetSubmissions > 0 && (
              <span className="card-badge urgent">{stats.allTimesheetSubmissions} submitted</span>
            )}
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/memos" className="dashboard-card">
            <div className="card-icon">📬</div>
            <h3>Office Memos</h3>
            <p>Create, send, and view memos across all departments</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/staff" className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Staff Activity Stats</h3>
            <p>View individual staff activity statistics</p>
            <span className="card-button">Open</span>
          </Link>
        </div>
      </div>

      {/* Personal Tools */}
      <div className="admin-section">
        <h3>My Tools</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="dashboard-card">
            <div className="card-icon">📅</div>
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
        </div>
      </div>

      {/* Recent Memos */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>📌 Recent Memos (All Departments)</h3>
          <Link href="/Fq6pm72NjqUA/admin/memos" className="section-link">Manage →</Link>
        </div>

        {loading ? (
          <div className="view-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : recentMemos.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-staff-muted mb-3" />
            <p className="text-staff-secondary">No memos yet</p>
            <Link
              href="/Fq6pm72NjqUA/admin/memos?action=new"
              className="btn-staff-primary mt-4 inline-flex px-4 py-2 rounded-lg text-sm"
            >
              Create First Memo
            </Link>
          </div>
        ) : (
          <div className="memos-preview">
            {recentMemos.map((memo) => (
              <Link
                key={memo.id}
                href={`/Fq6pm72NjqUA/admin/memos?id=${memo.id}`}
                className={cn("memo-preview-card", `priority-${memo.priority}`)}
              >
                <div className="memo-preview-header">
                  <span className={`priority-badge ${memo.priority}`}>{memo.priority}</span>
                  {memo.isPinned && <span className="pinned-badge">📌 Pinned</span>}
                </div>
                <h4 className="text-white font-medium mt-2">{memo.title}</h4>
                <p className="text-sm text-staff-secondary mt-1 line-clamp-2">{memo.content}</p>
                <p className="text-xs text-staff-muted mt-2">{getRelativeTime(memo.created)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
