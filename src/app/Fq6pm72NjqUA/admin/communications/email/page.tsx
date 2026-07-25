'use client'

/**
 * Admin Email Page
 * 
 * Send email messages with letterhead to community members.
 */

import { useState } from 'react'
import { Mail, Send, Users, FileText, Clock, Calendar } from 'lucide-react'
import { emailApi } from '../../../lib/api'
import { MemberSearch, Member } from '../../../components/MemberSearch'
import { toast } from 'sonner'

export default function AdminEmailPage() {
  const [selectedContacts, setSelectedContacts] = useState<Member[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [useLetterhead, setUseLetterhead] = useState(true)
  const [scheduled, setScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
    if (!body.trim()) {
      toast.error('Please enter message content')
      return
    }

    setSending(true)
    try {
      let scheduledAt: string | undefined
      if (scheduled && scheduleDate && scheduleTime) {
        scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      }

      const res = await emailApi.send({
        recipients: selectedContacts.map(c => c.email!).filter(Boolean),
        subject,
        message: body,
        withLetterhead: useLetterhead,
      })

      if (res.success) {
        toast.success(scheduled ? `Email scheduled for ${selectedContacts.length} recipients` : `Email sent to ${selectedContacts.length} recipients`)
        setSubject('')
        setBody('')
        setSelectedContacts([])
        setScheduled(false)
        setScheduleDate('')
        setScheduleTime('')
      } else {
        toast.error(res.error || 'Failed to send email')
      }
    } catch (error) {
      toast.error('Failed to send email')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Send Email</h1>
            <p className="text-staff-secondary">Send emails with optional letterhead</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contact Selection */}
        <div className="staff-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Users className="w-4 h-4 text-staff-accent" />
              Select Recipients
            </h2>
            <span className="text-sm text-staff-muted">
              {selectedContacts.length} selected
            </span>
          </div>
          <MemberSearch
            selected={selectedContacts}
            onSelect={setSelectedContacts}
            type="email"
          />
        </div>

        {/* Email Composer */}
        <div className="space-y-6">
          <div className="staff-card rounded-xl p-6 space-y-4">
            <h2 className="text-white font-medium">Compose Email</h2>
            
            <div>
              <label className="block text-sm text-staff-secondary mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="staff-input w-full px-4 py-3 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm text-staff-secondary mb-2">Message</label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="staff-input w-full px-4 py-3 rounded-lg resize-none"
              />
            </div>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useLetterhead}
                  onChange={(e) => setUseLetterhead(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <FileText className="w-4 h-4 text-staff-accent" />
                <span className="text-staff-secondary">Include TCN letterhead</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={scheduled}
                  onChange={(e) => setScheduled(e.target.checked)}
                  className="w-4 h-4 rounded"
                />
                <Clock className="w-4 h-4 text-staff-accent" />
                <span className="text-staff-secondary">Schedule for later</span>
              </label>

              {scheduled && (
                <div className="grid grid-cols-2 gap-4 pl-6">
                  <div>
                    <label className="block text-sm text-staff-secondary mb-2">Date</label>
                    <input
                      type="date"
                      value={scheduleDate}
                      onChange={(e) => setScheduleDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="staff-input w-full px-4 py-2 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-staff-secondary mb-2">Time</label>
                    <input
                      type="time"
                      value={scheduleTime}
                      onChange={(e) => setScheduleTime(e.target.value)}
                      className="staff-input w-full px-4 py-2 rounded-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={sending || selectedContacts.length === 0 || !subject.trim() || !body.trim()}
              className="w-full btn-staff-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="staff-spinner w-5 h-5"></div>
              ) : scheduled ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {scheduled ? 'Schedule Email' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
