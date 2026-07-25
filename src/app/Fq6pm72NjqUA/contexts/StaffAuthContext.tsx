'use client'

/**
 * Staff Authentication Context
 * 
 * Provides authentication state and methods for the staff app.
 * Connects to the existing /api/comm/auth/* endpoints.
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

// Types
export interface StaffUser {
  id: string
  email: string
  first_name: string
  last_name: string
  name: string
  department: Department
  role: UserRole
  loggedInAt: string
}

export type UserRole = 'STAFF' | 'STAFF_ADMIN' | 'DEPARTMENT_ADMIN' | 'FINANCE' | 'ADMIN' | 'COUNCIL'
export type Department = 
  | 'BAND_OFFICE' 
  | 'HEALTH_CENTER' 
  | 'EDUCATION_CENTER'
  | 'FINANCE'
  | 'HOUSING'
  | 'SOCIAL_SERVICES'
  | 'COMMUNITY_INFRASTRUCTURE'
  | 'OTHER'

export interface AuthState {
  user: StaffUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  verifySession: () => Promise<boolean>
  clearError: () => void
  isAdmin: boolean
  isStaffAdmin: boolean
  isDeptAdmin: boolean
  isFinance: boolean
  dashboardPath: string
}

const DEMO_BULLETIN_EMAIL = 'tcnstaff@tataskweyak.com'

/** Returns the role-specific dashboard path for login redirects */
export function getRoleDashboardPath(role?: UserRole, email?: string): string {
  if (email === DEMO_BULLETIN_EMAIL) {
    return '/Fq6pm72NjqUA/TCN_Staff_Bulletin'
  }
  switch (role) {
    case 'ADMIN':
    case 'COUNCIL':
      return '/Fq6pm72NjqUA/admin'
    case 'STAFF_ADMIN':
      return '/Fq6pm72NjqUA/staff-admin'
    case 'FINANCE':
      return '/Fq6pm72NjqUA/finance'
    case 'DEPARTMENT_ADMIN':
      return '/Fq6pm72NjqUA/dept-admin'
    case 'STAFF':
    default:
      return '/Fq6pm72NjqUA/dashboard'
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const PROFILE_KEY = 'tcn_staff_profile'
const CSRF_COOKIE_NAME = 'tcn_staff_csrf'

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null

  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith(`${name}=`))

  if (!cookie) return null
  return decodeURIComponent(cookie.split('=').slice(1).join('='))
}

export function StaffAuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  })

  // Computed properties
  const isAdmin = state.user?.role === 'ADMIN' || state.user?.role === 'COUNCIL'
  const isStaffAdmin = state.user?.role === 'STAFF_ADMIN' || state.user?.role === 'DEPARTMENT_ADMIN' || state.user?.role === 'FINANCE' || isAdmin
  const isDeptAdmin = state.user?.role === 'DEPARTMENT_ADMIN'
  const isFinance = state.user?.role === 'FINANCE'
  const dashboardPath = getRoleDashboardPath(state.user?.role, state.user?.email)

  // Load session from storage on mount
  useEffect(() => {
    const loadSession = async () => {
      const stored = localStorage.getItem(PROFILE_KEY)
      if (stored) {
        try {
          const session = JSON.parse(stored) as StaffUser
          const verifiedUser = await verifySessionToken(session.loggedInAt)
          if (verifiedUser) {
            setState({
              user: verifiedUser,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            })
            return
          }
          localStorage.removeItem(PROFILE_KEY)
        } catch (err) {
          console.error('Failed to load session:', err)
          localStorage.removeItem(PROFILE_KEY)
        }
      } else {
        const verifiedUser = await verifySessionToken()
        if (verifiedUser) {
          localStorage.setItem(PROFILE_KEY, JSON.stringify(verifiedUser))
          setState({
            user: verifiedUser,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return
        }
      }

      setState(prev => ({ ...prev, isLoading: false }))
    }
    loadSession()
  }, [])

  const verifySessionToken = async (loggedInAt?: string): Promise<StaffUser | null> => {
    try {
      const csrfToken = getCookieValue(CSRF_COOKIE_NAME)
      const res = await fetch('/api/comm/auth/verify', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({}),
      })

      const data = await res.json()

      if (!data.success || !data.data?.valid || !data.data?.user) {
        return null
      }

      return {
        ...data.data.user,
        name: `${data.data.user.first_name} ${data.data.user.last_name}`,
        loggedInAt: loggedInAt || new Date().toISOString(),
      }
    } catch {
      return null
    }
  }

  // Login function
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const res = await fetch('/api/comm/auth/login', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed',
        }))
        return false
      }

      const user: StaffUser = {
        ...data.data.user,
        name: `${data.data.user.first_name} ${data.data.user.last_name}`,
        loggedInAt: new Date().toISOString(),
      }

      localStorage.setItem(PROFILE_KEY, JSON.stringify(user))

      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      })

      return true
    } catch (e) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error. Please try again.',
      }))
      return false
    }
  }, [])

  // Logout function
  const logout = useCallback(async () => {
    // Clear local state immediately
    localStorage.removeItem(PROFILE_KEY)
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    })

    // Notify server (best effort)
    try {
      const csrfToken = getCookieValue(CSRF_COOKIE_NAME)
      await fetch('/api/comm/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({}),
      })
    } catch {
      // Ignore logout errors
    }

    router.push('/Fq6pm72NjqUA/login')
  }, [router])

  // Verify current session
  const verifySession = useCallback(async (): Promise<boolean> => {
    const verifiedUser = await verifySessionToken(state.user?.loggedInAt)
    if (!verifiedUser) {
      localStorage.removeItem(PROFILE_KEY)
      setState(prev => ({
        ...prev,
        user: null,
        isAuthenticated: false,
      }))
      return false
    }

    localStorage.setItem(PROFILE_KEY, JSON.stringify(verifiedUser))
    setState(prev => ({
      ...prev,
      user: verifiedUser,
      isAuthenticated: true,
    }))

    return true
  }, [state.user?.loggedInAt])

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        verifySession,
        clearError,
        isAdmin,
        isStaffAdmin,
        isDeptAdmin,
        isFinance,
        dashboardPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useStaffAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider')
  }
  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options?: { requireAdmin?: boolean; requireStaffAdmin?: boolean }
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading, isAdmin, isStaffAdmin } = useStaffAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.push('/Fq6pm72NjqUA/login')
        } else if (options?.requireAdmin && !isAdmin) {
          router.push('/Fq6pm72NjqUA/dashboard')
        } else if (options?.requireStaffAdmin && !isStaffAdmin) {
          router.push('/Fq6pm72NjqUA/dashboard')
        }
      }
    }, [isAuthenticated, isLoading, isAdmin, isStaffAdmin, router])

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-staff-dark">
          <div className="staff-spinner w-10 h-10"></div>
        </div>
      )
    }

    if (!isAuthenticated) {
      return null
    }

    return <Component {...props} />
  }
}
