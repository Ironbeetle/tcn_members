'use client'

/**
 * TCN Staff App - Login Page
 */

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useStaffAuth } from '../contexts/StaffAuthContext'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Monitor } from 'lucide-react'

const DESKTOP_MIN_WIDTH = 1024

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= DESKTOP_MIN_WIDTH)
    }

    // Initial check
    checkScreenSize()

    // Listen for resize events
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  return isDesktop
}

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error, clearError } = useStaffAuth()
  const isDesktop = useIsDesktop()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError('')
    clearError()

    if (!email.trim() || !password.trim()) {
      setLocalError('Please enter both email and password')
      return
    }

    const success = await login(email, password)
    if (success) {
      // Router will redirect based on role in auth context
      router.replace('/Fq6pm72NjqUA')
    }
  }

  const displayError = localError || error

  // Show loading state while checking screen size
  if (isDesktop === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-staff-dark">
        <div className="staff-spinner w-8 h-8"></div>
      </div>
    )
  }

  // Show desktop-only message for non-desktop screens
  if (!isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-staff-dark p-6">
        <div className="text-center max-w-sm">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#2F5D9B]/20 to-[#254A7A]/20 flex items-center justify-center">
            <Monitor className="w-10 h-10 text-[#64748B]" />
          </div>
          <h1 className="text-xl font-bold text-staff-primary mb-3">Desktop Only</h1>
          <p className="text-staff-secondary leading-relaxed">
            TCN Communications Staff Portal is designed for desktop use only. 
            Please access this application from a device with a larger screen.
          </p>
          <div className="mt-6 px-4 py-2 rounded-lg bg-staff-card border border-staff-border inline-block">
            <span className="text-sm text-staff-muted">Minimum width: {DESKTOP_MIN_WIDTH}px</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-staff-dark p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#64748B] to-[#2F5D9B] flex items-center justify-center">
            <span className="text-3xl font-bold text-[#F4F7FB]">TCN</span>
          </div>
          <h1 className="text-2xl font-bold text-staff-primary">TCN Communications</h1>
          <p className="text-staff-secondary mt-1">Staff Portal Login</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="staff-card rounded-xl p-6">
            {/* Error Message */}
            {displayError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-400">{displayError}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-staff-secondary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-staff-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@tcn.ca"
                  disabled={isLoading}
                  className="staff-input staff-focus-ring w-full pl-10 pr-4 py-3 rounded-lg"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-staff-secondary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-staff-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="staff-input staff-focus-ring w-full pl-10 pr-12 py-3 rounded-lg"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-staff-muted hover:text-staff-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-staff-primary w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="staff-spinner w-5 h-5"></div>
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-staff-muted">
          Having trouble signing in? Contact IT Support
        </p>
      </div>
    </div>
  )
}
