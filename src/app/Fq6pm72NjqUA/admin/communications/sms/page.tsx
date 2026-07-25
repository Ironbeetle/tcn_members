'use client'

/**
 * Admin SMS Page
 * 
 * Send SMS messages to community members.
 * Same functionality as staff version but under admin layout.
 */

import { useState, useMemo } from 'react'
import { MessageSquare, Send, Users, Clock, Hash, Calendar } from 'lucide-react'
import { smsApi } from '../../../lib/api'
import { calculateSmsSegments, cn } from '../../../lib/utils'
import { MemberSearch, Member } from '../../../components/MemberSearch'
import { toast } from 'sonner'

export default function AdminSmsPage() {
  const [selectedContacts, setSelectedContacts] = useState<Member[]>([])
  const [message, setMessage] = useState('')
  const [scheduled, setScheduled] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduleTime, setScheduleTime] = useState('')
  const [sending, setSending] = useState(false)

  const segmentInfo = useMemo(() => calculateSmsSegments(message), [message])

  const handleSend = async () => {
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }

    setSending(true)
    try {
      let scheduledAt: string | undefined
      if (scheduled && scheduleDate && scheduleTime) {
        scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`).toISOString()
      }

      const res = await smsApi.send(message, selectedContacts.map(c => c.phone!).filter(Boolean))

      if (res.success) {
        toast.success(scheduled ? `SMS scheduled for ${selectedContacts.length} recipients` : `SMS sent to ${selectedContacts.length} recipients`)
        setMessage('')
        setSelectedContacts([])
        setScheduled(false)
        setScheduleDate('')
        setScheduleTime('')
      } else {
        toast.error(res.error || 'Failed to send SMS')
      }
    } catch (error) {
      toast.error('Failed to send SMS')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Send SMS</h1>
            <p className="text-staff-secondary">Send text messages to community members</p>
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
            type="phone"
          />
        </div>

        {/* Message Composer */}
        <div className="space-y-6">
          <div className="staff-card rounded-xl p-6 space-y-4">
            <h2 className="text-white font-medium">Compose Message</h2>
            
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={6}
                className="staff-input w-full px-4 py-3 rounded-lg resize-none"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-staff-muted">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Hash className="w-4 h-4" />
                    {message.length} chars
                  </span>
                  <span>{segmentInfo.segments} segment(s)</span>
                  {segmentInfo.isUnicode && <span className="text-yellow-400">(Unicode)</span>}
                </div>
              </div>
            </div>

            {/* Scheduling */}
            <div className="space-y-3">
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
              disabled={sending || selectedContacts.length === 0 || !message.trim()}
              className="w-full btn-staff-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <div className="staff-spinner w-5 h-5"></div>
              ) : scheduled ? (
                <Calendar className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {scheduled ? 'Schedule Message' : 'Send Message'}
            </button>
          </div>

          {/* Preview */}
          {message && (
            <div className="staff-card rounded-xl p-6">
              <h3 className="text-sm text-staff-muted mb-3">Preview</h3>
              <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                <p className="text-white whitespace-pre-wrap">{message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
