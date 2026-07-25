'use client'

/**
 * Communications Hub Page
 * 
 * Central hub for all member communication tools (SMS, Email, Bulletins).
 * Matches desktop app Communications component layout.
 */

import Link from 'next/link'
import { useStaffAuth } from '../../contexts/StaffAuthContext'

export default function CommunicationsHub() {
  const { user } = useStaffAuth()

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="view-header">
        <Link href="/Fq6pm72NjqUA/dashboard" className="back-button">← Back to Home</Link>
        <h2>Member Communications</h2>
        <p>Send messages to TCN community members</p>
      </div>

      {/* Communications Cards */}
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
      </div>
    </div>
  )
}
