'use client'

/**
 * Department Admin Dashboard Home Page
 * 
 * Dashboard for DEPARTMENT_ADMIN role.
 * Duties: personal timesheet create/submit, travel-form create/submit,
 * view + approve department staff time-sheet submissions,
 * view + approve department staff travel forms,
 * create/send memos within department, communications (sms, email, bulletin),
 * view posted forms.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CheckCircle, FileText } from 'lucide-react'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { 
  timesheetsApi, 
  travelFormsApi, 
  memosApi,
  signupFormsApi,
  Memo
} from '../lib/api'
import { getRelativeTime, cn, getDepartmentLabel, getPayPeriodDates, formatDate } from '../lib/utils'

interface DashboardStats {
  pendingTimesheets: number
  pendingTravelForms: number
  activeMemos: number
  postedForms: number
  timesheetStatus: string | null
  draftTravelForms: number
}

interface PendingItem {
  id: string
  type: 'timesheet' | 'travel'
  name: string
  department: string
  submittedAt: string
}

export default function DeptAdminDashboard() {
  const { user } = useStaffAuth()
  const deptLabel = user?.department ? getDepartmentLabel(user.department) : 'Department'

  const [stats, setStats] = useState<DashboardStats>({
    pendingTimesheets: 0,
    pendingTravelForms: 0,
    activeMemos: 0,
    postedForms: 0,
    timesheetStatus: null,
    draftTravelForms: 0,
  })
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([])
  const [recentMemos, setRecentMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch pending timesheets (department-scoped)
        const timesheetsRes = await timesheetsApi.getAll({ status: 'SUBMITTED' })
        if (timesheetsRes.success && timesheetsRes.data) {
          const tsData = timesheetsRes.data as any
          const timesheets = Array.isArray(tsData) ? tsData : tsData.timesheets || []
          // Filter to own department
          const deptTimesheets = user?.department
            ? timesheets.filter((ts: any) => ts.user?.department === user.department)
            : timesheets
          setStats(prev => ({ ...prev, pendingTimesheets: deptTimesheets.length }))
          
          const timesheetItems: PendingItem[] = deptTimesheets.slice(0, 5).map((ts: any) => ({
            id: ts.id,
            type: 'timesheet',
            name: ts.user ? `${ts.user.first_name} ${ts.user.last_name}` : 'Unknown',
            department: ts.user?.department || 'Unknown',
            submittedAt: ts.submittedAt || ts.payPeriodEnd,
          }))
          setPendingItems(prev => [...prev, ...timesheetItems])
        }

        // Fetch pending travel forms (department-scoped)
        const travelRes = await travelFormsApi.getAll({ status: 'SUBMITTED' })
        if (travelRes.success && travelRes.data) {
          const tfData = travelRes.data as any
          const forms = Array.isArray(tfData) ? tfData : tfData.forms || []
          // Filter to own department
          const deptForms = user?.department
            ? forms.filter((tf: any) => tf.user?.department === user.department)
            : forms
          setStats(prev => ({ ...prev, pendingTravelForms: deptForms.length }))
          
          const travelItems: PendingItem[] = deptForms.slice(0, 5).map((tf: any) => ({
            id: tf.id,
            type: 'travel',
            name: tf.user ? `${tf.user.first_name} ${tf.user.last_name}` : tf.name,
            department: tf.user?.department || 'Unknown',
            submittedAt: tf.submittedAt || tf.departureDate,
          }))
          setPendingItems(prev => [...prev.filter(i => i.type !== 'travel'), ...travelItems])
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

        // Fetch memos
        const memosRes = await memosApi.getAll()
        if (memosRes.success && memosRes.data) {
          const memos = Array.isArray(memosRes.data) ? memosRes.data : []
          const published = memos.filter(m => m.isPublished)
          setStats(prev => ({ ...prev, activeMemos: published.length }))
          setRecentMemos(memos.slice(0, 3))
        }

        // Fetch posted forms (view only)
        const formsRes = await signupFormsApi.getAll()
        if (formsRes.success && formsRes.data) {
          const sfData = formsRes.data as any
          const signupForms = Array.isArray(sfData) ? sfData : sfData.forms || []
          const active = signupForms.filter((f: any) => f.isActive)
          setStats(prev => ({ ...prev, postedForms: active.length }))
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.department, user])

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="text-2xl font-bold text-white">Department Dashboard</h2>
        <p>Manage {deptLabel} staff approvals, memos, and communications</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <Link href="/Fq6pm72NjqUA/admin/timesheets?status=SUBMITTED" className={cn("stat-card", stats.pendingTimesheets > 0 && "urgent")}>
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.pendingTimesheets}</span>
            <span className="stat-label">Pending Timesheets</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/travel?status=SUBMITTED" className={cn("stat-card", stats.pendingTravelForms > 0 && "urgent")}>
          <div className="stat-icon">✈️</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.pendingTravelForms}</span>
            <span className="stat-label">Pending Travel Forms</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/memos" className="stat-card">
          <div className="stat-icon">📬</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.activeMemos}</span>
            <span className="stat-label">Department Memos</span>
          </div>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/forms" className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-content">
            <span className="stat-value">{loading ? '-' : stats.postedForms}</span>
            <span className="stat-label">Posted Forms</span>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="admin-section">
        <h3>Department Management</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/admin/timesheets" className="dashboard-card">
            <div className="card-icon">⏰</div>
            <h3>Approve Timesheets</h3>
            <p>View and approve {deptLabel} staff timesheet submissions</p>
            {stats.pendingTimesheets > 0 && (
              <span className="card-badge urgent">{stats.pendingTimesheets} pending</span>
            )}
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/travel" className="dashboard-card">
            <div className="card-icon">✈️</div>
            <h3>Approve Travel Forms</h3>
            <p>View and approve {deptLabel} staff travel forms</p>
            {stats.pendingTravelForms > 0 && (
              <span className="card-badge urgent">{stats.pendingTravelForms} pending</span>
            )}
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/memos" className="dashboard-card">
            <div className="card-icon">📬</div>
            <h3>Department Memos</h3>
            <p>Create and send memos within your department</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/forms" className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>View Posted Forms</h3>
            <p>View posted community sign-up forms</p>
            <span className="card-button">Open</span>
          </Link>
        </div>
      </div>

      {/* Communications */}
      <div className="admin-section">
        <h3>Member Communications</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/admin/communications/sms" className="dashboard-card">
            <div className="card-icon">📱</div>
            <h3>SMS Messages</h3>
            <p>Send text messages to community members</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/communications/email" className="dashboard-card">
            <div className="card-icon">📧</div>
            <h3>Email Campaigns</h3>
            <p>Send email campaigns to members</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/admin/communications/bulletin" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>Portal Bulletins</h3>
            <p>Post announcements to the member portal</p>
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
        {/* Pending Approvals */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>⏳ Pending Approvals ({deptLabel})</h3>
            <Link href="/Fq6pm72NjqUA/admin/timesheets?status=SUBMITTED" className="section-link">View All →</Link>
          </div>

          {loading ? (
            <div className="view-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : pendingItems.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
              <p className="text-staff-secondary">No pending approvals in your department</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingItems.slice(0, 5).map((item) => (
                <Link
                  key={`${item.type}-${item.id}`}
                  href={`/Fq6pm72NjqUA/admin/${item.type === 'timesheet' ? 'timesheets' : 'travel'}?id=${item.id}`}
                  className="memo-preview-card flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {item.type === 'timesheet' ? '⏰' : '✈️'}
                    </span>
                    <div>
                      <p className="font-medium text-white">{item.name}</p>
                      <p className="text-sm text-staff-secondary">
                        {getDepartmentLabel(item.department)} • {item.type === 'timesheet' ? 'Timesheet' : 'Travel Form'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-staff-muted">{getRelativeTime(item.submittedAt)}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-500">
                      Pending
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Department Memos */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📌 Department Memos</h3>
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
                Create Department Memo
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
    </div>
  )
}
