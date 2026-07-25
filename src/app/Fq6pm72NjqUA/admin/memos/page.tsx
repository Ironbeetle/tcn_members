'use client'

/**
 * Admin Memos Manager
 * 
 * Create, edit, and manage office memos.
 */

import { useEffect, useState } from 'react'
import { FileText, Plus, Edit, Trash2, Pin, Eye, Search } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { memosApi, Memo } from '../../lib/api'
import { formatDate, getPriorityClass, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function AdminMemosPage() {
  const { user } = useStaffAuth()
  const [memos, setMemos] = useState<Memo[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Editor form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    isPinned: false,
    department: '',
  })

  useEffect(() => {
    fetchMemos()
  }, [])

  const fetchMemos = async () => {
    try {
      const res = await memosApi.getAll()
      if (res.success && res.data) {
        const sorted = res.data.sort((a, b) => 
          new Date(b.created).getTime() - new Date(a.created).getTime()
        )
        setMemos(sorted)
      }
    } catch (error) {
      console.error('Failed to fetch memos:', error)
      toast.error('Failed to load memos')
    } finally {
      setLoading(false)
    }
  }

  const openEditor = (memo?: Memo) => {
    if (memo) {
      setEditingMemo(memo)
      setFormData({
        title: memo.title,
        content: memo.content,
        priority: memo.priority,
        isPinned: memo.isPinned,
        department: memo.department || '',
      })
    } else {
      setEditingMemo(null)
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
        isPinned: false,
        department: '',
      })
    }
    setShowEditor(true)
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Please enter a title')
      return
    }
    if (!formData.content.trim()) {
      toast.error('Please enter content')
      return
    }

    setSaving(true)
    try {
      const data = {
        ...formData,
        authorId: user?.id,
      }

      let res
      if (editingMemo) {
        res = await memosApi.update(editingMemo.id, data)
      } else {
        res = await memosApi.create(data)
      }

      if (res.success) {
        toast.success(editingMemo ? 'Memo updated' : 'Memo created')
        setShowEditor(false)
        fetchMemos()
      } else {
        toast.error(res.error || 'Failed to save memo')
      }
    } catch (error) {
      toast.error('Failed to save memo')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this memo?')) return

    setDeleting(id)
    try {
      const res = await memosApi.delete(id)
      if (res.success) {
        toast.success('Memo deleted')
        setMemos(prev => prev.filter(m => m.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete memo')
      }
    } catch (error) {
      toast.error('Failed to delete memo')
    } finally {
      setDeleting(null)
    }
  }

  const handleTogglePin = async (memo: Memo) => {
    try {
      const res = await memosApi.update(memo.id, { isPinned: !memo.isPinned })
      if (res.success) {
        setMemos(prev => prev.map(m => 
          m.id === memo.id ? { ...m, isPinned: !memo.isPinned } : m
        ))
        toast.success(memo.isPinned ? 'Memo unpinned' : 'Memo pinned')
      }
    } catch (error) {
      toast.error('Failed to update memo')
    }
  }

  const filteredMemos = memos.filter(m => {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return m.title.toLowerCase().includes(searchLower) || 
           m.content.toLowerCase().includes(searchLower)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Memos Manager</h1>
              <p className="text-staff-secondary">Create and manage office announcements</p>
            </div>
          </div>

          <button
            onClick={() => openEditor()}
            className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Memo
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-md relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-staff-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search memos..."
          className="staff-input w-full pl-10 pr-4 py-2 rounded-lg"
        />
      </div>

      {/* Memos List */}
      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredMemos.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Memos</h3>
          <p className="text-staff-secondary mb-4">
            {search ? 'No memos match your search.' : 'Create your first memo to get started.'}
          </p>
          {!search && (
            <button
              onClick={() => openEditor()}
              className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
            >
              Create Memo
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMemos.map((memo) => (
            <div
              key={memo.id}
              className="staff-card rounded-xl p-4 hover:border-staff-accent/30 transition-colors"
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
                    {memo.content.replace(/<[^>]*>/g, '').slice(0, 200)}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-staff-muted">
                    <span>Created {formatDate(memo.created)}</span>
                    {memo.department && <span>Dept: {memo.department}</span>}
                    {memo.readBy && <span>{memo.readBy.length} read</span>}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePin(memo)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors",
                      memo.isPinned 
                        ? "bg-yellow-500/20 text-yellow-400" 
                        : "bg-white/5 hover:bg-white/10 text-staff-muted"
                    )}
                    title={memo.isPinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openEditor(memo)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(memo.id)}
                    disabled={deleting === memo.id}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    {deleting === memo.id ? (
                      <div className="staff-spinner w-4 h-4"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <h3 className="text-white font-medium">
                {editingMemo ? 'Edit Memo' : 'New Memo'}
              </h3>
              <button
                onClick={() => setShowEditor(false)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-staff-secondary mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Memo title..."
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Department</label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    placeholder="Optional..."
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your memo content..."
                  rows={8}
                  className="staff-input w-full px-4 py-3 rounded-lg resize-none"
                />
                <p className="text-xs text-staff-muted mt-1">HTML formatting is supported.</p>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <span className="text-staff-secondary">Pin this memo to the top</span>
              </label>

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => setShowEditor(false)}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 btn-staff-primary py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <div className="staff-spinner w-4 h-4"></div> : null}
                  {editingMemo ? 'Update' : 'Create'} Memo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
