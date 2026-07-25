'use client'

/**
 * Finance Dashboard Home Page
 * 
 * Dashboard for FINANCE role.
 * Duties: personal timesheet create/submit, travel-form create/submit,
 * view submitted approved travel forms from all departments,
 * export travel form as CSV and download, view memos from all departments.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText } from 'lucide-react'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { 
  timesheetsApi, 
  travelFormsApi, 
  memosApi,
  Memo
} from '../lib/api'
import { getRelativeTime, cn, getDepartmentLabel, getPayPeriodDates, formatDate } from '../lib/utils'

interface DashboardStats {
  approvedTravelForms: number
  activeMemos: number
  timesheetStatus: string | null
  draftTravelForms: number
}

interface ApprovedTravelItem {
  id: string
  name: string
  department: string
  submittedAt: string
}

export default function FinanceDashboard() {
  const { user } = useStaffAuth()
  const [stats, setStats] = useState<DashboardStats>({
    approvedTravelForms: 0,
    activeMemos: 0,
    timesheetStatus: null,
    draftTravelForms: 0,
  })
  const [approvedTravelItems, setApprovedTravelItems] = useState<ApprovedTravelItem[]>([])
  const [recentMemos, setRecentMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch approved travel forms (from all departments)
        const travelRes = await travelFormsApi.getAll({ status: 'APPROVED' })
        if (travelRes.success && travelRes.data) {
          const tfData = travelRes.data as any
          const forms = Array.isArray(tfData) ? tfData : tfData.forms || []
          setStats(prev => ({ ...prev, approvedTravelForms: forms.length }))
          
          const travelItems: ApprovedTravelItem[] = forms.slice(0, 5).map((tf: any) => ({
            id: tf.id,
            name: tf.user ? `${tf.user.first_name} ${tf.user.last_name}` : tf.name,
            department: tf.user?.department || 'Unknown',
            submittedAt: tf.submittedAt || tf.departureDate,
          }))
          setApprovedTravelItems(travelItems)
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
          const myTravelRes = await travelFormsApi.getByUser(user.id)
          if (myTravelRes.success && myTravelRes.data) {
            const tfData = myTravelRes.data as any
            const forms = Array.isArray(tfData) ? tfData : tfData.forms || []
            const drafts = forms.filter((tf: any) => tf.status === 'DRAFT')
            setStats(prev => ({ ...prev, draftTravelForms: drafts.length }))
          }
        }

        // Fetch memos (view from all departments)
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
        <h2 className="text-2xl font-bold text-white">Finance Dashboard</h2>
        <p>View approved travel forms, export data, and manage your personal submissions</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Link href="/Fq6pm72NjqUA/admin/travel?status=APPROVED" className="stat-card">
          <div className="stat-icon">✈️</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.approvedTravelForms}</span>
            <span className="stat-label">Approved Travel Forms</span>
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

        <Link href="/Fq6pm72NjqUA/dashboard/travel" className={cn("stat-card", stats.draftTravelForms > 0 && "urgent")}>
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.draftTravelForms}</span>
            <span className="stat-label">My Draft Travel Forms</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions — Finance-focused */}
      <div className="admin-section">
        <h3>Finance Tools</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/admin/travel?status=APPROVED" className="dashboard-card">
            <div className="card-icon">✈️</div>
            <h3>Approved Travel Forms</h3>
            <p>View submitted approved travel forms from all departments</p>
            {stats.approvedTravelForms > 0 && (
              <span className="card-badge">{stats.approvedTravelForms} approved</span>
            )}
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/travel?status=APPROVED&export=csv" className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>Export Travel Forms</h3>
            <p>Export approved travel forms as CSV for download</p>
            <span className="card-button">Export</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/memos" className="dashboard-card">
            <div className="card-icon">📬</div>
            <h3>View Memos</h3>
            <p>View office memos from all departments</p>
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

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approved Travel Forms */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>✈️ Recent Approved Travel Forms</h3>
            <Link href="/Fq6pm72NjqUA/admin/travel?status=APPROVED" className="section-link">View All →</Link>
          </div>

          {loading ? (
            <div className="view-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : approvedTravelItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-staff-secondary">No approved travel forms</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedTravelItems.map((item) => (
                <Link
                  key={item.id}
                  href={`/Fq6pm72NjqUA/admin/travel?id=${item.id}`}
                  className="memo-preview-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✈️</span>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-staff-secondary">
                        {getDepartmentLabel(item.department)} • Travel Form
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-staff-muted">{getRelativeTime(item.submittedAt)}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-500">
                      Approved
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Memos */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📌 Recent Memos</h3>
            <Link href="/Fq6pm72NjqUA/admin/memos" className="section-link">View All →</Link>
          </div>

          {loading ? (
            <div className="view-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : recentMemos.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-staff-muted mb-3" />
              <p className="text-staff-secondary">No memos yet</p>
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
    </div>
  )
}
