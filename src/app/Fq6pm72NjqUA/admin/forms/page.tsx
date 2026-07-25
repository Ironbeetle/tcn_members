'use client'

/**
 * Admin Sign-up Forms Management
 * 
 * View all forms with statistics and manage submissions.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Eye, Users, Calendar, ChevronRight, Download, Trash2 } from 'lucide-react'
import { signupFormsApi, SignUpForm } from '../../lib/api'
import { formatDate, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function AdminFormsPage() {
  const [forms, setForms] = useState<SignUpForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const res = await signupFormsApi.getAll()
      if (res.success && res.data) {
        // API returns { forms: [...], count: ... }
        const formsData = (res.data as any).forms || res.data
        const sorted = (Array.isArray(formsData) ? formsData : []).sort((a: SignUpForm, b: SignUpForm) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setForms(sorted)
      }
    } catch (error) {
      console.error('Failed to fetch forms:', error)
      toast.error('Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this form? This will also delete all submissions.')) {
      return
    }

    setDeleting(id)
    try {
      const res = await signupFormsApi.delete(id)
      if (res.success) {
        toast.success('Form deleted')
        setForms(prev => prev.filter(f => f.id !== id))
      } else {
        toast.error(res.error || 'Failed to delete form')
      }
    } catch (error) {
      toast.error('Failed to delete form')
    } finally {
      setDeleting(null)
    }
  }

  const filteredForms = forms.filter(form => {
    if (filter === 'ALL') return true
    const now = new Date()
    const deadline = form.deadline ? new Date(form.deadline) : null
    const isActive = !deadline || deadline > now
    return filter === 'ACTIVE' ? isActive : !isActive
  })

  const getStatusBadge = (form: SignUpForm) => {
    const now = new Date()
    const deadline = form.deadline ? new Date(form.deadline) : null
    
    if (deadline && deadline < now) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Closed</span>
    }
    if (form.maxEntries && (form.submissionCount || 0) >= form.maxEntries) {
      return <span className="px-2 py-0.5 rounded-full text-xs bg-orange-500/20 text-orange-400">Full</span>
    }
    return <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>
  }

  const totalSubmissions = forms.reduce((sum, f) => sum + (f.submissionCount || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Sign-up Forms Manager</h1>
              <p className="text-staff-secondary">Create and manage event registrations</p>
            </div>
          </div>

          <Link
            href="/Fq6pm72NjqUA/admin/forms/new"
            className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Form
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-white">{forms.length}</p>
          <p className="text-sm text-staff-muted">Total Forms</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-green-400">
            {forms.filter(f => {
              const deadline = f.deadline ? new Date(f.deadline) : null
              return !deadline || deadline > new Date()
            }).length}
          </p>
          <p className="text-sm text-staff-muted">Active Forms</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-blue-400">{totalSubmissions}</p>
          <p className="text-sm text-staff-muted">Total Submissions</p>
        </div>
        <div className="staff-card rounded-xl p-4">
          <p className="text-2xl font-bold text-purple-400">
            {forms.filter(f => f.isActive).length}
          </p>
          <p className="text-sm text-staff-muted">Active Forms</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['ALL', 'ACTIVE', 'CLOSED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              filter === status
                ? "bg-staff-accent text-[#1F2937]"
                : "bg-white/5 text-staff-secondary hover:bg-white/10"
            )}
          >
            {status === 'ALL' ? 'All Forms' : status.charAt(0) + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Forms List */}
      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <ClipboardList className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Forms Found</h3>
          <p className="text-staff-secondary mb-4">
            {filter === 'ALL' 
              ? "You haven't created any sign-up forms yet."
              : `No ${filter.toLowerCase()} forms found.`}
          </p>
          {filter === 'ALL' && (
            <Link
              href="/Fq6pm72NjqUA/admin/forms/new"
              className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
            >
              Create Your First Form
            </Link>
          )}
        </div>
      ) : (
        <div className="staff-card rounded-xl overflow-hidden">
          <table className="staff-table w-full">
            <thead>
              <tr>
                <th>Form Title</th>
                <th>Submissions</th>
                <th>Deadline</th>
                <th>Status</th>
                <th>Public</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-white/5 transition-colors">
                  <td>
                    <div>
                      <p className="font-medium text-white">{form.title}</p>
                      {form.description && (
                        <p className="text-xs text-staff-muted line-clamp-1">{form.description}</p>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="flex items-center gap-1 text-staff-secondary">
                      <Users className="w-4 h-4" />
                      {form.submissionCount || 0}
                      {form.maxEntries && ` / ${form.maxEntries}`}
                    </span>
                  </td>
                  <td className="text-staff-secondary">
                    {form.deadline ? formatDate(form.deadline) : '-'}
                  </td>
                  <td>{getStatusBadge(form)}</td>
                  <td>
                    {form.isActive ? (
                      <span className="text-green-400 text-sm">Yes</span>
                    ) : (
                      <span className="text-gray-400 text-sm">No</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/Fq6pm72NjqUA/admin/forms/${form.id}`}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(form.id)}
                        disabled={deleting === form.id}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleting === form.id ? (
                          <div className="staff-spinner w-4 h-4"></div>
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
