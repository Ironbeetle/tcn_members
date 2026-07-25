'use client'

/**
 * Sign-up Forms Dashboard
 * 
 * View and manage event sign-up forms and submissions.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ClipboardList, Plus, Eye, Users, Calendar, ChevronRight } from 'lucide-react'
import { signupFormsApi, SignUpForm } from '../../lib/api'
import { formatDate, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function FormsPage() {
  const [forms, setForms] = useState<SignUpForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL')

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const res = await signupFormsApi.getAll()
      if (res.success && res.data) {
        // API returns { forms: [...], count: ... }
        const formsData = (res.data as any).forms || res.data
        // Sort by date, newest first
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
              <h1 className="text-xl font-bold text-white">Sign-up Forms</h1>
              <p className="text-staff-secondary">Manage event registrations and submissions</p>
            </div>
          </div>

          <Link
            href="/Fq6pm72NjqUA/dashboard/forms/new"
            className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create Form
          </Link>
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
              href="/Fq6pm72NjqUA/dashboard/forms/new"
              className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
            >
              Create Your First Form
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredForms.map((form) => (
            <Link
              key={form.id}
              href={`/Fq6pm72NjqUA/dashboard/forms/${form.id}`}
              className="staff-card rounded-xl p-5 hover:border-staff-accent/50 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-white truncate">{form.title}</h3>
                    {getStatusBadge(form)}
                  </div>
                  {form.description && (
                    <p className="text-sm text-staff-secondary line-clamp-2">{form.description}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-staff-muted group-hover:text-staff-accent transition-colors shrink-0 ml-4" />
              </div>

              <div className="flex items-center gap-4 text-sm text-staff-muted">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>
                    {form.submissionCount || 0}
                    {form.maxEntries && ` / ${form.maxEntries}`} submissions
                  </span>
                </div>
                {form.deadline && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Due {formatDate(form.deadline)}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
