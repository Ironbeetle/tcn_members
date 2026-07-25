/**
 * Staff App API Helper Functions
 * 
 * Centralized API calls for the staff web application.
 */

const CSRF_COOKIE_NAME = 'tcn_staff_csrf'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))

  if (!cookie) return null
  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
}

// Fetch wrapper with error handling and session auth
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const method = (options.method || 'GET').toUpperCase()
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME)
    const shouldSendCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    const baseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (shouldSendCsrf && csrfToken) {
      ;(baseHeaders as Record<string, string>)['x-csrf-token'] = csrfToken
    }
    
    const res = await fetch(endpoint, {
      ...options,
      credentials: 'same-origin',
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
    })

    const data = await res.json()

    if (!res.ok) {
      const firstIssue = Array.isArray(data?.details) ? data.details[0] : null
      const issueMessage = typeof firstIssue?.message === 'string' ? firstIssue.message : null
      const issuePath = Array.isArray(firstIssue?.path) && firstIssue.path.length > 0
        ? `${firstIssue.path.join('.')}: `
        : ''

      return {
        success: false,
        error: issueMessage
          ? `${issuePath}${issueMessage}`
          : (data.error || `Request failed with status ${res.status}`),
      }
    }

    return data
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    }
  }
}

// ============================================
// AUTH APIs
// ============================================

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch('/api/comm/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  logout: () =>
    apiFetch('/api/comm/auth/logout', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  verify: () =>
    apiFetch('/api/comm/auth/verify', {
      method: 'POST',
      body: JSON.stringify({}),
    }),

  resetRequest: (email: string) =>
    apiFetch('/api/comm/auth/reset-request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetComplete: (email: string, pin: string, newPassword: string) =>
    apiFetch('/api/comm/auth/reset-complete', {
      method: 'POST',
      body: JSON.stringify({ email, pin, newPassword }),
    }),
}

// ============================================
// USER MANAGEMENT APIs
// ============================================

export interface CommUser {
  id: string
  email: string
  first_name: string
  last_name: string
  department: string
  role: string
  created_at: string
  updated_at?: string
}

export const usersApi = {
  getAll: () => apiFetch<CommUser[]>('/api/comm/users'),

  getById: (id: string) => apiFetch<CommUser>(`/api/comm/users/${id}`),

  create: (userData: Partial<CommUser> & { password: string }) =>
    apiFetch<CommUser>('/api/comm/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  update: (id: string, userData: Partial<CommUser>) =>
    apiFetch<CommUser>(`/api/comm/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    }),

  delete: (id: string) =>
    apiFetch(`/api/comm/users/${id}`, { method: 'DELETE' }),

  changePassword: (id: string, newPassword: string) =>
    apiFetch(`/api/comm/users/${id}/password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword }),
    }),
}

// ============================================
// CONTACTS APIs (Read-only from member database)
// ============================================

export interface Contact {
  id: string
  firstName: string
  lastName: string
  name: string
  email?: string
  phone?: string
  community?: string
}

export interface ContactsParams {
  query?: string
  limit?: number
  page?: number
  sortBy?: 'name' | 'firstName' | 'lastName' | 'community'
  sortOrder?: 'asc' | 'desc'
  activated?: boolean
  fields?: 'both' | 'phone' | 'email'
  community?: string
}

export const contactsApi = {
  search: (params: ContactsParams) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.set(key, String(value))
      }
    })
    return apiFetch<{ contacts: Contact[]; total: number }>(
      `/api/sync/contacts?${searchParams.toString()}`
    )
  },

  getCommunities: () => apiFetch<string[]>('/api/sync/contacts/communities'),

  healthCheck: () => apiFetch('/api/sync/health'),
}

// ============================================
// SMS APIs
// ============================================

export interface SmsLogEntry {
  id: string
  message: string
  recipients: string[]
  status: 'sent' | 'failed'
  userId: string
  createdAt: string
}

export const smsApi = {
  send: (message: string, recipients: string[]) =>
    apiFetch('/api/comm/sms', {
      method: 'POST',
      body: JSON.stringify({ message, recipients }),
    }),

  getLogs: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return apiFetch<SmsLogEntry[]>(`/api/comm/sms-logs?${searchParams.toString()}`)
  },

  getStats: () => apiFetch('/api/comm/sms-logs/stats'),
}

// ============================================
// EMAIL APIs
// ============================================

export interface EmailLogEntry {
  id: string
  subject: string
  message: string
  recipients: string[]
  withLetterhead: boolean
  logoId?: string
  status: 'sent' | 'failed'
  userId: string
  createdAt: string
}

export const emailApi = {
  send: (data: {
    subject: string
    message: string
    recipients: string[]
    withLetterhead?: boolean
    logoId?: string
  }) =>
    apiFetch('/api/comm/email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLogs: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return apiFetch<EmailLogEntry[]>(`/api/comm/email-logs?${searchParams.toString()}`)
  },

  getStats: () => apiFetch('/api/comm/email-logs/stats'),
}

// ============================================
// BULLETIN BOARD APIs
// ============================================

export interface Bulletin {
  id: string
  title: string
  subject: string
  category: string
  content?: string | null
  poster_url?: string | null
  posterUrl?: string | null
  logoId?: string
  userId?: string
  created?: string
  updated?: string
}

export const bulletinApi = {
  list: (params?: { category?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    return apiFetch<{
      bulletins: Bulletin[]
      count: number
      total: number
      pagination: { limit: number; offset: number; hasMore: boolean }
    }>(`/api/comm/bulletin?${searchParams.toString()}`)
  },

  create: (data: Partial<Bulletin>) =>
    apiFetch<Bulletin>('/api/comm/bulletin', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<Bulletin>) =>
    apiFetch<Bulletin>(`/api/comm/bulletin/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch(`/api/comm/bulletin/${id}`, { method: 'DELETE' }),

  getById: (id: string) => apiFetch<Bulletin>(`/api/comm/bulletin/${id}`),

  getHistory: (params?: { page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    return apiFetch<Bulletin[]>(`/api/comm/bulletin/history?${searchParams.toString()}`)
  },

  getStats: () => apiFetch('/api/comm/bulletin/stats'),

  uploadPoster: (formData: FormData) => {
    const csrfToken = getCookieValue(CSRF_COOKIE_NAME)
    const headers: HeadersInit = {}
    if (csrfToken) {
      headers['x-csrf-token'] = csrfToken
    }
    return fetch('/api/comm/bulletin/poster', {
      method: 'POST',
      credentials: 'same-origin',
      headers,
      body: formData,
    }).then(res => res.json())
  },

  syncToPortal: (bulletinId: string) =>
    apiFetch('/api/sync/bulletin', {
      method: 'POST',
      body: JSON.stringify({ bulletinId }),
    }),
}

// ============================================
// SIGN-UP FORMS APIs
// ============================================

export interface FormField {
  fieldId: string
  label: string
  fieldType: 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'CHECKBOX'
  options?: string[]
  placeholder?: string
  required: boolean
  order: number
}

export interface SignUpForm {
  id: string
  title: string
  description?: string
  category: string
  deadline?: string
  maxEntries?: number
  isActive: boolean
  allowResubmit: boolean
  resubmitMessage?: string
  createdBy: string
  fields: FormField[]
  createdAt: string
  submissionCount?: number
}

export interface FormSubmission {
  id: string
  formId: string
  data: Record<string, any>
  submittedAt: string
  submittedBy?: string
}

export const signupFormsApi = {
  getAll: () => apiFetch<SignUpForm[]>('/api/comm/signup-forms'),

  getById: (id: string) => apiFetch<SignUpForm>(`/api/comm/signup-forms/${id}`),

  create: (formData: Partial<SignUpForm>) =>
    apiFetch<SignUpForm>('/api/comm/signup-forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  update: (id: string, formData: Partial<SignUpForm>) =>
    apiFetch<SignUpForm>(`/api/comm/signup-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    }),

  delete: (id: string) =>
    apiFetch(`/api/comm/signup-forms/${id}`, { method: 'DELETE' }),

  getSubmissions: (formId: string) =>
    apiFetch<FormSubmission[]>(`/api/comm/signup-forms/${formId}/submissions`),

  submitResponse: (formId: string, data: Record<string, any>) =>
    apiFetch(`/api/comm/signup-forms/${formId}/submissions`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteSubmission: (submissionId: string) =>
    apiFetch(`/api/comm/signup-forms/submissions/${submissionId}`, {
      method: 'DELETE',
    }),

  getStats: () => apiFetch('/api/comm/signup-forms/stats'),
}

// ============================================
// TIMESHEET APIs
// ============================================

export interface DayEntry {
  startTime: string
  endTime: string
  breakMinutes: number
  totalHours: number
}

export interface Timesheet {
  id: string
  userId: string
  payPeriodStart: string
  payPeriodEnd: string
  dailyHours: Record<string, DayEntry>
  regularHours: number
  totalHours: number
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  approvedAt?: string
  approverId?: string
  rejectedAt?: string
  rejecterId?: string
  rejectionReason?: string
  user?: {
    first_name: string
    last_name: string
    department: string
  }
}

export const timesheetsApi = {
  getAll: (params?: { status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    return apiFetch<Timesheet[]>(`/api/timesheets?${searchParams.toString()}`)
  },

  getById: (id: string) => apiFetch<Timesheet>(`/api/timesheets/${id}`),

  getByUser: (userId: string) =>
    apiFetch<Timesheet[]>(`/api/timesheets/user/${userId}`),

  save: (timesheetData: Partial<Timesheet>) =>
    apiFetch<Timesheet>('/api/timesheets', {
      method: 'POST',
      body: JSON.stringify(timesheetData),
    }),

  submit: (id: string) =>
    apiFetch(`/api/timesheets/${id}/submit`, { method: 'POST' }),

  approve: (id: string, approverId: string) =>
    apiFetch(`/api/timesheets/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverId }),
    }),

  reject: (id: string, rejecterId: string, reason: string) =>
    apiFetch(`/api/timesheets/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejecterId, reason }),
    }),

  delete: (id: string) =>
    apiFetch(`/api/timesheets/${id}`, { method: 'DELETE' }),
}

// ============================================
// TRAVEL FORM APIs
// ============================================

export type TransportType =
  | 'PERSONAL_VEHICLE'
  | 'PUBLIC_TRANSPORT_WINNIPEG'
  | 'PUBLIC_TRANSPORT_THOMPSON'
  | 'COMBINATION'

export interface TravelForm {
  id: string
  userId: string
  name: string
  destination: string
  departureDate: string
  returnDate: string
  reasonsForTravel: string
  hotelRate: number
  hotelNights: number
  hotelTotal: number
  privateRate: number
  privateNights: number
  privateTotal: number
  breakfastRate: number
  breakfastDays: number
  breakfastTotal: number
  lunchRate: number
  lunchDays: number
  lunchTotal: number
  dinnerRate: number
  dinnerDays: number
  dinnerTotal: number
  incidentalRate: number
  incidentalDays: number
  incidentalTotal: number
  transportationType: TransportType
  personalVehicleRate: number
  licensePlateNumber?: string
  oneWayWinnipegKm: number
  oneWayWinnipegTrips: number
  oneWayWinnipegTotal: number
  oneWayThompsonKm: number
  oneWayThompsonTrips: number
  oneWayThompsonTotal: number
  publicTransportTotal: number
  taxiFareRate: number
  taxiFareDays: number
  taxiFareTotal: number
  parkingTotal: number
  grandTotal: number
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  notes?: string
  submittedAt?: string
  approvedAt?: string
  approverId?: string
  rejectedAt?: string
  rejecterId?: string
  rejectionReason?: string
  user?: {
    first_name: string
    last_name: string
    department: string
  }
}

export interface TravelRates {
  hotelRate: number
  privateRate: number
  breakfastRate: number
  lunchRate: number
  dinnerRate: number
  incidentalRate: number
  personalVehicleRate: number
  oneWayWinnipegKm: number
  oneWayThompsonKm: number
  winnipegFlatRate: number
  thompsonFlatRate: number
  taxiFareRate: number
}

export const travelFormsApi = {
  getAll: (params?: { status?: string }) => {
    const searchParams = new URLSearchParams()
    if (params?.status) searchParams.set('status', params.status)
    return apiFetch<TravelForm[]>(`/api/travel-forms?${searchParams.toString()}`)
  },

  getById: (id: string) => apiFetch<TravelForm>(`/api/travel-forms/${id}`),

  getByUser: (userId: string) =>
    apiFetch<TravelForm[]>(`/api/travel-forms/user/${userId}`),

  create: (formData: Partial<TravelForm>) =>
    apiFetch<TravelForm>('/api/travel-forms', {
      method: 'POST',
      body: JSON.stringify(formData),
    }),

  update: (id: string, formData: Partial<TravelForm>) =>
    apiFetch<TravelForm>(`/api/travel-forms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formData),
    }),

  submit: (id: string) =>
    apiFetch(`/api/travel-forms/${id}/submit`, { method: 'POST' }),

  approve: (id: string, approverId: string) =>
    apiFetch(`/api/travel-forms/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ approverId }),
    }),

  reject: (id: string, rejecterId: string, reason: string) =>
    apiFetch(`/api/travel-forms/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ rejecterId, reason }),
    }),

  delete: (id: string) =>
    apiFetch(`/api/travel-forms/${id}`, { method: 'DELETE' }),

  getRates: () => apiFetch<TravelRates>('/api/travel-forms/rates'),

  getUserStats: (userId: string) =>
    apiFetch(`/api/travel-forms/stats/${userId}`),
}

// ============================================
// MEMO APIs
// ============================================

export interface Memo {
  id: string
  title: string
  content: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  department?: string
  isPinned: boolean
  isPublished: boolean
  authorId: string
  readBy: string[]
  created: string
  updated: string
  author?: {
    first_name: string
    last_name: string
  }
}

export const memosApi = {
  getAll: () => apiFetch<Memo[]>('/api/memos'),

  getById: (id: string) => apiFetch<Memo>(`/api/memos/${id}`),

  create: (memoData: Partial<Memo>) =>
    apiFetch<Memo>('/api/memos', {
      method: 'POST',
      body: JSON.stringify(memoData),
    }),

  update: (id: string, memoData: Partial<Memo>) =>
    apiFetch<Memo>(`/api/memos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memoData),
    }),

  delete: (id: string) =>
    apiFetch(`/api/memos/${id}`, { method: 'DELETE' }),

  markAsRead: (id: string, userId: string) =>
    apiFetch(`/api/memos/${id}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    }),
}
