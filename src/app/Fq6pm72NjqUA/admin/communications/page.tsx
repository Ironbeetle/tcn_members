'use client'

/**
 * Admin Communications Hub Page
 * 
 * Central hub for all member communication tools (SMS, Email, Bulletins).
 * Matches desktop app Communications component layout.
 */

import Link from 'next/link'
import { useStaffAuth } from '../../contexts/StaffAuthContext'

export default function AdminCommunicationsHub() {
  const { user } = useStaffAuth()
  const hasBulletinDbManagerAccess = user?.role === 'ADMIN' && user?.department === 'BAND_OFFICE'

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="view-header">
        <Link href="/Fq6pm72NjqUA/admin" className="back-button">← Back to Dashboard</Link>
        <h2>Member Communications</h2>
        <p>Send messages to TCN community members</p>
      </div>

      {/* Communications Tabs */}
      <div className="comm-tabs">
        <Link href="/Fq6pm72NjqUA/admin/communications/sms" className="tab-button">
          📱 SMS
        </Link>
        <Link href="/Fq6pm72NjqUA/admin/communications/email" className="tab-button">
          📧 Email
        </Link>
        <Link href="/Fq6pm72NjqUA/admin/communications/bulletin" className="tab-button">
          📋 Bulletin
        </Link>
        {hasBulletinDbManagerAccess && (
          <Link href="/Fq6pm72NjqUA/admin/bulletin-manager" className="tab-button">
            🗄️ Bulletin DB
          </Link>
        )}
      </div>

      {/* Communications Cards */}
      <div className="dashboard-grid">
        <Link href="/Fq6pm72NjqUA/admin/communications/sms" className="dashboard-card">
          <div className="card-icon">📱</div>
          <h3>SMS Messages</h3>
          <p>Send text messages to community members via SMS</p>
          <span className="card-button">Open</span>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/communications/email" className="dashboard-card">
          <div className="card-icon">📧</div>
          <h3>Email Campaigns</h3>
          <p>Send email campaigns with attachments to members</p>
          <span className="card-button">Open</span>
        </Link>

        <Link href="/Fq6pm72NjqUA/admin/communications/bulletin" className="dashboard-card">
          <div className="card-icon">📋</div>
          <h3>Portal Bulletins</h3>
          <p>Post announcements to the member portal</p>
          <span className="card-button">Open</span>
        </Link>

        {hasBulletinDbManagerAccess && (
          <Link href="/Fq6pm72NjqUA/admin/bulletin-manager" className="dashboard-card">
            <div className="card-icon">🗄️</div>
            <h3>Bulletin DB Manager</h3>
            <p>Edit existing bulletin records and run full CRUD operations</p>
            <span className="card-button">Open</span>
          </Link>
        )}
      </div>

      {/* Quick Tips */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>💡 Tips</h3>
        </div>
        <ul className="text-sm text-staff-secondary space-y-2">
          <li>• <strong>SMS:</strong> Best for urgent, short announcements (max 160 chars per segment)</li>
          <li>• <strong>Email:</strong> Ideal for detailed messages with attachments and letterhead</li>
          <li>• <strong>Bulletins:</strong> Post visual announcements with posters to the member portal</li>
        </ul>
      </div>
    </div>
  )
}
