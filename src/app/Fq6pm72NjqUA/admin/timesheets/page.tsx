'use client'

/**
 * Admin Timesheets Manager
 * 
 * Review and approve/reject staff timesheets.
 */

import { useEffect, useState } from 'react'
import { Clock, CheckCircle, XCircle, Eye, Search, Filter } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { timesheetsApi, Timesheet } from '../../lib/api'
import { formatDate, getPayPeriodDates, cn } from '../../lib/utils'
import { toast } from 'sonner'

export default function AdminTimesheetsPage() {
  const { user } = useStaffAuth()
  const [timesheets, setTimesheets] = useState<Timesheet[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('SUBMITTED')
  const [search, setSearch] = useState('')
  const [selectedTimesheet, setSelectedTimesheet] = useState<Timesheet | null>(null)
  const [processing, setProcessing] = useState<string | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null)

  useEffect(() => {
    fetchTimesheets()
  }, [])

  const fetchTimesheets = async () => {
    try {
      const res = await timesheetsApi.getAll()
      if (res.success && res.data) {
        // API returns { timesheets: [...], count, total, pagination }
        const tsData = res.data as any
        const sheets = Array.isArray(tsData) ? tsData : tsData.timesheets || []
        setTimesheets(sheets)
      }
    } catch (error) {
      console.error('Failed to fetch timesheets:', error)
      toast.error('Failed to load timesheets')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    if (!user) return
    
    setProcessing(id)
    try {
      const res = await timesheetsApi.approve(id, user.id)
      if (res.success) {
        toast.success('Timesheet approved')
        setTimesheets(prev => prev.map(ts => 
          ts.id === id ? { ...ts, status: 'APPROVED', approvedBy: user.id } : ts
        ))
        setSelectedTimesheet(null)
      } else {
        toast.error(res.error || 'Failed to approve')
      }
    } catch (error) {
      toast.error('Failed to approve timesheet')
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
      const res = await timesheetsApi.reject(id, user.id, rejectionReason)
      if (res.success) {
        toast.success('Timesheet rejected')
        setTimesheets(prev => prev.map(ts => 
          ts.id === id ? { ...ts, status: 'REJECTED', rejectionReason } : ts
        ))
        setShowRejectModal(null)
        setRejectionReason('')
        setSelectedTimesheet(null)
      } else {
        toast.error(res.error || 'Failed to reject')
      }
    } catch (error) {
      toast.error('Failed to reject timesheet')
    } finally {
      setProcessing(null)
    }
  }

  const filteredTimesheets = timesheets.filter(ts => {
    if (filter !== 'ALL' && ts.status !== filter) return false
    if (search) {
      const searchLower = search.toLowerCase()
      const userName = `${ts.user?.first_name || ''} ${ts.user?.last_name || ''}`.toLowerCase()
      return userName.includes(searchLower)
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
    ALL: timesheets.length,
    SUBMITTED: timesheets.filter(ts => ts.status === 'SUBMITTED').length,
    APPROVED: timesheets.filter(ts => ts.status === 'APPROVED').length,
    REJECTED: timesheets.filter(ts => ts.status === 'REJECTED').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Timesheet Manager</h1>
            <p className="text-staff-secondary">Review and approve staff timesheets</p>
          </div>
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
            placeholder="Search by name..."
            className="staff-input w-full pl-10 pr-4 py-2 rounded-lg text-sm"
          />
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : filteredTimesheets.length === 0 ? (
        <div className="staff-card rounded-xl p-12 text-center">
          <Clock className="w-16 h-16 mx-auto text-staff-muted mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Timesheets</h3>
          <p className="text-staff-secondary">
            {filter === 'SUBMITTED' 
              ? 'No timesheets pending approval.'
              : `No ${filter.toLowerCase()} timesheets found.`}
          </p>
        </div>
      ) : (
        <div className="staff-card rounded-xl overflow-hidden">
          <table className="staff-table w-full">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Pay Period</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Submitted</th>
                <th className="w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTimesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-white/5 transition-colors">
                  <td>
                    <div>
                      <p className="font-medium text-white">
                        {ts.user?.first_name} {ts.user?.last_name}
                      </p>
                      <p className="text-xs text-staff-muted">{ts.user?.department}</p>
                    </div>
                  </td>
                  <td className="text-staff-secondary">
                    {formatDate(ts.payPeriodStart)} - {formatDate(ts.payPeriodEnd)}
                  </td>
                  <td className="font-medium text-staff-accent">
                    {ts.totalHours?.toFixed(1)}h
                  </td>
                  <td>
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-xs font-medium",
                      getStatusColor(ts.status)
                    )}>
                      {ts.status}
                    </span>
                  </td>
                  <td className="text-staff-muted text-sm">
                    {ts.submittedAt ? formatDate(ts.submittedAt) : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedTimesheet(ts)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-staff-muted hover:text-white transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {ts.status === 'SUBMITTED' && (
                        <>
                          <button
                            onClick={() => handleApprove(ts.id)}
                            disabled={processing === ts.id}
                            className="p-1.5 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 transition-colors disabled:opacity-50"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowRejectModal(ts.id)}
                            disabled={processing === ts.id}
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

      {/* Timesheet Detail Modal */}
      {selectedTimesheet && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="staff-card rounded-xl w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="p-4 border-b border-white/10 flex items-center justify-between sticky top-0 bg-inherit">
              <div>
                <h3 className="text-white font-medium">
                  {selectedTimesheet.user?.first_name} {selectedTimesheet.user?.last_name}'s Timesheet
                </h3>
                <p className="text-sm text-staff-muted">
                  {formatDate(selectedTimesheet.payPeriodStart)} - {formatDate(selectedTimesheet.payPeriodEnd)}
                </p>
              </div>
              <button
                onClick={() => setSelectedTimesheet(null)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                ×
              </button>
            </div>
            <div className="p-4">
              {selectedTimesheet.dailyHours && (
                <table className="staff-table w-full text-sm">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Break</th>
                      <th>Hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(selectedTimesheet.dailyHours).map(([date, entry]) => (
                      <tr key={date}>
                        <td>{formatDate(date)}</td>
                        <td>{entry.startTime || '-'}</td>
                        <td>{entry.endTime || '-'}</td>
                        <td>{entry.breakMinutes}m</td>
                        <td className="font-medium">{entry.totalHours?.toFixed(1)}h</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-staff-card-hover font-medium">
                      <td colSpan={4} className="text-right">Total:</td>
                      <td className="text-staff-accent">{selectedTimesheet.totalHours?.toFixed(1)}h</td>
                    </tr>
                  </tfoot>
                </table>
              )}

              {selectedTimesheet.status === 'SUBMITTED' && (
                <div className="flex gap-4 mt-6 pt-4 border-t border-white/10">
                  <button
                    onClick={() => handleApprove(selectedTimesheet.id)}
                    disabled={processing === selectedTimesheet.id}
                    className="flex-1 btn-staff-primary py-2 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processing === selectedTimesheet.id ? (
                      <div className="staff-spinner w-4 h-4"></div>
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      setShowRejectModal(selectedTimesheet.id)
                      setSelectedTimesheet(null)
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
              <h3 className="text-white font-medium">Reject Timesheet</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm text-staff-secondary mb-2">Reason for Rejection *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this timesheet is being rejected..."
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
