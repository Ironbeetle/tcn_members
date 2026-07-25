'use client'

/**
 * Admin Travel Forms Manager
 * 
 * Review and approve/reject travel expense claims.
 */

import { useEffect, useState } from 'react'
import { Plane, CheckCircle, XCircle, Eye, Search, DollarSign } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { travelFormsApi, TravelForm } from '../../lib/api'
import { formatDate, formatCurrency, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function AdminTravelPage() {
  const { user } = useStaffAuth()
  const [forms, setForms] = useState<TravelForm[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('SUBMITTED')
  const [search, setSearch] = useState('')
  const [selectedForm, setSelectedForm] = useState<TravelForm | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  useEffect(() => {
    fetchForms()
  }, [])

  const fetchForms = async () => {
    try {
      const res = await travelFormsApi.getAll()
      if (res.success && res.data) {
        // API returns { forms: [...], count, total, pagination }
        const tfData = res.data as any
        const formsData = Array.isArray(tfData) ? tfData : tfData.forms || []
        setForms(formsData)
      }
    } catch (error) {
      console.error('Failed to fetch travel forms:', error)
      toast.error('Failed to load travel forms')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!user) return
    
    setProcessing(id)
    try {
      const res = await travelFormsApi.approve(id, user.id)
      if (res.success) {
        toast.success('Travel form approved')
        setForms(prev => prev.map(f => 
          f.id === id ? { ...f, status: 'APPROVED', approvedBy: user.id } : f
        ))
        setSelectedForm(null)
      } else {
        toast.error(res.error || 'Failed to approve')
      }
    } catch (error) {
      toast.error('Failed to approve travel form')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (id: string) => {
    if (!user || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    
    setProcessing(id)
    try {
      const res = await travelFormsApi.reject(id, user.id, rejectionReason)
      if (res.success) {
        toast.success('Travel form rejected')
        setForms(prev => prev.map(f => 
          f.id === id ? { ...f, status: 'REJECTED', rejectionReason } : f
        ))
        setShowRejectModal(null)
        setRejectionReason('')
        setSelectedForm(null)
      } else {
        toast.error(res.error || 'Failed to reject')
      }
    } catch (error) {
      toast.error('Failed to reject travel form')
    } finally {
      setProcessing(null)
    }
  }

  const filteredForms = forms.filter(f => {
    if (filter !== 'ALL' && f.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const userName = `${f.user?.first_name || ''} ${f.user?.last_name || ''}`.toLowerCase()
      const destination = f.destination?.toLowerCase() || ''
      return userName.includes(searchLower) || destination.includes(searchLower)
    }
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'text-green-400 bg-green-500/20'
      case 'REJECTED': return 'text-red-400 bg-red-500/20'
      case 'SUBMITTED': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-gray-400 bg-gray-500/20'
    }
  }

  const statusCounts = {
    ALL: forms.length,
    SUBMITTED: forms.filter(f => f.status === 'SUBMITTED').length,
    APPROVED: forms.filter(f => f.status === 'APPROVED').length,
    REJECTED: forms.filter(f => f.status === 'REJECTED').length,
  }

  const totalPending = forms
    .filter(f => f.status === 'SUBMITTED')
    .reduce((sum, f) => sum + (f.grandTotal || 0), 0)

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
              <h1 className="text-xl font-bold text-white">Travel Forms Manager</h1>
              <p className="text-staff-secondary">Review and approve travel expense claims</p>
            </div>
          </div>

          {statusCounts.SUBMITTED > 0 && (
            <div className="text-right">
              <p className="text-sm text-staff-muted">Pending Approval</p>
              <p className="text-xl font-bold text-staff-accent">{formatCurrency(totalPending)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-2">
          {(['SUBMITTED', 'ALL', 'APPROVED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                filter === status
                  ? "bg-staff-accent text-[#1F2937]"
                  : "bg-white/5 text-staff-secondary hover:bg-white/10"
              )}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-white/20 text-xs">
                {statusCounts[status]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-xs relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-staff-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or destination..."
            className="staff-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredForms.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <Plane className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Travel Forms</h3>
          <p className="text-staff-secondary">
            {filter === 'SUBMITTED' 
              ? 'No travel forms pending approval.'
              : `No ${filter.toLowerCase()} travel forms found.`}
          </p>
        </div>
      ) : (
        <div className="staff-card rounded-xl overflow-hidden">
          <table className="staff-table w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Destination</th>
                <th>Travel Dates</th>
                <th>Amount</th>
                <th>Status</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredForms.map((form) => (
                <tr key={form.id} className="hover:bg-white/5 transition-colors">
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {form.user?.first_name} {form.user?.last_name}
                      </p>
                      <p className="text-xs text-staff-muted">{form.user?.department}</p>
                    </div>
                  </td>
                  <td className="text-white">{form.destination}</td>
                  <td className="text-staff-secondary">
                    {formatDate(form.departureDate)} - {formatDate(form.returnDate)}
                  </td>
                  <td className="font-medium text-staff-accent">
                    {formatCurrency(form.grandTotal)}
                  </td>
                  <td>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(form.status)
                    )}>
                      {form.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedForm(form)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {form.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(form.id)}
                            disabled={processing === form.id}
                            className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowRejectModal(form.id)}
                            disabled={processing === form.id}
                            className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Travel Form Detail Modal */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <div>
                <h3 className="text-white font-medium">
                  {selectedForm.user?.first_name} {selectedForm.user?.last_name}'s Travel Claim
                </h3>
                <p className="text-sm text-staff-muted">
                  {selectedForm.destination} • {formatDate(selectedForm.departureDate)} - {formatDate(selectedForm.returnDate)}
                </p>
              </div>
              <button
                onClick={() => setSelectedForm(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4 space-y-4">
              {selectedForm.reasonsForTravel && (
                <div>
                  <label className="block text-sm text-staff-muted mb-1">Reason for Travel</label>
                  <p className="text-white">{selectedForm.reasonsForTravel}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="staff-card rounded-lg p-3">
                  <p className="text-sm text-staff-muted">Transportation</p>
                  <p className="text-lg font-medium text-white">{formatCurrency((selectedForm.oneWayWinnipegTotal || 0) + (selectedForm.oneWayThompsonTotal || 0) + (selectedForm.publicTransportTotal || 0) + (selectedForm.taxiFareTotal || 0) + (selectedForm.parkingTotal || 0))}</p>
                </div>
                <div className="staff-card rounded-lg p-3">
                  <p className="text-sm text-staff-muted">Meals</p>
                  <p className="text-lg font-medium text-white">{formatCurrency((selectedForm.breakfastTotal || 0) + (selectedForm.lunchTotal || 0) + (selectedForm.dinnerTotal || 0))}</p>
                </div>
                <div className="staff-card rounded-lg p-3">
                  <p className="text-sm text-staff-muted">Accommodations</p>
                  <p className="text-lg font-medium text-white">{formatCurrency((selectedForm.hotelTotal || 0) + (selectedForm.privateTotal || 0))}</p>
                </div>
                <div className="staff-card rounded-lg p-3">
                  <p className="text-sm text-staff-muted">Incidentals</p>
                  <p className="text-lg font-medium text-white">{formatCurrency(selectedForm.incidentalTotal || 0)}</p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-staff-accent/10 border border-staff-accent/20">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Grand Total</span>
                  <span className="text-2xl font-bold text-staff-accent">{formatCurrency(selectedForm.grandTotal)}</span>
                </div>
              </div>

              {selectedForm.status === 'SUBMITTED' && (
                <div className="flex gap-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleApprove(selectedForm.id)}
                    disabled={processing === selectedForm.id}
                    className="flex-1 btn-staff-primary py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === selectedForm.id ? (
                      <div className="staff-spinner w-4 h-4"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(selectedForm.id)
                      setSelectedForm(null)
                    }}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center gap-2 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-md">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-white font-medium">Reject Travel Form</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-staff-secondary mb-2">Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this travel form is being rejected..."
                  rows={4}
                  className="staff-input w-full px-4 py-3 rounded-lg resize-none"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowRejectModal(null)
                    setRejectionReason('')
                  }}
                  className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReject(showRejectModal)}
                  disabled={processing === showRejectModal || !rejectionReason.trim()}
                  className="flex-1 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {processing === showRejectModal ? (
                    <div className="staff-spinner w-4 h-4"></div>
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
