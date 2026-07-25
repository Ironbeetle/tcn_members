'use client'

/**
 * SMS Composer Page
 * 
 * Send SMS messages to community members.
 */

import { useState } from 'react'
import { MessageSquare, Send, AlertCircle, CheckCircle } from 'lucide-react'
import HelpTooltip from '../../../components/HelpTooltip'
import { useStaffAuth } from '../../../contexts/StaffAuthContext'
import { MemberSearch, Member } from '../../../components/MemberSearch'
import { smsApi } from '../../../lib/api'
import { calculateSmsSegments, formatPhoneNumber, cn } from '../../../lib/utils'
import { toast } from 'sonner'

export default function SmsPage() {
  const { user } = useStaffAuth()
  const [message, setMessage] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Member[]>([])
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const smsInfo = calculateSmsSegments(message)
  const maxChars = smsInfo.isUnicode ? 670 : 1530 // ~10 segments max

  const handleSend = async () => {
    if (!message.trim()) {
      toast.error('Please enter a message')
      return
    }
    if (selectedContacts.length === 0) {
      toast.error('Please select at least one recipient')
      return
    }

    setSending(true)
    setResult(null)

    try {
      const recipients = selectedContacts
        .map(c => c.phone)
        .filter((p): p is string => !!p)

      const res = await smsApi.send(message, recipients)

      if (res.success) {
        setResult({ success: true, message: `SMS sent to ${recipients.length} recipient(s)` })
        toast.success(`SMS sent to ${recipients.length} recipient(s)`)
        // Clear form
        setMessage('')
        setSelectedContacts([])
      } else {
        setResult({ success: false, message: res.error || 'Failed to send SMS' })
        toast.error(res.error || 'Failed to send SMS')
      }
    } catch (error) {
      setResult({ success: false, message: 'Network error. Please try again.' })
      toast.error('Network error. Please try again.')
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
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Send SMS</h1>
            <p className="text-staff-secondary">Send text messages to community members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Composer */}
        <div className="space-y-4">
          <div className="staff-card rounded-xl p-6">
            <h2 className="font-medium text-white mb-4">Compose Message<HelpTooltip text="SMS messages are split into segments of 160 characters (70 for Unicode/emoji). Each segment is billed separately." /></h2>
            
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, maxChars))}
              placeholder="Type your message here..."
              rows={6}
              className="staff-input staff-focus-ring w-full p-3 rounded-lg resize-none"
            />

            {/* Character/Segment Counter */}
            <div className="flex items-center justify-between mt-3 text-sm">
              <div className="flex items-center gap-4">
                <span className={cn(
                  "char-count",
                  smsInfo.chars > maxChars * 0.9 && "warning",
                  smsInfo.chars >= maxChars && "error"
                )}>
                  {smsInfo.chars} / {maxChars} characters
                </span>
                <span className="text-staff-muted">
                  {smsInfo.segments} segment{smsInfo.segments !== 1 ? 's' : ''}
                </span>
              </div>
              {smsInfo.isUnicode && (
                <span className="text-yellow-500 text-xs">
                  Unicode detected (shorter limit)
                </span>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !message.trim() || selectedContacts.length === 0}
            className="btn-staff-primary w-full py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="staff-spinner w-5 h-5"></div>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send SMS to {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''}</span>
              </>
            )}
          </button>

          {/* Result Message */}
          {result && (
            <div className={cn(
              "p-4 rounded-xl flex items-start gap-3",
              result.success ? "bg-green-500/10 border border-green-500/20" : "bg-red-500/10 border border-red-500/20"
            )}>
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              )}
              <p className={cn("text-sm", result.success ? "text-green-400" : "text-red-400")}>
                {result.message}
              </p>
            </div>
          )}
        </div>

        {/* Contact Search */}
        <div>
          <MemberSearch
            type="phone"
            selected={selectedContacts}
            onSelect={setSelectedContacts}
          />
        </div>
      </div>
    </div>
  )
}
