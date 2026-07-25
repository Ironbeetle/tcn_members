'use client'

/**
 * Travel Forms Page
 * 
 * Create and manage travel expense claims.
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plane, Plus, Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { travelFormsApi, TravelForm } from '../../lib/api'
import { formatDate, formatCurrency, getStatusClass, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function TravelFormsPage() {
  const { user } = useStaffAuth()
  const [forms, setForms] = useState<TravelForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('ALL')

  useEffect(() => {
    if (user) {
      fetchForms()
    }
  }, [user])

  const fetchForms = async () => {
    try {
      const res = await travelFormsApi.getByUser(user!.id)
      if (res.success && res.data) {
        // API returns { forms: [...], count, total, pagination }
        const tfData = res.data as any
        const formsData = Array.isArray(tfData) ? tfData : tfData.forms || []
        // Sort by date, newest first
        const sorted = formsData.sort((a: any, b: any) => 
          new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime()
        )
        setForms(sorted)
      }
    } catch (error) {
      console.error('Failed to fetch travel forms:', error)
      toast.error('Failed to load travel forms')
    } finally {
      setLoading(false)
    }
  }

  const filteredForms = forms.filter(form => {
    if (filter === 'ALL') return true
    return form.status === filter
  })

  const statusCounts = {
    ALL: forms.length,
    DRAFT: forms.filter(f => f.status === 'DRAFT').length,
    SUBMITTED: forms.filter(f => f.status === 'SUBMITTED').length,
    APPROVED: forms.filter(f => f.status === 'APPROVED').length,
    REJECTED: forms.filter(f => f.status === 'REJECTED').length,
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'REJECTED':
        return <XCircle className="w-4 h-4 text-red-500" />
      case 'SUBMITTED':
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <FileText className="w-4 h-4 text-gray-500" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
              <Plane className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Travel Forms</h1>
              <p className="text-staff-secondary">Manage your travel expense claims</p>
            </div>
          </div>

          <Link
            href="/Fq6pm72NjqUA/dashboard/travel/new"
            className="btn-staff-primary px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Travel Form
          </Link>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['ALL', 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'] as const).map((status) => (
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
            {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
              {statusCounts[status]}
            </span>
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
          <Plane className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {filter === 'ALL' ? 'No Travel Forms' : `No ${filter.toLowerCase()} forms`}
          </h3>
          <p className="text-staff-secondary mb-4">
            {filter === 'ALL' 
              ? "You haven't created any travel forms yet."
              : `You don't have any ${filter.toLowerCase()} travel forms.`}
          </p>
          {filter === 'ALL' && (
            <Link
              href="/Fq6pm72NjqUA/dashboard/travel/new"
              className="btn-staff-primary inline-flex px-4 py-2 rounded-lg"
            >
              Create Your First Form
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredForms.map((form) => (
            <Link
              key={form.id}
              href={`/Fq6pm72NjqUA/dashboard/travel/${form.id}`}
              className="staff-card rounded-xl p-4 flex items-center justify-between hover:border-staff-accent/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center",
                  form.status === 'APPROVED' && "bg-green-500/20",
                  form.status === 'REJECTED' && "bg-red-500/20",
                  form.status === 'SUBMITTED' && "bg-yellow-500/20",
                  form.status === 'DRAFT' && "bg-gray-500/20"
                )}>
                  <Plane className={cn(
                    "w-6 h-6",
                    form.status === 'APPROVED' && "text-green-500",
                    form.status === 'REJECTED' && "text-red-500",
                    form.status === 'SUBMITTED' && "text-yellow-500",
                    form.status === 'DRAFT' && "text-gray-500"
                  )} />
                </div>
                <div>
                  <h3 className="font-medium text-white">{form.destination}</h3>
                  <p className="text-sm text-staff-secondary">
                    {formatDate(form.departureDate)} - {formatDate(form.returnDate)}
                  </p>
                  {form.reasonsForTravel && (
                    <p className="text-xs text-staff-muted mt-1 line-clamp-1">
                      {form.reasonsForTravel}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-medium text-white">{formatCurrency(form.grandTotal)}</p>
                  <div className="flex items-center gap-1.5 justify-end mt-1">
                    {getStatusIcon(form.status)}
                    <span className={cn(
                      "text-xs font-medium",
                      form.status === 'APPROVED' && "text-green-500",
                      form.status === 'REJECTED' && "text-red-500",
                      form.status === 'SUBMITTED' && "text-yellow-500",
                      form.status === 'DRAFT' && "text-gray-500"
                    )}>
                      {form.status}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-staff-muted group-hover:text-staff-accent transition-colors" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
