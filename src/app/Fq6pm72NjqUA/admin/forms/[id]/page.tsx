'use client'

/**
 * Admin Form Detail Page
 * 
 * View form details and manage submissions.
 */

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Trash2, Download, Users, Calendar, Eye, Clock } from 'lucide-react'
import { signupFormsApi, SignUpForm, FormSubmission, FormField } from '../../../lib/api'
import { formatDate, cn } from '../../../lib/utils'
import { toast } from 'sonner'

export default function AdminFormDetailPage() {
  const params = useParams()
  const router = useRouter()
  const formId = params.id as string
  
  const [form, setForm] = useState<SignUpForm | null>(null)
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [deletingSub, setDeletingSub] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null)

  useEffect(() => {
    if (formId) {
      fetchForm()
      fetchSubmissions()
    }
  }, [formId])

  const fetchForm = async () => {
    try {
      const res = await signupFormsApi.getById(formId)
      if (res.success && res.data) {
        // Handle nested response if present
        const formData = (res.data as any).form || res.data
        setForm(formData)
      } else {
        toast.error('Form not found')
        router.push('/Fq6pm72NjqUA/admin/forms')
      }
    } catch (error) {
      console.error('Failed to fetch form:', error)
      toast.error('Failed to load form')
    } finally {
      setLoading(false)
    }
  }

  const fetchSubmissions = async () => {
    try {
      const res = await signupFormsApi.getSubmissions(formId)
      if (res.success && res.data) {
        // API returns { submissions: [...], count: ..., ... }
        const subsData = (res.data as any).submissions || res.data
        setSubmissions(Array.isArray(subsData) ? subsData : [])
      }
    } catch (error) {
      console.error('Failed to fetch submissions:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this form? This action cannot be undone.')) {
      return
    }

    setDeleting(true)
    try {
      const res = await signupFormsApi.delete(formId)
      if (res.success) {
        toast.success('Form deleted')
        router.push('/Fq6pm72NjqUA/admin/forms')
      } else {
        toast.error(res.error || 'Failed to delete form')
      }
    } catch (error) {
      toast.error('Failed to delete form')
    } finally {
      setDeleting(false)
    }
  }

  const handleDeleteSubmission = async (subId: string) => {
    if (!confirm('Delete this submission?')) return

    setDeletingSub(subId)
    try {
      const res = await signupFormsApi.deleteSubmission(subId)
      if (res.success) {
        toast.success('Submission deleted')
        setSubmissions(prev => prev.filter(s => s.id !== subId))
      } else {
        toast.error(res.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete submission')
    } finally {
      setDeletingSub(null)
    }
  }

  const exportSubmissions = () => {
    if (submissions.length === 0) {
      toast.error('No submissions to export')
      return
    }

    const fields = form?.fields || []
    const headers = ['Submitted At', ...fields.map((f: FormField) => f.label)]
    const rows = submissions.map(sub => [
      formatDate(sub.submittedAt),
      ...fields.map((f: FormField) => sub.data[f.fieldId] || '')
    ])

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `${form?.title || 'form'}_submissions.csv`
    a.click()
    
    URL.revokeObjectURL(url)
    toast.success('Submissions exported')
  }

  const isFormActive = () => {
    if (!form) return false
    const now = new Date()
    const deadline = form.deadline ? new Date(form.deadline) : null
    if (deadline && deadline < now) return false
    if (form.maxEntries && submissions.length >= form.maxEntries) return false
    return true
  }

  if (loading) {
    return (
      <div className="staff-card rounded-xl p-8 text-center">
        <div className="staff-spinner w-10 h-10 mx-auto"></div>
      </div>
    )
  }

  if (!form) {
    return (
      <div className="staff-card rounded-xl p-12 text-center">
        <p className="text-staff-secondary">Form not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/Fq6pm72NjqUA/admin/forms')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-bold text-white">{form.title}</h1>
                {isFormActive() ? (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-xs bg-gray-500/20 text-gray-400">Closed</span>
                )}
              </div>
              {form.description && (
                <p className="text-staff-secondary text-sm">{form.description}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href={`/Fq6pm72NjqUA/admin/forms/${formId}/edit`}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white flex items-center gap-2 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {deleting ? <div className="staff-spinner w-4 h-4"></div> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="staff-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{submissions.length}</p>
              <p className="text-sm text-staff-muted">Submissions</p>
            </div>
          </div>
        </div>
        
        <div className="staff-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{form.fields?.length || 0}</p>
              <p className="text-sm text-staff-muted">Fields</p>
            </div>
          </div>
        </div>

        <div className="staff-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {form.deadline ? formatDate(form.deadline) : 'No deadline'}
              </p>
              <p className="text-sm text-staff-muted">Deadline</p>
            </div>
          </div>
        </div>

        <div className="staff-card rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {form.maxEntries ? `${form.maxEntries - submissions.length} left` : 'Unlimited'}
              </p>
              <p className="text-sm text-staff-muted">Spots</p>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions */}
      <div className="staff-card rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-white font-medium">Submissions</h2>
          {submissions.length > 0 && (
            <button
              onClick={exportSubmissions}
              className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          )}
        </div>

        {submissions.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-staff-muted mb-3" />
            <p className="text-staff-secondary">No submissions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="staff-table w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-48">Submitted</th>
                  {(form.fields || []).slice(0, 3).map((field: FormField) => (
                    <th key={field.fieldId}>{field.label}</th>
                  ))}
                  <th className="w-32">Actions</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/5">
                    <td className="text-staff-muted">{formatDate(sub.submittedAt)}</td>
                    {(form.fields || []).slice(0, 3).map((field: FormField) => (
                      <td key={field.fieldId} className="truncate max-w-[200px]">
                        {sub.data[field.fieldId] || '-'}
                      </td>
                    ))}
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={() => setSelectedSubmission(sub)}
                          className="text-staff-accent text-sm hover:underline"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDeleteSubmission(sub.id)}
                          disabled={deletingSub === sub.id}
                          className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400 ml-2 disabled:opacity-50"
                        >
                          {deletingSub === sub.id ? (
                            <div className="staff-spinner w-3 h-3"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
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

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-lg max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <h3 className="text-white font-medium">Submission Details</h3>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-staff-muted">
                Submitted {formatDate(selectedSubmission.submittedAt)}
              </div>
              {(form.fields || []).map((field: FormField) => (
                <div key={field.fieldId}>
                  <label className="block text-sm text-staff-secondary mb-1">{field.label}</label>
                  <div className="staff-input w-full px-4 py-2 rounded-lg">
                    {selectedSubmission.data[field.fieldId] || <span className="text-staff-muted">Not provided</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
