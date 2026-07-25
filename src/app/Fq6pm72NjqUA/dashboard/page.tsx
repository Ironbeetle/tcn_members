'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { memosApi, timesheetsApi, travelFormsApi, Memo } from '../lib/api'
import { getPayPeriodDates, formatDate, getRelativeTime, getPriorityClass, cn } from '../lib/utils'

interface QuickStats {
  unreadMemos: number
  timesheetStatus: string | null
  draftTravelForms: number
}

export default function StaffDashboard() {
  const { user } = useStaffAuth()
  const [stats, setStats] = useState<QuickStats>({ unreadMemos: 0, timesheetStatus: null, draftTravelForms: 0 })
  const [recentMemos, setRecentMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch memos
        const memosRes = await memosApi.getAll()
        if (memosRes.success && memosRes.data) {
          const memos = Array.isArray(memosRes.data) ? memosRes.data : []
          const unread = memos.filter(m => !m.readBy?.includes(user.id))
          setRecentMemos(memos.slice(0, 3))
          setStats(prev => ({ ...prev, unreadMemos: unread.length }))
        }

        // Fetch current timesheet
        const { start } = getPayPeriodDates()
        const timesheetRes = await timesheetsApi.getByUser(user.id)
        if (timesheetRes.success && timesheetRes.data) {
          const tsData = timesheetRes.data as any
          const timesheets = Array.isArray(tsData) ? tsData : tsData.timesheets || []
          const currentTimesheet = timesheets.find((ts: any) => {
            const tsStart = new Date(ts.payPeriodStart)
            return tsStart.toDateString() === start.toDateString()
          })
          setStats(prev => ({ ...prev, timesheetStatus: currentTimesheet?.status || null }))
        }

        // Fetch travel forms
        const travelRes = await travelFormsApi.getByUser(user.id)
        if (travelRes.success && travelRes.data) {
          const tfData = travelRes.data as any
          const forms = Array.isArray(tfData) ? tfData : tfData.forms || []
          const drafts = forms.filter((tf: any) => tf.status === 'DRAFT')
          setStats(prev => ({ ...prev, draftTravelForms: drafts.length }))
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

  const markMemoAsRead = async (memoId: string) => {
    if (!user) return
    try {
      await memosApi.markAsRead(memoId, user.id)
    } catch (error) {
      console.error('Failed to mark memo as read:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="welcome-section">
        <h2 className="text-2xl font-bold text-white">Welcome back, {user?.first_name}!</h2>
        <p>Here's your quick overview for today</p>
      </div>

      {/* Quick Stats Bar */}
      <div className="quick-stats">
        {stats.unreadMemos > 0 && (
          <Link href="/Fq6pm72NjqUA/dashboard/memos" className="stat-item urgent">
            <span className="stat-icon">📬</span>
            <span className="stat-text">{stats.unreadMemos} unread memo{stats.unreadMemos > 1 ? 's' : ''}</span>
          </Link>
        )}
        <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="stat-item">
          <span className="stat-icon">⏰</span>
          <span className="stat-text">Current period: {formatDate(periodStart)} - {formatDate(periodEnd)}</span>
        </Link>
        {stats.draftTravelForms > 0 && (
          <Link href="/Fq6pm72NjqUA/dashboard/travel" className="stat-item">
            <span className="stat-icon">✈️</span>
            <span className="stat-text">{stats.draftTravelForms} draft travel form{stats.draftTravelForms > 1 ? 's' : ''}</span>
          </Link>
        )}
      </div>

      {/* Main Dashboard Sections */}
      <div className="dashboard-sections">
        {/* Communications Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>📡 Member Communications</h3>
            <Link href="/Fq6pm72NjqUA/dashboard/communications" className="section-link">View All →</Link>
          </div>
          <div className="section-grid">
            <Link href="/Fq6pm72NjqUA/dashboard/communications/sms" className="mini-card">
              <span className="mini-icon">📱</span>
              <span className="mini-label">SMS</span>
            </Link>
            <Link href="/Fq6pm72NjqUA/dashboard/communications/email" className="mini-card">
              <span className="mini-icon">📧</span>
              <span className="mini-label">Email</span>
            </Link>
            <Link href="/Fq6pm72NjqUA/dashboard/communications/bulletin" className="mini-card">
              <span className="mini-icon">📋</span>
              <span className="mini-label">Bulletins</span>
            </Link>
          </div>
        </div>

        {/* Staff Tools Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h3>🏢 Staff Tools</h3>
            <Link href="/Fq6pm72NjqUA/dashboard/memos" className="section-link">View All →</Link>
          </div>
          <div className="section-grid">
            <Link href="/Fq6pm72NjqUA/dashboard/memos" className="mini-card">
              <span className="mini-icon">📬</span>
              <span className="mini-label">Office Memos</span>
              {stats.unreadMemos > 0 && <span className="mini-badge">{stats.unreadMemos}</span>}
            </Link>
            <Link href="/Fq6pm72NjqUA/dashboard/timesheets" className="mini-card">
              <span className="mini-icon">⏰</span>
              <span className="mini-label">Timesheets</span>
            </Link>
            <Link href="/Fq6pm72NjqUA/dashboard/travel" className="mini-card">
              <span className="mini-icon">✈️</span>
              <span className="mini-label">Travel Forms</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Memos Preview */}
      {recentMemos.length > 0 && (
        <div className="dashboard-section full-width">
          <div className="section-header">
            <h3>📌 Recent Office Memos</h3>
            <Link href="/Fq6pm72NjqUA/dashboard/memos" className="section-link">View All →</Link>
          </div>
          <div className="memos-preview">
            {recentMemos.map(memo => {
              const isUnread = !memo.readBy?.includes(user?.id || '')
              return (
                <Link
                  key={memo.id}
                  href={`/Fq6pm72NjqUA/dashboard/memos?id=${memo.id}`}
                  className={cn(
                    "memo-preview-card",
                    isUnread && "unread",
                    `priority-${memo.priority}`
                  )}
                  onClick={() => markMemoAsRead(memo.id)}
                >
                  <div className="memo-preview-header">
                    <span className={`priority-badge ${memo.priority}`}>{memo.priority}</span>
                    {memo.isPinned && <span className="pinned-badge">📌</span>}
                    {isUnread && <span className="unread-badge">New</span>}
                  </div>
                  <h4>{memo.title}</h4>
                  <p className="memo-preview-content">
                    {memo.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                  <div className="memo-preview-footer">
                    <span className="memo-author">
                      From: {memo.author?.first_name} {memo.author?.last_name}
                    </span>
                    <span className="memo-date">{getRelativeTime(memo.created)}</span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Communications Hub - Full Cards */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="dashboard-grid">
          <Link href="/Fq6pm72NjqUA/dashboard/communications/sms" className="dashboard-card">
            <div className="card-icon">📱</div>
            <h3>SMS Messages</h3>
            <p>Send text messages to community members via SMS</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/dashboard/communications/email" className="dashboard-card">
            <div className="card-icon">📧</div>
            <h3>Email Campaigns</h3>
            <p>Send email campaigns with attachments to members</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/dashboard/communications/bulletin" className="dashboard-card">
            <div className="card-icon">📋</div>
            <h3>Portal Bulletins</h3>
            <p>Post announcements to the member portal</p>
            <span className="card-button">Open</span>
          </Link>

          <Link href="/Fq6pm72NjqUA/dashboard/forms" className="dashboard-card">
            <div className="card-icon">📝</div>
            <h3>Sign-Up Forms</h3>
            <p>View and submit community sign-up forms</p>
            <span className="card-button">Open</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
