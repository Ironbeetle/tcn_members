/**
 * Utility functions for the staff app
 */

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { FORM_CATEGORY_OPTIONS } from '@/lib/category-constants'

// Tailwind merge helper
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================
// DATE/TIME UTILITIES
// ============================================

/**
 * Format date for display
 */
export function formatDate(date: Date | string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  })
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '-'
  return d.toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format time from HH:mm string
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  const period = hours >= 12 ? 'PM' : 'AM'
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
}

/**
 * Get relative time string (e.g., "2 hours ago", "yesterday")
 */
export function getRelativeTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 172800) return 'yesterday'
  return formatDate(d)
}

// ============================================
// PAY PERIOD UTILITIES
// ============================================

const REFERENCE_DATE = new Date('2025-01-06') // Reference Monday for bi-weekly periods

/**
 * Get pay period start and end dates for a given date
 */
export function getPayPeriodDates(date: Date = new Date()): { start: Date; end: Date } {
  const daysSinceReference = Math.floor(
    (date.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  )
  const periodIndex = Math.floor(daysSinceReference / 14)

  const periodStart = new Date(REFERENCE_DATE)
  periodStart.setDate(periodStart.getDate() + periodIndex * 14)

  const periodEnd = new Date(periodStart)
  periodEnd.setDate(periodEnd.getDate() + 13)

  return { start: periodStart, end: periodEnd }
}

/**
 * Get all days in a pay period
 */
export function getPayPeriodDays(start: Date, end: Date): Date[] {
  const days: Date[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

/**
 * Check if a date is a weekend
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 0 || day === 6
}

// ============================================
// TIMESHEET PRESETS
// ============================================

export const SCHEDULE_PRESETS = [
  { label: 'FT 8:30-4:30', start: '08:30', end: '16:30', break: 60 },
  { label: 'FT 9-5', start: '09:00', end: '17:00', break: 60 },
  { label: 'PT AM', start: '08:00', end: '12:00', break: 0 },
  { label: 'PT PM', start: '13:00', end: '17:00', break: 0 },
] as const

/**
 * Calculate hours worked from start/end time and break
 */
export function calculateHours(startTime: string, endTime: string, breakMinutes: number): number {
  const [startHour, startMin] = startTime.split(':').map(Number)
  const [endHour, endMin] = endTime.split(':').map(Number)
  
  const startMinutes = startHour * 60 + startMin
  const endMinutes = endHour * 60 + endMin
  
  const workedMinutes = endMinutes - startMinutes - breakMinutes
  return Math.max(0, Math.round((workedMinutes / 60) * 100) / 100)
}

// ============================================
// TRAVEL FORM DEFAULT RATES
// ============================================

export const DEFAULT_TRAVEL_RATES = {
  hotelRate: 200.0,
  privateRate: 50.0,
  breakfastRate: 20.5,
  lunchRate: 20.1,
  dinnerRate: 50.65,
  incidentalRate: 10.0,
  personalVehicleRate: 0.5, // Per km
  oneWayWinnipegKm: 904,
  oneWayThompsonKm: 150,
  winnipegFlatRate: 450.0, // Public transport
  thompsonFlatRate: 100.0,
  taxiFareRate: 17.3,
} as const

export const TRANSPORT_TYPES = [
  { value: 'PERSONAL_VEHICLE', label: 'Personal Vehicle' },
  { value: 'PUBLIC_TRANSPORT_WINNIPEG', label: 'Public Transport (Winnipeg)' },
  { value: 'PUBLIC_TRANSPORT_THOMPSON', label: 'Public Transport (Thompson)' },
  { value: 'COMBINATION', label: 'Combination' },
] as const

// ============================================
// SMS UTILITIES
// ============================================

/**
 * Calculate SMS segments based on message length
 * GSM-7: 160 chars per segment (153 if multi-segment)
 * Unicode: 70 chars per segment (67 if multi-segment)
 */
export function calculateSmsSegments(message: string): { chars: number; segments: number; isUnicode: boolean } {
  // Check if message contains non-GSM characters
  const gsmChars = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ !"#%&'()*+,\-./0-9:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà^{}\\[~\]|€]*$/
  const isUnicode = !gsmChars.test(message)
  
  const chars = message.length
  
  if (isUnicode) {
    if (chars <= 70) return { chars, segments: 1, isUnicode }
    return { chars, segments: Math.ceil(chars / 67), isUnicode }
  } else {
    if (chars <= 160) return { chars, segments: 1, isUnicode }
    return { chars, segments: Math.ceil(chars / 153), isUnicode }
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  return phone
}

// ============================================
// NUMBER UTILITIES
// ============================================

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
  }).format(amount)
}

/**
 * Parse currency input to number
 */
export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9.-]/g, '')) || 0
}

// ============================================
// STRING UTILITIES
// ============================================

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Get initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

/**
 * Capitalize first letter
 */
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// ============================================
// STATUS/BADGE UTILITIES
// ============================================

export const STATUS_COLORS = {
  DRAFT: 'bg-gray-500',
  SUBMITTED: 'bg-yellow-500',
  PENDING: 'bg-yellow-500',
  APPROVED: 'bg-green-500',
  REJECTED: 'bg-red-500',
} as const

export const PRIORITY_COLORS = {
  low: 'bg-green-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-400',
  urgent: 'bg-red-600 animate-pulse',
} as const

/**
 * Get status badge class
 */
export function getStatusClass(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-500'
}

/**
 * Get priority badge class
 */
export function getPriorityClass(priority: string): string {
  return PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || 'bg-gray-500'
}

// ============================================
// DEPARTMENT/ROLE UTILITIES
// ============================================

export const DEPARTMENTS = [
  ...FORM_CATEGORY_OPTIONS,
] as const

export const USER_ROLES = [
  { value: 'STAFF', label: 'Staff' },
  { value: 'STAFF_ADMIN', label: 'Staff Admin' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'COUNCIL', label: 'Council' },
] as const

/**
 * Get department label
 */
export function getDepartmentLabel(value: string): string {
  return DEPARTMENTS.find(d => d.value === value)?.label || value
}

/**
 * Get role label
 */
export function getRoleLabel(value: string): string {
  return USER_ROLES.find(r => r.value === value)?.label || value
}

// ============================================
// LOGO OPTIONS
// ============================================

export const LETTERHEAD_LOGOS = [
  { id: 'tcn-main', name: 'TCN', filename: 'tcn-main.png' },
  { id: 'jwhc-main', name: 'Health Center', filename: 'jwhc-main.png' },
  { id: 'cscmec-main', name: 'Education Center', filename: 'cscmec-main.png' },
] as const
