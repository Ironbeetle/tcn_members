'use client'

/**
 * Office Memos Page
 * 
 * View office memos and mark them as read.
 */

import { useEffect, useState } from 'react'
import { FileText, Pin, Bell, CheckCircle } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { memosApi, Memo } from '../../lib/api'
import { formatDate, getRelativeTime, getPriorityClass, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function MemosPage() {
  const { user } = useStaffAuth()
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null)

  useEffect(() => {
    fetchMemos()
  }, [])

  const fetchMemos = async () => {
    try {
      const res = await memosApi.getAll()
      if (res.success && res.data) {
        // Sort: pinned first, then by date
        const sorted = res.data.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1
          return new Date(b.created).getTime() - new Date(a.created).getTime()
        })
        setMemos(sorted)
      }
    } catch (error) {
      console.error('Failed to fetch memos:', error)
      toast.error('Failed to load memos')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMemo = async (memo: Memo) => {
    setSelectedMemo(memo)

    // Mark as read if not already
    if (user && !memo.readBy?.includes(user.id)) {
      try {
        await memosApi.markAsRead(memo.id, user.id)
        // Update local state
        setMemos(prev => prev.map(m => 
          m.id === memo.id 
            ? { ...m, readBy: [...(m.readBy || []), user.id] }
            : m
        ))
      } catch (error) {
        console.error('Failed to mark memo as read:', error)
      }
    }
  }

  const isUnread = (memo: Memo) => !memo.readBy?.includes(user?.id || '')
  const unreadCount = memos.filter(isUnread).length

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Office Memos</h1>
              <p className="text-staff-secondary">Stay updated with office announcements</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[rgba(100,116,139,0.25)] border border-[rgba(100,116,139,0.4)] text-[#1F2937] text-sm font-medium">
              <Bell className="w-4 h-4" />
              {unreadCount} unread
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : memos.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Memos</h3>
          <p className="text-staff-secondary">There are no office memos at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Memos List */}
          <div className="space-y-3">
            {memos.map((memo) => {
              const unread = isUnread(memo)
              const selected = selectedMemo?.id === memo.id
              
              return (
                <button
                  key={memo.id}
                  onClick={() => handleSelectMemo(memo)}
                  className={cn(
                    "w-full staff-card rounded-xl p-4 text-left transition-all",
                    selected && "border-staff-accent bg-staff-accent/5",
                    unread && !selected && "border-l-4 border-l-staff-accent"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {memo.isPinned && (
                          <Pin className="w-4 h-4 text-yellow-500 shrink-0" />
                        )}
                        <h3 className="font-medium text-white truncate">{memo.title}</h3>
                        <span className={cn(
                          "shrink-0 px-1.5 py-0.5 rounded text-xs text-white",
                          getPriorityClass(memo.priority)
                        )}>
                          {memo.priority}
                        </span>
                      </div>
                      <p className="text-sm text-staff-secondary line-clamp-2">
                        {memo.content.replace(/<[^>]*>/g, '').slice(0, 150)}
                      </p>
                      {memo.department && (
                        <p className="text-xs text-staff-muted mt-2">
                          Department: {memo.department}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-staff-muted">{getRelativeTime(memo.created)}</p>
                      {unread ? (
                        <span className="inline-block w-2 h-2 rounded-full bg-staff-accent mt-2"></span>
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 mt-2" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected Memo Detail */}
          <div className="lg:sticky lg:top-6">
            {selectedMemo ? (
              <div className="staff-card rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {selectedMemo.isPinned && (
                        <Pin className="w-5 h-5 text-yellow-500" />
                      )}
                      <span className={cn(
                        "px-2 py-0.5 rounded text-xs text-white",
                        getPriorityClass(selectedMemo.priority)
                      )}>
                        {selectedMemo.priority}
                      </span>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-white mb-2">{selectedMemo.title}</h2>
                  
                  <div className="flex items-center gap-4 text-sm text-staff-muted">
                    <span>Posted {formatDate(selectedMemo.created)}</span>
                    {selectedMemo.author && (
                      <span>by {selectedMemo.author.first_name} {selectedMemo.author.last_name}</span>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <div 
                    className="prose prose-invert max-w-none text-staff-secondary"
                    dangerouslySetInnerHTML={{ __html: selectedMemo.content }}
                  />
                </div>
              </div>
            ) : (
              <div className="staff-card rounded-xl p-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-staff-muted mb-3" />
                <p className="text-staff-secondary">Select a memo to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
