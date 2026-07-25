'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Database, Edit, FileText, Image, Plus, RefreshCw, Search, ShieldAlert, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { bulletinApi, type Bulletin } from '../../lib/api'
import { cn, formatDate } from '../../lib/utils'
import { BULLETIN_CATEGORY_OPTIONS, BULLETIN_CATEGORY_LABELS, type BulletinCategoryValue } from '@/lib/category-constants'

type EditorType = 'text' | 'poster'

type BulletinFormState = {
  title: string
  subject: string
  category: BulletinCategoryValue
  content: string
  poster_url: string
}

const INITIAL_FORM: BulletinFormState = {
  title: '',
  subject: '',
  category: 'COMMUNITY_ADMIN',
  content: '',
  poster_url: '',
}

function normalizeBulletin(entry: Bulletin): Bulletin {
  return {
    ...entry,
    poster_url: entry.poster_url ?? entry.posterUrl ?? null,
  }
}

export default function BulletinDbManagerPage() {
  const { user } = useStaffAuth()
  const [bulletins, setBulletins] = useState<Bulletin[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | BulletinCategoryValue>('ALL')
  const [showEditor, setShowEditor] = useState(false)
  const [editorType, setEditorType] = useState<EditorType>('text')
  const [editingBulletin, setEditingBulletin] = useState<Bulletin | null>(null)
  const [formData, setFormData] = useState<BulletinFormState>(INITIAL_FORM)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const hasAccess = user?.role === 'ADMIN' && user?.department === 'BAND_OFFICE'

  const fetchBulletins = async (opts?: { silent?: boolean }) => {
    try {
      if (opts?.silent) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const res = await bulletinApi.list({ limit: 100, offset: 0 })
      if (res.success && res.data) {
        const payload = res.data as { bulletins?: Bulletin[] }
        const list = Array.isArray(payload.bulletins) ? payload.bulletins : []
        const normalized = list.map(normalizeBulletin)
        setBulletins(normalized)
      } else {
        toast.error(res.error || 'Failed to load bulletins')
      }
    } catch (error) {
      console.error('Failed to load bulletins:', error)
      toast.error('Failed to load bulletins')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    if (hasAccess) {
      fetchBulletins()
    } else {
      setLoading(false)
    }
  }, [hasAccess])

  const filteredBulletins = useMemo(() => {
    return bulletins.filter((bulletin) => {
      if (categoryFilter !== 'ALL' && bulletin.category !== categoryFilter) return false

      if (!search.trim()) return true
      const q = search.toLowerCase()
      const plainContent = (bulletin.content || '').replace(/<[^>]*>/g, ' ').toLowerCase()
      return (
        bulletin.title.toLowerCase().includes(q) ||
        bulletin.subject.toLowerCase().includes(q) ||
        plainContent.includes(q)
      )
    })
  }, [bulletins, categoryFilter, search])

  const openEditor = (bulletin?: Bulletin) => {
    if (bulletin) {
      const normalized = normalizeBulletin(bulletin)
      setEditingBulletin(normalized)
      setEditorType(normalized.poster_url ? 'poster' : 'text')
      setFormData({
        title: normalized.title,
        subject: normalized.subject,
        category: (normalized.category as BulletinCategoryValue) || 'COMMUNITY_ADMIN',
        content: normalized.content || '',
        poster_url: normalized.poster_url || '',
      })
    } else {
      setEditingBulletin(null)
      setEditorType('text')
      setFormData(INITIAL_FORM)
    }

    setShowEditor(true)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingBulletin(null)
    setFormData(INITIAL_FORM)
    setEditorType('text')
  }

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formData.subject.trim()) {
      toast.error('Subject is required')
      return
    }

    if (editorType === 'text' && !formData.content.trim()) {
      toast.error('Text content is required for text bulletins')
      return
    }

    if (editorType === 'poster' && !formData.poster_url.trim()) {
      toast.error('Poster URL is required for poster bulletins')
      return
    }

    const payload: Partial<Bulletin> = {
      title: formData.title.trim(),
      subject: formData.subject.trim(),
      category: formData.category,
      content: editorType === 'text' ? formData.content.trim() : '',
      poster_url: editorType === 'poster' ? formData.poster_url.trim() : '',
      userId: user?.id,
    }

    setSaving(true)
    try {
      const res = editingBulletin
        ? await bulletinApi.update(editingBulletin.id, payload)
        : await bulletinApi.create(payload)

      if (res.success) {
        toast.success(editingBulletin ? 'Bulletin updated' : 'Bulletin created')
        closeEditor()
        fetchBulletins({ silent: true })
      } else {
        toast.error(res.error || 'Failed to save bulletin')
      }
    } catch (error) {
      console.error('Failed to save bulletin:', error)
      toast.error('Failed to save bulletin')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (bulletin: Bulletin) => {
    if (!confirm(`Delete bulletin "${bulletin.title}"? This cannot be undone.`)) return

    setDeletingId(bulletin.id)
    try {
      const res = await bulletinApi.delete(bulletin.id)
      if (res.success) {
        toast.success('Bulletin deleted')
        setBulletins((prev) => prev.filter((item) => item.id !== bulletin.id))
      } else {
        toast.error(res.error || 'Failed to delete bulletin')
      }
    } catch (error) {
      console.error('Failed to delete bulletin:', error)
      toast.error('Failed to delete bulletin')
    } finally {
      setDeletingId(null)
    }
  }

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <div className="staff-card rounded-xl p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bulletin DB Manager</h1>
              <p className="text-staff-secondary">Access restricted to ADMIN users in BAND_OFFICE</p>
            </div>
          </div>
        </div>

        <div className="staff-card rounded-xl p-8 text-center">
          <p className="text-staff-secondary mb-4">
            Your current profile does not have permission to access this section.
          </p>
          <Link
            href="/Fq6pm72NjqUA/admin"
            className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
          >
            Return to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const posterCount = bulletins.filter((b) => Boolean(normalizeBulletin(b).poster_url)).length
  const textCount = bulletins.length - posterCount

  return (
    <div className="space-y-6">
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Bulletin DB Manager</h1>
              <p className="text-staff-secondary">Create, edit, search, and delete bulletin posts</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchBulletins({ silent: true })}
              disabled={refreshing}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
              Refresh
            </button>
            <button
              onClick={() => openEditor()}
              className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Bulletin
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{bulletins.length}</p>
          <p className="text-sm text-staff-muted">Total Bulletins</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-cyan-400">{textCount}</p>
          <p className="text-sm text-staff-muted">Text Bulletins</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-pink-400">{posterCount}</p>
          <p className="text-sm text-staff-muted">Poster Bulletins</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-amber-400">{filteredBulletins.length}</p>
          <p className="text-sm text-staff-muted">Filtered Results</p>
        </div>
      </div>

      <div className="staff-card rounded-xl p-4 space-y-4">
        <div className="relative max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-staff-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, subject, or content..."
            className="staff-input w-full pl-10 pr-4 py-2 rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              categoryFilter === 'ALL'
                ? 'bg-staff-accent text-[#1F2937]'
                : 'bg-white/5 text-staff-secondary hover:bg-white/10'
            )}
          >
            All Categories
          </button>
          {BULLETIN_CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setCategoryFilter(option.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                categoryFilter === option.value
                  ? 'bg-staff-accent text-[#1F2937]'
                  : 'bg-white/5 text-staff-secondary hover:bg-white/10'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredBulletins.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <Database className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Bulletins Found</h3>
          <p className="text-staff-secondary mb-4">
            {search || categoryFilter !== 'ALL' ? 'Try adjusting your filters.' : 'Create your first bulletin entry.'}
          </p>
          <button
            onClick={() => openEditor()}
            className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
          >
            Create Bulletin
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBulletins.map((bulletin) => {
            const isPoster = Boolean(normalizeBulletin(bulletin).poster_url)
            const summary = (bulletin.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()

            return (
              <div
                key={bulletin.id}
                className="staff-card rounded-xl p-4 hover:border-staff-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {isPoster ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300">
                          <Image className="w-3.5 h-3.5" /> Poster
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-cyan-500/20 text-cyan-300">
                          <FileText className="w-3.5 h-3.5" /> Text
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-white/10 text-staff-secondary">
                        {BULLETIN_CATEGORY_LABELS[bulletin.category as BulletinCategoryValue] || bulletin.category}
                      </span>
                    </div>

                    <h3 className="text-white font-medium truncate">{bulletin.title}</h3>
                    <p className="text-sm text-staff-secondary truncate">{bulletin.subject}</p>

                    <p className="text-xs text-staff-muted mt-2 line-clamp-2">
                      {isPoster
                        ? normalizeBulletin(bulletin).poster_url
                        : summary || 'No content preview'}
                    </p>

                    <p className="text-xs text-staff-muted mt-2">
                      Created {bulletin.created ? formatDate(bulletin.created) : '-'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditor(bulletin)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                      title="Edit bulletin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bulletin)}
                      disabled={deletingId === bulletin.id}
                      className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                      title="Delete bulletin"
                    >
                      {deletingId === bulletin.id ? (
                        <div className="staff-spinner w-4 h-4"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <h3 className="text-white font-medium">
                {editingBulletin ? 'Edit Bulletin' : 'New Bulletin'}
              </h3>
              <button
                onClick={closeEditor}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setEditorType('text')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    editorType === 'text'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'bg-white/5 text-staff-secondary hover:bg-white/10'
                  )}
                >
                  Text Bulletin
                </button>
                <button
                  onClick={() => setEditorType('poster')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    editorType === 'poster'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'bg-white/5 text-staff-secondary hover:bg-white/10'
                  )}
                >
                  Poster Bulletin
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Bulletin title"
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as BulletinCategoryValue }))}
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  >
                    {BULLETIN_CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-staff-secondary mb-2">Subject / Summary *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
                  placeholder="Short summary shown on bulletin list"
                  className="staff-input w-full px-4 py-3 rounded-lg"
                />
              </div>

              {editorType === 'text' ? (
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">HTML/Text Content *</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Paste or type bulletin content"
                    rows={10}
                    className="staff-input w-full px-4 py-3 rounded-lg resize-none"
                  />
                  <p className="text-xs text-staff-muted mt-1">
                    Rich HTML is supported. Word-pasted content is normalized by the API.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-staff-secondary mb-2">Poster URL *</label>
                  <input
                    type="text"
                    value={formData.poster_url}
                    onChange={(e) => setFormData((prev) => ({ ...prev, poster_url: e.target.value }))}
                    placeholder="https://... or /bulletinboard/..."
                    className="staff-input w-full px-4 py-3 rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-white/10">
                <button
                  onClick={closeEditor}
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
                  {editingBulletin ? 'Update' : 'Create'} Bulletin
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
