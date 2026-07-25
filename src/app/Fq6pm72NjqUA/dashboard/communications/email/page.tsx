'use client'

/**
 * Email Composer Page
 * 
 * Send emails to community members with optional letterhead.
 */

import { useState } from 'react'
import { Mail, Send, AlertCircle, CheckCircle, FileText } from 'lucide-react'
import HelpTooltip from '../../../components/HelpTooltip'
import { useStaffAuth } from '../../../contexts/StaffAuthContext'
import { MemberSearch, Member } from '../../../components/MemberSearch'
import { emailApi } from '../../../lib/api'
import { LETTERHEAD_LOGOS, cn } from '../../../lib/utils'
import { toast } from 'sonner'

export default function EmailPage() {
  const { user } = useStaffAuth()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Member[]>([])
  const [withLetterhead, setWithLetterhead] = useState(false)
  const [selectedLogo, setSelectedLogo] = useState<typeof LETTERHEAD_LOGOS[number]['id']>(LETTERHEAD_LOGOS[0].id)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleSend = async () => {
    if (!subject.trim()) {
      toast.error('Please enter a subject')
      return
    }
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
        .map(c => c.email)
        .filter((e): e is string => !!e)

      const res = await emailApi.send({
        subject,
        message,
        recipients,
        withLetterhead,
        logoId: withLetterhead ? selectedLogo : undefined,
      })

      if (res.success) {
        setResult({ success: true, message: `Email sent to ${recipients.length} recipient(s)` })
        toast.success(`Email sent to ${recipients.length} recipient(s)`)
        // Clear form
        setSubject('')
        setMessage('')
        setSelectedContacts([])
      } else {
        setResult({ success: false, message: res.error || 'Failed to send email' })
        toast.error(res.error || 'Failed to send email')
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
          <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Send Email</h1>
            <p className="text-staff-secondary">Send emails to community members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Composer */}
        <div className="space-y-4">
          <div className="staff-card rounded-xl p-6 space-y-4">
            <h2 className="font-medium text-white">Compose Email</h2>
            
            {/* Subject */}
            <div>
              <label className="block text-sm text-staff-secondary mb-2">Subject<HelpTooltip text="Enter a clear subject line. This is what recipients see first in their inbox." /></label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject..."
                className="staff-input staff-focus-ring w-full px-3 py-2 rounded-lg"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm text-staff-secondary mb-2">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={8}
                className="staff-input staff-focus-ring w-full p-3 rounded-lg resize-none"
              />
            </div>

            {/* Letterhead Option */}
            <div className="border-t border-white/10 pt-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={withLetterhead}
                  onChange={(e) => setWithLetterhead(e.target.checked)}
                  className="w-5 h-5 rounded border-white/20 bg-transparent text-staff-accent focus:ring-staff-accent"
                />
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-staff-muted" />
                  <span className="text-sm text-white">Include organization letterhead<HelpTooltip text="Adds the official TCN letterhead header and footer for formal correspondence." /></span>
                </div>
              </label>

              {/* Logo Selection */}
              {withLetterhead && (
                <div className="mt-4 ml-8">
                  <p className="text-sm text-staff-secondary mb-2">Select organization:</p>
                  <div className="flex flex-wrap gap-2">
                    {LETTERHEAD_LOGOS.map((logo) => (
                      <button
                        key={logo.id}
                        onClick={() => setSelectedLogo(logo.id)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-sm transition-all",
                          selectedLogo === logo.id
                            ? "bg-staff-accent text-[#1F2937] font-medium"
                            : "bg-white/5 text-staff-secondary hover:bg-white/10"
                        )}
                      >
                        {logo.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim() || selectedContacts.length === 0}
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
                <span>Send Email to {selectedContacts.length} recipient{selectedContacts.length !== 1 ? 's' : ''}</span>
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
            type="email"
            selected={selectedContacts}
            onSelect={setSelectedContacts}
          />
        </div>
      </div>
    </div>
  )
}
