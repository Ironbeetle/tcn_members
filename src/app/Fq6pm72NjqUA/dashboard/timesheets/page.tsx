'use client'

/**
 * Timesheet Page
 * 
 * Create and manage personal timesheets.
 */

import { useEffect, useState, useMemo } from 'react'
import { Clock, Save, Send, ChevronLeft, ChevronRight, Calendar, AlertCircle, CheckCircle } from 'lucide-react'
import { useStaffAuth } from '../../contexts/StaffAuthContext'
import { timesheetsApi, Timesheet, DayEntry } from '../../lib/api'
import HelpTooltip from '../../components/HelpTooltip'
import { 
  getPayPeriodDates, 
  getPayPeriodDays, 
  isWeekend, 
  formatDate, 
  calculateHours,
  SCHEDULE_PRESETS,
  getStatusClass,
  cn 
} from '../../lib/utils'
import { toast } from 'sonner'

export default function TimesheetsPage() {
  const { user } = useStaffAuth()
  const [currentPeriod, setCurrentPeriod] = useState(getPayPeriodDates())
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null)
  const [dailyHours, setDailyHours] = useState<Record<string, DayEntry>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const days = useMemo(() => 
    getPayPeriodDays(currentPeriod.start, currentPeriod.end), 
    [currentPeriod]
  )

  useEffect(() => {
    if (user) {
      fetchTimesheet()
    }
  }, [user, currentPeriod])

  const fetchTimesheet = async () => {
    setLoading(true)
    try {
      const res = await timesheetsApi.getByUser(user!.id)
      if (res.success && res.data) {
        // API returns { timesheets: [...], count, total, pagination }
        const data = res.data as any
        const timesheets: Timesheet[] = Array.isArray(data) ? data : data.timesheets || []
        const existing = timesheets.find(ts => {
          const tsStart = new Date(ts.payPeriodStart)
          return tsStart.toDateString() === currentPeriod.start.toDateString()
        })
        
        if (existing) {
          setTimesheet(existing)
          setDailyHours(existing.dailyHours || {})
        } else {
          setTimesheet(null)
          setDailyHours({})
        }
      }
    } catch (error) {
      console.error('Failed to fetch timesheet:', error)
      toast.error('Failed to load timesheet')
    } finally {
      setLoading(false)
    }
  }

  const navigatePeriod = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentPeriod.start)
    newDate.setDate(newDate.getDate() + (direction === 'prev' ? -14 : 14))
    setCurrentPeriod(getPayPeriodDates(newDate))
  }

  const updateDayEntry = (dateKey: string, field: keyof DayEntry, value: string | number) => {
    setDailyHours(prev => {
      const existing = prev[dateKey] || { startTime: '', endTime: '', breakMinutes: 0, totalHours: 0 }
      const updated = { ...existing, [field]: value }
      
      // Recalculate hours
      if (updated.startTime && updated.endTime) {
        updated.totalHours = calculateHours(updated.startTime, updated.endTime, updated.breakMinutes)
      }
      
      return { ...prev, [dateKey]: updated }
    })
  }

  const applyPreset = (dateKey: string, preset: typeof SCHEDULE_PRESETS[number]) => {
    setDailyHours(prev => ({
      ...prev,
      [dateKey]: {
        startTime: preset.start,
        endTime: preset.end,
        breakMinutes: preset.break,
        totalHours: calculateHours(preset.start, preset.end, preset.break),
      }
    }))
  }

  const applyPresetToWeekdays = (preset: typeof SCHEDULE_PRESETS[number]) => {
    const updates: Record<string, DayEntry> = {}
    days.forEach(day => {
      if (!isWeekend(day)) {
        const dateKey = day.toISOString().split('T')[0]
        updates[dateKey] = {
          startTime: preset.start,
          endTime: preset.end,
          breakMinutes: preset.break,
          totalHours: calculateHours(preset.start, preset.end, preset.break),
        }
      }
    })
    setDailyHours(prev => ({ ...prev, ...updates }))
  }

  const totalHours = useMemo(() => {
    return Object.values(dailyHours).reduce((sum, day) => sum + (day.totalHours || 0), 0)
  }, [dailyHours])

  const handleSave = async () => {
    if (!user) return
    
    setSaving(true)
    try {
      const data = {
        userId: user.id,
        payPeriodStart: currentPeriod.start.toISOString(),
        payPeriodEnd: currentPeriod.end.toISOString(),
        dailyHours,
        regularHours: Math.min(totalHours, 80),
        totalHours,
        status: 'DRAFT' as const,
      }

      const res = await timesheetsApi.save(data)
      if (res.success && res.data) {
        setTimesheet(res.data)
        toast.success('Timesheet saved')
      } else {
        toast.error(res.error || 'Failed to save timesheet')
      }
    } catch (error) {
      toast.error('Failed to save timesheet')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!timesheet) {
      // Save first
      await handleSave()
    }
    
    if (!timesheet?.id) {
      toast.error('Please save the timesheet first')
      return
    }

    setSubmitting(true)
    try {
      const res = await timesheetsApi.submit(timesheet.id)
      if (res.success) {
        setTimesheet(prev => prev ? { ...prev, status: 'SUBMITTED' } : null)
        toast.success('Timesheet submitted for approval')
      } else {
        toast.error(res.error || 'Failed to submit timesheet')
      }
    } catch (error) {
      toast.error('Failed to submit timesheet')
    } finally {
      setSubmitting(false)
    }
  }

  const canEdit = !timesheet?.status || timesheet.status === 'DRAFT' || timesheet.status === 'REJECTED'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="staff-card rounded-xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Timesheets</h1>
              <p className="text-staff-secondary">Track your work hours</p>
            </div>
          </div>

          {/* Period Navigator */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigatePeriod('prev')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-white/5 rounded-lg flex items-center gap-2">
              <Calendar className="w-4 h-4 text-staff-muted" />
              <span className="text-sm font-medium">
                {formatDate(currentPeriod.start)} - {formatDate(currentPeriod.end)}
              </span>
            </div>
            <button
              onClick={() => navigatePeriod('next')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Banner */}
      {timesheet?.status && timesheet.status !== 'DRAFT' && (
        <div className={cn(
          "p-4 rounded-xl flex items-center gap-3",
          timesheet.status === 'SUBMITTED' && "bg-yellow-500/10 border border-yellow-500/20",
          timesheet.status === 'APPROVED' && "bg-green-500/10 border border-green-500/20",
          timesheet.status === 'REJECTED' && "bg-red-500/10 border border-red-500/20"
        )}>
          {timesheet.status === 'APPROVED' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className={cn(
              "w-5 h-5",
              timesheet.status === 'SUBMITTED' ? "text-yellow-500" : "text-red-500"
            )} />
          )}
          <div>
            <p className={cn(
              "font-medium",
              timesheet.status === 'SUBMITTED' && "text-yellow-500",
              timesheet.status === 'APPROVED' && "text-green-500",
              timesheet.status === 'REJECTED' && "text-red-500"
            )}>
              {timesheet.status === 'SUBMITTED' && 'Pending Approval'}
              {timesheet.status === 'APPROVED' && 'Approved'}
              {timesheet.status === 'REJECTED' && 'Rejected'}
            </p>
            {timesheet.rejectionReason && (
              <p className="text-sm text-staff-secondary mt-1">Reason: {timesheet.rejectionReason}</p>
            )}
          </div>
        </div>
      )}

      {loading ? (
        <div className="staff-card rounded-xl p-8 text-center">
          <div className="staff-spinner w-10 h-10 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Quick Fill Presets */}
          {canEdit && (
            <div className="staff-card rounded-xl p-4">
              <p className="text-sm text-staff-secondary mb-3">Quick Fill All Weekdays:<HelpTooltip text="Select a preset to auto-fill start/end times for all weekdays in this pay period. You can still edit individual days after." /></p>
              <div className="flex flex-wrap gap-2">
                {SCHEDULE_PRESETS.map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => applyPresetToWeekdays(preset)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Timesheet Grid */}
          <div className="staff-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="staff-table w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="w-32">Date</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Break</th>
                    <th>Hours</th>
                    {canEdit && <th className="w-24">Preset</th>}
                  </tr>
                </thead>
                <tbody>
                  {days.map((day) => {
                    const dateKey = day.toISOString().split('T')[0]
                    const entry = dailyHours[dateKey] || { startTime: '', endTime: '', breakMinutes: 0, totalHours: 0 }
                    const weekend = isWeekend(day)
                    
                    return (
                      <tr key={dateKey} className={weekend ? 'bg-white/2' : ''}>
                        <td className={cn("font-medium", weekend && "text-staff-muted")}>
                          {day.toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </td>
                        <td>
                          <input
                            type="time"
                            value={entry.startTime}
                            onChange={(e) => updateDayEntry(dateKey, 'startTime', e.target.value)}
                            disabled={!canEdit}
                            className="staff-input px-2 py-1 rounded w-28 text-sm disabled:opacity-50"
                          />
                        </td>
                        <td>
                          <input
                            type="time"
                            value={entry.endTime}
                            onChange={(e) => updateDayEntry(dateKey, 'endTime', e.target.value)}
                            disabled={!canEdit}
                            className="staff-input px-2 py-1 rounded w-28 text-sm disabled:opacity-50"
                          />
                        </td>
                        <td>
                          <select
                            value={entry.breakMinutes}
                            onChange={(e) => updateDayEntry(dateKey, 'breakMinutes', parseInt(e.target.value))}
                            disabled={!canEdit}
                            className="staff-input px-2 py-1 rounded text-sm disabled:opacity-50"
                          >
                            <option value={0}>0 min</option>
                            <option value={30}>30 min</option>
                            <option value={60}>60 min</option>
                            <option value={90}>90 min</option>
                          </select>
                        </td>
                        <td className="font-medium">
                          {entry.totalHours > 0 ? `${entry.totalHours.toFixed(1)}h` : '-'}
                        </td>
                        {canEdit && (
                          <td>
                            <select
                              value=""
                              onChange={(e) => {
                                const preset = SCHEDULE_PRESETS.find(p => p.label === e.target.value)
                                if (preset) applyPreset(dateKey, preset)
                              }}
                              className="staff-input px-2 py-1 rounded text-sm w-full"
                            >
                              <option value="">Preset</option>
                              {SCHEDULE_PRESETS.map(p => (
                                <option key={p.label} value={p.label}>{p.label}</option>
                              ))}
                            </select>
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-staff-card-hover font-medium">
                    <td colSpan={4} className="text-right">Total Hours:</td>
                    <td className="text-staff-accent text-lg">{totalHours.toFixed(1)}h</td>
                    {canEdit && <td></td>}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            <div className="flex flex-wrap gap-4">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <div className="staff-spinner w-5 h-5"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                Save Draft
              </button>
              
              <button
                onClick={handleSubmit}
                disabled={submitting || totalHours === 0}
                className="flex-1 sm:flex-none btn-staff-primary px-6 py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="staff-spinner w-5 h-5"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Submit for Approval
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
